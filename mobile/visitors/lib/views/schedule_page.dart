import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'evaluate_page.dart';
import 'home_page.dart';
import 'profile_page.dart';
import 'visit_history.dart';
import 'package:http/http.dart' as http;
import 'package:visitors/models/Visit.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class SchedulePage extends StatefulWidget {
  const SchedulePage({super.key});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  Visit? visit;
  bool isLoading = true;
  String? userEmail;

  final String baseUrl = dotenv.env['BASE_URL'] ?? '';
  @override
  void initState() {
    super.initState();
    loadUserEmailAndFetchVisit();
  }

  Future<void> fetchVisit(String email) async {
    try {
      final response =
          await http.get(Uri.parse('$baseUrl/visitor-schedule?email=$email'));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          visit = Visit.fromJson(data);
          isLoading = false;
        });
      } else if (response.statusCode == 404) {
        setState(() {
          visit = null;
          isLoading = false;
        });
      } else {
        print('Unexpected error: ${response.statusCode}');
        setState(() {
          visit = null;
          isLoading = false;
        });
      }
    } catch (e) {
      print('Error: $e');
      setState(() {
        visit = null;
        isLoading = false;
      });
    }
  }

  Future<void> loadUserEmailAndFetchVisit() async {
    final prefs = await SharedPreferences.getInstance();
    userEmail = prefs.getString('email');

    if (userEmail != null && userEmail!.isNotEmpty) {
      await fetchVisit(userEmail!);
    } else {
      // Handle the case when email is not found
      setState(() {
        isLoading = false;
        visit = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (visit == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF3F6FB),
        body: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 20),
              const Text(
                'SCHEDULE',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C274C),
                ),
              ),
              const SizedBox(height: 20),
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.event_busy, size: 80, color: Colors.grey),
                      SizedBox(height: 20),
                      Text(
                        "No visit appointment found.",
                        style: TextStyle(fontSize: 16, color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: bottomNavBar(context),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),
            const Text(
              'SCHEDULE',
              style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1C274C)),
            ),
            const SizedBox(height: 20),
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF1C274C),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  QrImageView(
                    data: visit!.qrCodeData.toString(),
                    version: QrVersions.auto,
                    size: 120.0,
                    backgroundColor: Colors.white,
                  ),
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(16),
                    margin: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        infoRow('Host Name', visit!.hostName),
                        infoRow('Department', visit!.department),
                        infoRow('Purpose', visit!.purpose),
                        const SizedBox(height: 10),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            ScheduleTimeBox(
                              label: 'Expected Time In',
                              time: visit!.timeIn,
                              color: Colors.green,
                            ),
                            ScheduleTimeBox(
                              label: 'Expected Time Out',
                              time: visit!.timeOut,
                              color: Colors.red,
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Center(
                          child: Column(
                            children: [
                              Text(
                                visit!.approvalStatus,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF1C274C),
                                ),
                              ),
                              const SizedBox(height: 10),
                              if (visit!.approvalStatus == "Approved")
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                          builder: (_) => const EvaluatePage()),
                                    );
                                  },
                                  child: const Icon(Icons.check_circle,
                                      color: Color(0xFF1C274C), size: 48),
                                )
                            ],
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
      bottomNavigationBar: bottomNavBar(context),
    );
  }

  Widget infoRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label,
              style:
                  const TextStyle(fontSize: 12, color: Colors.grey, height: 1)),
          Text(value ?? 'N/A',
              style:
                  const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }

  Widget bottomNavBar(BuildContext context) {
    return BottomNavigationBar(
      currentIndex: 1,
      selectedItemColor: const Color(0xFF1C274C),
      unselectedItemColor: Colors.grey,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const HomePage()),
          );
        }
        if (index == 1) return;
        if (index == 2) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const VisitHistoryPage()),
          );
        }
        if (index == 3) {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const ProfilePage()),
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
    );
  }
}

class ScheduleTimeBox extends StatelessWidget {
  final String label;
  final String time;
  final Color color;

  const ScheduleTimeBox(
      {super.key,
      required this.label,
      required this.time,
      required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
              color: color, borderRadius: BorderRadius.circular(6)),
          child: Text(
            time,
            style: const TextStyle(color: Colors.white),
          ),
        )
      ],
    );
  }
}
