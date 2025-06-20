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

  // Step 3 - High care prompt
  bool wantsHighCareAccess = false;

  // Step 4 - Symptoms / Conditions
  Map<String, bool> symptoms = {
    'fever': false,
    'cough': false,
    'openWound': false,
    'nausea': false,
    'skinBoils': false,
    'skinAllergies': false,
    'diarrhea': false,
    'openSores': false,
  };
  String otherAllergies = '';
  TextEditingController recentPlacesVisitedController = TextEditingController();

  // Step 5 - Prohibited Items
  Map<String, bool> prohibitedItems = {
    'mobilePhone': false,
    'camera': false,
    'medicines': false,
    'notebook': false,
    'earrings': false,
    'ring': false,
    'id_card': false,
    'ballpen': false,
    'wristwatch': false,
    'necklace': false,
  };
  TextEditingController otherProhibitedItemController = TextEditingController();

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
      wantsHighCareAccess = false;
      symptoms.updateAll((key, value) => false);
      prohibitedItems.updateAll((key, value) => false);
      otherAllergies = '';
      recentPlacesVisitedController.clear();
      otherProhibitedItemController.clear();
    });

    fetchHighestVisitorId();
    fetchVisitPurposes();
    fetchTimeSlots();
  }

  Future<void> fetchHighestVisitorId() async {
    try {
      final response =
          await http.get(Uri.parse('$baseUrl/visitors/highest-id'));
      final data = jsonDecode(response.body);
      setState(() {
        newVisitorId = data['highestId'] + 1;
      });
    } catch (e) {
      print('Error fetching visitor ID: $e');
    }
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
    final recentPlacesVisited = recentPlacesVisitedController.text;
    final otherProhibitedItem = otherProhibitedItemController.text;

    // Validation logic (mimic web behavior)
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

    final bool isHighCareVisit = wantsHighCareAccess;

    // Base payload
    final Map<String, dynamic> visitorData = {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'contactNumber': contactNumber,
      'address': address,
      'visitedEmployeeId': widget.host['id'],
      'visitPurposeId': visitPurposeId,
      'selectedTimeSlot': selectedTimeSlotId,
      'isHighCare': isHighCareVisit ? "Yes" : "No",
      'deviceType': deviceType,
      'deviceBrand': deviceBrand,
    };

    // Add high care-specific fields if necessary
    if (isHighCareVisit && step >= 4) {
      visitorData.addAll({
        'fever': symptoms['fever'] ?? false,
        'cough': symptoms['cough'] ?? false,
        'openWound': symptoms['openWound'] ?? false,
        'nausea': symptoms['nausea'] ?? false,
        'otherAllergies': otherAllergies,
        'recentPlaces': recentPlacesVisited,
        'skinBoils': symptoms['skinBoils'] ?? false,
        'skinAllergies': symptoms['skinAllergies'] ?? false,
        'diarrhea': symptoms['diarrhea'] ?? false,
        'openSores': symptoms['openSores'] ?? false,
        'mobilePhone': prohibitedItems['mobilePhone'] ?? false,
        'camera': prohibitedItems['camera'] ?? false,
        'medicines': prohibitedItems['medicines'] ?? false,
        'notebook': prohibitedItems['notebook'] ?? false,
        'earrings': prohibitedItems['earrings'] ?? false,
        'otherProhibited': otherProhibitedItem,
        'necklace': prohibitedItems['necklace'] ?? false,
        'ring': prohibitedItems['ring'] ?? false,
        'id_card': prohibitedItems['id_card'] ?? false,
        'ballpen': prohibitedItems['ballpen'] ?? false,
        'wristwatch': prohibitedItems['wristwatch'] ?? false,
      });
    }

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
                    child: (profileImage != null && profileImage!.isNotEmpty)
                        ? Image.network(
                            profileImage!,
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
            if (step != 3) _buildNavigationButtons(),
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
      case 3:
        return _buildStep3();
      case 4:
        return _buildStep4();
      case 5:
        return _buildStep5();
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
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 12),
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
        const SizedBox(height: 12),
        // Time slots grid
        GridView.builder(
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
              onTap: () => setState(() => selectedTimeSlotId = slot['id']),
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
                      const Icon(Icons.check, color: Colors.white, size: 16),
                    if (isSelected) const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        timeString,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
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

    return Column(
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
                  children: [
                    Icon(
                      device['icon'] as IconData,
                      size: 32,
                      color: Colors.grey[700],
                    ),
                    const SizedBox(height: 8),
                    Checkbox(
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
    );
  }

  Widget _buildStep3() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Text(
          "Do you want to enter the high care area?",
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 24),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                setState(() {
                  wantsHighCareAccess = true;
                  step = 4;
                });
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryColor,
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('Yes'),
            ),
            const SizedBox(width: 16),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  wantsHighCareAccess = false;
                });
                submit();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.grey[400],
                foregroundColor: Colors.white,
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('No'),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStep4() {
    final symptomList = [
      {'label': 'Fever', 'key': 'fever'},
      {'label': 'Cough', 'key': 'cough'},
      {'label': 'Open wounds', 'key': 'openWound'},
      {'label': 'Skin Boils', 'key': 'skinBoils'},
      {'label': 'Skin Allergies', 'key': 'skinAllergies'},
      {'label': 'Diarrhea', 'key': 'diarrhea'},
      {'label': 'Nausea', 'key': 'nausea'},
      {'label': 'Open Sores', 'key': 'openSores'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "HEALTH AND PROHIBITED PERSONAL ITEMS DECLARATION",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          "Do you have any of the following symptoms or physical conditions?",
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        // Symptoms grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: symptomList.length,
          itemBuilder: (context, index) {
            final symptom = symptomList[index];
            final key = symptom['key'] as String;
            final label = symptom['label'] as String;
            final isSelected = symptoms[key] ?? false;

            return GestureDetector(
              onTap: () {
                setState(() {
                  symptoms[key] = !isSelected;
                });
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? primaryColor : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? primaryColor : Colors.grey[300]!,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        label,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
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
        const SizedBox(height: 16),
        TextField(
          decoration: InputDecoration(
            hintText: "Allergies / use (,) to separate if multiple",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
          onChanged: (value) => setState(() => otherAllergies = value),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: recentPlacesVisitedController,
          decoration: InputDecoration(
            hintText: "Place/s visited for the past 7 days",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildStep5() {
    final prohibitedList = [
      {'label': 'Mobile Phone', 'key': 'mobilePhone'},
      {'label': 'Necklace', 'key': 'necklace'},
      {'label': 'Camera', 'key': 'camera'},
      {'label': 'Ring', 'key': 'ring'},
      {'label': 'Medicines', 'key': 'medicines'},
      {'label': 'ID', 'key': 'id_card'},
      {'label': 'Notebook', 'key': 'notebook'},
      {'label': 'Ballpen', 'key': 'ballpen'},
      {'label': 'Earrings', 'key': 'earrings'},
      {'label': 'Wristwatch', 'key': 'wristwatch'},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "HEALTH AND PROHIBITED PERSONAL ITEMS DECLARATION",
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 8),
        const Text(
          "Do you possess any of the following prohibited items?",
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        // Prohibited items grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 3,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: prohibitedList.length,
          itemBuilder: (context, index) {
            final item = prohibitedList[index];
            final key = item['key'] as String;
            final label = item['label'] as String;
            final isSelected = prohibitedItems[key] ?? false;

            return GestureDetector(
              onTap: () {
                setState(() {
                  prohibitedItems[key] = !isSelected;
                });
              },
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? primaryColor : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected ? primaryColor : Colors.grey[300]!,
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        label,
                        style: TextStyle(
                          color: isSelected ? Colors.white : Colors.black,
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
        const SizedBox(height: 16),
        TextField(
          controller: otherProhibitedItemController,
          decoration: InputDecoration(
            hintText: "Item/s (use , to separate if multiple)",
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
            ),
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          ),
        ),
      ],
    );
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
            ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                if (step < 5) {
                  step += 1;
                } else {
                  submit();
                }
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(step == 5 ? 'Submit' : 'Next'),
          ),
        ],
      ),
    );
  }
}
