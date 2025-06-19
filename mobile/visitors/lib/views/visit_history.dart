import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'home_page.dart';
import 'profile_page.dart';
import 'schedule_page.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class VisitHistoryPage extends StatefulWidget {
  const VisitHistoryPage({super.key});

  @override
  State<VisitHistoryPage> createState() => _VisitHistoryPageState();
}

class _VisitHistoryPageState extends State<VisitHistoryPage> {
  List<Map<String, dynamic>> visitHistory = [];
  List<Map<String, dynamic>> filteredVisitHistory = [];
  final baseUrl = dotenv.env['BASE_URL'];
  final TextEditingController searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchVisitHistory();
    searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    searchController.removeListener(_onSearchChanged);
    searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = searchController.text.toLowerCase();
    setState(() {
      filteredVisitHistory = visitHistory.where((visit) {
        final fullName =
            "${visit['employee_first_name']} ${visit['employee_last_name']}"
                .toLowerCase();
        final department = (visit['department_name'] ?? '').toLowerCase();
        return fullName.contains(query) || department.contains(query);
      }).toList();
    });
  }

  Future<void> fetchVisitHistory() async {
    final prefs = await SharedPreferences.getInstance();
    final email = prefs.getString('email');

    final response = await http.get(Uri.parse('$baseUrl/history?email=$email'));

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        visitHistory = data.map((e) => Map<String, dynamic>.from(e)).toList();
        filteredVisitHistory = List.from(visitHistory); // initially show all
      });
    } else {
      print("Failed to fetch visit history: ${response.body}");
    }
  }

  void _showCommentDialog(Map<String, dynamic> visit) async {
    final TextEditingController commentController =
        TextEditingController(text: visit['comment'] ?? '');

    await showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('Add/Edit Comment'),
          content: TextField(
            controller: commentController,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Enter your comment here',
              border: OutlineInputBorder(),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                final comment = commentController.text.trim();
                final response = await http.post(
                  Uri.parse('$baseUrl/visit/${visit['visit_id']}/comment'),
                  headers: {'Content-Type': 'application/json'},
                  body: jsonEncode({'content': comment}),
                );

                if (response.statusCode == 200) {
                  Navigator.pop(context);
                  fetchVisitHistory(); // Refresh data
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Comment saved')),
                  );
                } else {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Failed to save comment')),
                  );
                }
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          "VISIT HISTORY",
          style: TextStyle(
            color: Color(0xFF1C274C),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              controller: searchController,
              decoration: InputDecoration(
                hintText: 'Search by name or department',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                fillColor: Colors.white,
                filled: true,
              ),
            ),
          ),
          Expanded(
            child: filteredVisitHistory.isEmpty
                ? const Center(child: Text("No visit history found"))
                : Scrollbar(
                    thumbVisibility: true,
                    child: ListView.builder(
                      itemCount: filteredVisitHistory.length,
                      itemBuilder: (context, index) {
                        final visit = filteredVisitHistory[index];
                        return Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16.0, vertical: 8),
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            padding: const EdgeInsets.all(12),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "${visit['employee_first_name']} ${visit['employee_last_name']}",
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                      Text(visit['department_name'] ??
                                          'Unknown Department'),
                                      if (visit['comment'] != null &&
                                          visit['comment']
                                              .toString()
                                              .trim()
                                              .isNotEmpty)
                                        Padding(
                                          padding:
                                              const EdgeInsets.only(top: 4.0),
                                          child: Text(
                                            "Comment: ${visit['comment']}",
                                            style: const TextStyle(
                                              fontStyle: FontStyle.italic,
                                              fontSize: 12,
                                              color: Colors.black54,
                                            ),
                                          ),
                                        ),
                                      const SizedBox(height: 4),
                                      Row(
                                        children: [
                                          _VisitTimeChip(
                                            time: visit['time_in'] ?? "N/A",
                                            isIn: true,
                                          ),
                                          const SizedBox(width: 8),
                                          _VisitTimeChip(
                                            time: visit['time_out'] ?? "N/A",
                                            isIn: false,
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.comment,
                                      color: Color(0xFF1C274C)),
                                  tooltip: 'Add/Edit Comment',
                                  onPressed: () => _showCommentDialog(visit),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 2,
        selectedItemColor: const Color(0xFF1C274C),
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          if (index == 0) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => HomePage()),
            );
          } else if (index == 1) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => SchedulePage()),
            );
          } else if (index == 2) {
            return;
          } else if (index == 3) {
            Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ProfilePage()),
            );
          }
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(
              icon: Icon(Icons.calendar_today), label: 'Schedules'),
          BottomNavigationBarItem(icon: Icon(Icons.history), label: 'History'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

class _VisitTimeChip extends StatelessWidget {
  final String time;
  final bool isIn;

  const _VisitTimeChip({required this.time, required this.isIn});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(
        time,
        style: const TextStyle(color: Colors.white),
      ),
      backgroundColor: isIn ? Colors.green : Colors.red,
    );
  }
}
