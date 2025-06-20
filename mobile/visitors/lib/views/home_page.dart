import 'package:flutter/material.dart';
import 'profile_page.dart';
import 'visit_history.dart';
import 'schedule_page.dart';
import 'home/feature_icon.dart';
import 'home/employee_card.dart';
import '../models/employee.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Employee> _employees = [];
  bool _isLoading = true;
  String _searchQuery = "";
  String? profileImage;

  @override
  void initState() {
    super.initState();
    _loadEmployees();
    _loadProfileImage();
  }

  void _loadProfileImage() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      profileImage = prefs.getString('profileImage');
    });
  }

  void _loadEmployees() async {
    setState(() => _isLoading = true);
    try {
      final employees = await ApiService.fetchEmployees(search: _searchQuery);
      setState(() {
        _employees = employees;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void showAboutUsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) {
        return Dialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.asset(
                      'assets/images/jiro.jpg', // Replace with actual path
                      height: 180,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    "1890’s",
                    style: TextStyle(
                      fontSize: 20,
                      color: Colors.orange,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    "Franklin Baker Sr., a flour miller in Philadelphia, USA, was paid a boatload of coconuts instead of cash by one of his customers. Unable to find any takers, he turned this unconventional payment into a convenient ready-to-use desiccated coconut for baking and aptly named it Baker’s Shredded Coconut.",
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.indigo[900],
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Icon(Icons.close, color: Colors.white),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final userName = "Guest";

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: 0, // Home
        selectedItemColor: Color(0xFF1C274C),
        unselectedItemColor: Colors.grey,
        onTap: (index) {
          if (index == 0) return;
          if (index == 1) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => SchedulePage()),
            );
          }
          if (index == 2) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) => VisitHistoryPage()),
            );
          }
          if (index == 3) {
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
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Good Morning!', style: TextStyle(fontSize: 16)),
              Text('Hello, $userName',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Color(0xFF1C274C),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            "Welcome to Franklin Baker, where quality and innovation meet purpose.",
                            style: TextStyle(color: Colors.white),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.grey[200],
                      child: profileImage != null && profileImage!.isNotEmpty
                          ? ClipOval(
                              child: Image.network(
                                profileImage!,
                                width: 60,
                                height: 60,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) {
                                  return const Icon(Icons.person,
                                      size: 30, color: Colors.grey);
                                },
                              ),
                            )
                          : const Icon(Icons.person,
                              size: 30, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  FeatureIcon(icon: Icons.history, label: 'History'),
                  FeatureIcon(icon: Icons.shopping_bag, label: 'Products'),
                  FeatureIcon(
                    icon: Icons.info,
                    label: 'About Us',
                    onTap: () => showAboutUsDialog(context),
                  ),
                  FeatureIcon(icon: Icons.help, label: 'FAQs'),
                ],
              ),
              const SizedBox(height: 20),
              const Text('Employee\'s Appointment',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
              const SizedBox(height: 10),
              TextField(
                onChanged: (value) {
                  setState(() {
                    _searchQuery = value;
                    _loadEmployees();
                  });
                },
                decoration: InputDecoration(
                  hintText: 'Search Host',
                  prefixIcon: Icon(Icons.search),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),
              const SizedBox(height: 20),
              _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : Expanded(
                      // This is now fine
                      child: ListView.builder(
                        itemCount: _employees.length,
                        itemBuilder: (context, index) {
                          final employee = _employees[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: EmployeeCard(
                              id: employee.id,
                              name: employee.name,
                              department: employee.department,
                              profileImage: employee.profileImage,
                            ),
                          );
                        },
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
