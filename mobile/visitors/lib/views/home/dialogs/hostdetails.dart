// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

class HostDetailsModal extends StatefulWidget {
  final bool isOpen;
  final VoidCallback onClose;
  final Map<String, dynamic> host;
  final Future<void> Function() fetchVisitors;

  const HostDetailsModal({
    super.key,
    required this.isOpen,
    required this.onClose,
    required this.host,
    required this.fetchVisitors,
  });

  @override
  HostDetailsModalState createState() => HostDetailsModalState();
}

class HostDetailsModalState extends State<HostDetailsModal> {
  final baseUrl = dotenv.env['BASE_URL'] ?? '';

  // Step tracking
  int step = 1;

  // Step 1 - Visitor info & time slot
  int? visitPurposeId;
  int? selectedTimeSlotId;
  int? newVisitorId;
  List<dynamic> visitPurposes = [];
  List<dynamic> timeSlots = [];
  String? profileImage;

  // Step 2 - Device selection
  List<String> selectedDevices = [];
  String otherDevice = '';
  String deviceBrand = '';

  // Colors matching your web UI
  static const Color primaryColor = Color(0xFF1C274C);
  static const Color backgroundColor = Color(0xFF0D1F72);

  @override
  void didUpdateWidget(covariant HostDetailsModal oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isOpen && !oldWidget.isOpen) {
      _initializeModal();
    }
  }

  @override
  void initState() {
    super.initState();
    _loadProfileImage();
    if (widget.isOpen) {
      _initializeModal();
    }
  }

  Future<void> _loadProfileImage() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      profileImage = prefs.getString('profileImage');
    });
  }

  Future<void> _initializeModal() async {
    setState(() {
      step = 1;
      visitPurposeId = null;
      selectedTimeSlotId = null;
      selectedDevices = [];
      otherDevice = '';
      deviceBrand = '';
    });

    fetchVisitPurposes();
    fetchTimeSlots();
  }

  Future<void> fetchVisitPurposes() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/purposes'));
      final data = jsonDecode(response.body);
      setState(() {
        visitPurposes = data;
      });
    } catch (e) {
      print('Error fetching purposes: $e');
    }
  }

  Future<void> fetchTimeSlots() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/hosts/${widget.host['id']}/available-timeslots'),
      );
      final data = jsonDecode(response.body);
      setState(() {
        timeSlots = data;
      });
    } catch (e) {
      print('Error fetching time slots: $e');
    }
  }

  String formatTime(String time) {
    final parts = time.split(":");
    final hour = int.parse(parts[0]);
    final minute = int.parse(parts[1]);
    final date = DateTime(0, 0, 0, hour, minute);
    return TimeOfDay.fromDateTime(date).format(context);
  }

  Future<void> submit() async {
    final prefs = await SharedPreferences.getInstance();
    final firstName = prefs.getString('firstName') ?? '';
    final lastName = prefs.getString('lastName') ?? '';
    final email = prefs.getString('email') ?? '';
    final contactNumber = prefs.getString('contactNumber') ?? '';
    final address = prefs.getString('address') ?? '';

    // Validation logic
    if (firstName.isEmpty ||
        lastName.isEmpty ||
        visitPurposeId == null ||
        selectedTimeSlotId == null ||
        selectedDevices.isEmpty ||
        deviceBrand.isEmpty ||
        (selectedDevices.contains("Others") && otherDevice.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields.')),
      );
      return;
    }

    // Build device type string
    String deviceType = selectedDevices.contains('Others')
        ? [...selectedDevices.where((d) => d != 'Others'), otherDevice]
            .join(', ')
        : selectedDevices.join(', ');

    // Simplified payload without high care fields
    final Map<String, dynamic> visitorData = {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'contactNumber': contactNumber,
      'address': address,
      'visitedEmployeeId': widget.host['id'],
      'visitPurposeId': visitPurposeId,
      'selectedTimeSlot': selectedTimeSlotId,
      'deviceType': deviceType,
      'deviceBrand': deviceBrand,
    };

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/visits'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(visitorData),
      );

      if (response.statusCode == 201) {
        await widget.fetchVisitors();
        widget.onClose();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Visit created successfully')),
          );
        }
      } else {
        throw Exception('Failed to create visitor');
      }
    } catch (e) {
      print('Error submitting visitor: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to submit visitor info')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400, maxHeight: 600),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black, width: 1),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Host Profile Header
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: backgroundColor,
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12),
                  topRight: Radius.circular(12),
                ),
              ),
              child: Column(
                children: [
                  // Close button
                  Align(
                    alignment: Alignment.topRight,
                    child: GestureDetector(
                      onTap: widget.onClose,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.close,
                          color: primaryColor,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Profile image from localStorage
                  Container(
                    width: 80,
                    height: 80,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: (widget.host['profileImage'] != null &&
                            widget.host['profileImage'].isNotEmpty)
                        ? Image.network(
                            widget.host['profileImage'],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(Icons.person,
                                  size: 40, color: primaryColor);
                            },
                          )
                        : const Icon(Icons.person,
                            size: 40, color: primaryColor),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    widget.host['name'] ?? 'Host',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    widget.host['department'] ?? '',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            // Content
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: _buildStepContent(),
                ),
              ),
            ),
            // Navigation buttons
            _buildNavigationButtons(),
          ],
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (step) {
      case 1:
        return _buildStep1();
      case 2:
        return _buildStep2();
      default:
        return _buildStep1();
    }
  }

  Widget _buildStep1() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Visitor's Information",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 12),

        // ✅ Visitor name display
        FutureBuilder<SharedPreferences>(
          future: SharedPreferences.getInstance(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done &&
                snapshot.hasData) {
              final prefs = snapshot.data!;
              final firstName = prefs.getString('firstName') ?? '';
              final lastName = prefs.getString('lastName') ?? '';
              return Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Text(
                  'Name: $firstName $lastName',
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.black,
                  ),
                ),
              );
            }
            return const SizedBox.shrink();
          },
        ),

        // Purpose dropdown
        DropdownButtonFormField<int>(
          value: visitPurposeId,
          decoration: InputDecoration(
            hintText: 'Purpose',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Colors.grey),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: primaryColor, width: 2),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
          items: visitPurposes
              .map((p) => DropdownMenuItem<int>(
                    value: p['id'],
                    child: Text(p['name']),
                  ))
              .toList(),
          onChanged: (val) => setState(() => visitPurposeId = val),
        ),

        const SizedBox(height: 20),
        const Text(
          "Host's Time Availability",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 20),

        // Time slots grid or fallback message
        timeSlots.isEmpty
            ? const Text(
                'No available time slots.',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.redAccent,
                ),
              )
            : GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 3,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: timeSlots.length,
                itemBuilder: (context, index) {
                  final slot = timeSlots[index];
                  final isSelected = selectedTimeSlotId == slot['id'];
                  final timeString =
                      "${formatTime(slot['start_time'])} - ${formatTime(slot['end_time'])}";

                  return GestureDetector(
                    onTap: () =>
                        setState(() => selectedTimeSlotId = slot['id']),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor : Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected ? primaryColor : Colors.grey[300]!,
                        ),
                      ),
                      child: Row(
                        children: [
                          if (isSelected)
                            const Icon(Icons.check,
                                color: Colors.white, size: 16),
                          if (isSelected) const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              timeString,
                              style: TextStyle(
                                color:
                                    isSelected ? Colors.white : Colors.black87,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
      ],
    );
  }

  Widget _buildStep2() {
    final devices = [
      {'name': 'Laptop', 'icon': Icons.laptop},
      {'name': 'Phone', 'icon': Icons.smartphone},
      {'name': 'Tablet', 'icon': Icons.tablet},
      {'name': 'Others', 'icon': Icons.inventory},
    ];

    return SingleChildScrollView(
        child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Devices to be brought (Select all that apply)",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 16),
        // Device selection grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
          ),
          itemCount: devices.length,
          itemBuilder: (context, index) {
            final device = devices[index];
            final deviceName = device['name'] as String;
            final isSelected = selectedDevices.contains(deviceName);

            return GestureDetector(
              onTap: () {
                setState(() {
                  if (isSelected) {
                    selectedDevices.remove(deviceName);
                  } else {
                    selectedDevices.add(deviceName);
                  }
                });
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      device['icon'] as IconData,
                      size: 32,
                      color: Colors.grey[700],
                    ),
                    const SizedBox(height: 4),
                    Flexible(
                      child: Checkbox(
                        value: isSelected,
                        onChanged: (value) {
                          setState(() {
                            if (value == true) {
                              selectedDevices.add(deviceName);
                            } else {
                              selectedDevices.remove(deviceName);
                            }
                          });
                        },
                        activeColor: primaryColor,
                      ),
                    ),
                    Text(
                      deviceName.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        const SizedBox(height: 16),
        // Other device input
        if (selectedDevices.contains('Others'))
          Column(
            children: [
              TextField(
                decoration: InputDecoration(
                  hintText: 'Specify other devices',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                  contentPadding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                ),
                onChanged: (value) => setState(() => otherDevice = value),
              ),
              const SizedBox(height: 12),
            ],
          ),
        // Brand input
        TextField(
          decoration: InputDecoration(
            hintText: "Brand's / use (,) to separate if multiple",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
          onChanged: (value) => setState(() => deviceBrand = value),
        ),
      ],
    ));
  }

  Widget _buildNavigationButtons() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (step > 1)
            ElevatedButton(
              onPressed: () {
                setState(() {
                  step -= 1;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[300],
                foregroundColor: Colors.black,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Back'),
            )
          else
            const SizedBox.shrink(), // Empty space when no back button
          ElevatedButton(
            onPressed: () {
              if (step < 2) {
                if (visitPurposeId == null || selectedTimeSlotId == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                        content:
                            Text('Please select a purpose and time slot.')),
                  );
                  return;
                }

                setState(() {
                  step += 1;
                });
              } else {
                // Step 2 Submit
                submit();
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(step == 2 ? 'Submit' : 'Next'),
          ),
        ],
      ),
    );
  }
}
