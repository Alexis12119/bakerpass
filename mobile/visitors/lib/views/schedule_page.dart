import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'home_page.dart';
import 'profile_page.dart';
import 'visit_history.dart';
import 'package:http/http.dart' as http;
import 'package:visitors/models/Visit.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:intl/intl.dart';

class SchedulePage extends StatefulWidget {
  const SchedulePage({super.key});

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  Visit? visit;
  bool isLoading = true;
  String? userId;
  WebSocketChannel? channel;
  final String baseUrl = dotenv.env['BASE_URL'] ?? '';

  String formatTimeToAmPm(String timeStr) {
    final time = DateFormat("HH:mm:ss").parse(timeStr);
    return DateFormat("hh:mm a")
        .format(time)
        .replaceAll("AM", "A.M.")
        .replaceAll("PM", "P.M.");
  }

  @override
  void initState() {
    super.initState();
    loadUserIdAndFetchVisit().then((_) {
      if (userId != null) {
        connectWebSocket();
      }
    });
  }

  void connectWebSocket() {
    final base = baseUrl.replaceFirst('/api', '');
    final wsUrl = '${base.replaceFirst('http', 'ws')}/ws/updates';

    channel = WebSocketChannel.connect(Uri.parse(wsUrl));

    channel!.stream.listen((message) {
      if (message == 'update' && userId != null) {
        fetchVisit(userId!);
      }
    }, onError: (error) {
      print('WebSocket error: $error');
    }, onDone: () {
      print('WebSocket closed');
    });
  }

  @override
  void dispose() {
    channel?.sink.close(status.goingAway);
    super.dispose();
  }

  Future<void> fetchVisit(String userId) async {
    try {
      print('Fetching visit for userId: $userId');
      final url = '$baseUrl/visitor-schedule?id=$userId';

      final response = await http.get(Uri.parse(url));
      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        // Check if data is not empty and contains required fields
        if (data != null && data is Map<String, dynamic>) {
          try {
            final visitData = Visit.fromJson(data);
            setState(() {
              visit = visitData;
              isLoading = false;
            });
          } catch (parseError) {
            setState(() {
              visit = null;
              isLoading = false;
            });
          }
        } else {
          print('Data is null, empty, or not a Map');
          setState(() {
            visit = null;
            isLoading = false;
          });
        }
      } else if (response.statusCode == 404) {
        print('No visit found (404)');
        setState(() {
          visit = null;
          isLoading = false;
        });
      } else {
        print('Unexpected error: ${response.statusCode} - ${response.body}');
        setState(() {
          visit = null;
          isLoading = false;
        });
      }
    } catch (e) {
      print('Network/Exception error: $e');
      setState(() {
        visit = null;
        isLoading = false;
      });
    }
  }

  Future<void> loadUserIdAndFetchVisit() async {
    final prefs = await SharedPreferences.getInstance();
    userId = prefs.getInt('userId')?.toString();

    if (userId != null) {
      await fetchVisit(userId!);
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
          child: RefreshIndicator(
            onRefresh: () => fetchVisit(userId ?? ''),
            child: ListView(
              padding: const EdgeInsets.only(bottom: 100),
              physics: const AlwaysScrollableScrollPhysics(),
              children: [
                const SizedBox(height: 20),
                const Center(
                  child: Text(
                    'SCHEDULE',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1C274C),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 20),
                  padding:
                      const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1C274C),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.calendar_today_outlined,
                        color: Colors.white,
                        size: 60,
                      ),
                      const SizedBox(height: 20),
                      const Text(
                        'No Schedule Found',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'You don\'t have any scheduled visits at the moment.',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: () {
                          fetchVisit(userId ?? '');
                        },
                        icon: const Icon(Icons.refresh),
                        label: const Text("Refresh"),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF1C274C),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        bottomNavigationBar: bottomNavBar(context),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => fetchVisit(userId ?? ''),
          child: ListView(
            padding: const EdgeInsets.only(bottom: 100),
            physics: const AlwaysScrollableScrollPhysics(),
            children: [
              const SizedBox(height: 20),
              const Center(
                child: Text(
                  'SCHEDULE',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1C274C)),
                ),
              ),
              const SizedBox(height: 20),
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 20),
                padding:
                    const EdgeInsets.symmetric(vertical: 20, horizontal: 10),
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
                                time: formatTimeToAmPm(visit!.timeIn),
                                color: Colors.green,
                              ),
                              ScheduleTimeBox(
                                label: 'Expected Time Out',
                                time: formatTimeToAmPm(visit!.timeOut),
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
                                    onTap: () {},
                                    child: const Icon(Icons.check_circle,
                                        color: Color(0xFF1C274C), size: 48),
                                  )
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        fetchVisit(userId ?? '');
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text("Refresh"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF1C274C),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    )
                  ],
                ),
              )
            ],
          ),
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
