import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/material.dart';
import 'package:visitors/views/home/dialogs/hostdetails.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class EmployeeCard extends StatefulWidget {
  final int id;
  final String name;
  final String department;
  final String profileImage;

  const EmployeeCard(
      {super.key,
      required this.id,
      required this.name,
      required this.department,
      required this.profileImage});

  @override
  State<EmployeeCard> createState() => _EmployeeCardState();
}

class _EmployeeCardState extends State<EmployeeCard> {
  final baseUrl = dotenv.env['BASE_URL'] ?? '';

  bool showHostDetails = false;

  Future<List<Map<String, dynamic>>> fetchVisitors(
      {bool forNurse = false}) async {
    final endpoint =
        forNurse ? '$baseUrl/nurses/high-care-visits' : '$baseUrl/visitors';

    try {
      final response = await http.get(Uri.parse(endpoint));
      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);

        // Map each visitor to a simplified structure
        final visitors = data.map<Map<String, dynamic>>((visitor) {
          return {
            'id': visitor['visit_id'],
            'name':
                '${visitor['visitorFirstName']} ${visitor['visitorLastName']}',
            'purpose': visitor['purpose'],
            'host':
                '${visitor['employeeFirstName']} ${visitor['employeeLastName']}',
            'department': visitor['employeeDepartment'],
            'expectedTime': visitor['expected_time'] ??
                '${visitor['time_in']} - ${visitor['time_out']}',
            'timeIn': visitor['time_in'],
            'timeOut': visitor['time_out'],
            'status': visitor['status'],
            'profileImageUrl': visitor['profile_image_url'],
            'approvalStatus': visitor['approval_status'],
            'isDropdownOpen': false,
          };
        }).toList();

        return visitors;
      } else {
        throw Exception('Failed to fetch visitors');
      }
    } catch (e) {
      print('Error fetching visitors: $e');
      return [];
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 30,
            backgroundColor: Colors.grey[200],
            child: widget.profileImage.isNotEmpty
                ? ClipOval(
                    child: Image.network(
                      widget.profileImage,
                      fit: BoxFit.cover,
                      width: 60,
                      height: 60,
                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(Icons.person,
                            size: 30, color: Colors.grey);
                      },
                    ),
                  )
                : const Icon(Icons.person, size: 30, color: Colors.grey),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(widget.name,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                Text(widget.department),
                const SizedBox(height: 4),
                Row(
                  children: const [
                    Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                    SizedBox(width: 4),
                    Text('10 years', style: TextStyle(fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (BuildContext context) {
                  return HostDetailsModal(
                    isOpen: true,
                    onClose: () {
                      Navigator.of(context).pop(); // Close dialog
                    },
                    host: {
                      'id': widget.id,
                      'name': widget.name,
                      'department': widget.department,
                      'profileImage': widget.profileImage,
                    },
                    fetchVisitors: () async {
                      await fetchVisitors();
                      setState(() {}); // Optional: refresh data if needed
                    },
                  );
                },
              );
            },
            child: const Text('View Profile'),
          ),
        ],
      ),
    );
  }
}
