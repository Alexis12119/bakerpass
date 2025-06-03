import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
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
  String firstName = '';
  String lastName = '';
  int? visitPurposeId;
  int? selectedTimeSlotId;
  int? newVisitorId;
  List<dynamic> visitPurposes = [];
  List<dynamic> timeSlots = [];

  // Step 2 - Device selection
  bool laptop = false;
  bool phone = false;
  bool tablet = false;
  bool other = false;
  String otherDeviceBrand = '';
  String deviceBrand = '';

  // Step 3 - High care prompt
  bool wantsHighCareAccess = false;

  // Step 4 - Symptoms / Conditions
  Map<String, bool> symptoms = {
    'Fever': false,
    'Cough': false,
    'Open Wound': false,
    'Nausea': false,
    'Skin Boils': false,
    'Skin Allergies': false,
    'Diarrhea': false,
    'Open Sores': false,
  };
  String otherAllergies = '';
  // String recentPlacesVisited = '';
  TextEditingController recentPlacesVisitedController = TextEditingController();

  // Step 5 - Prohibited Items
  Map<String, bool> prohibitedItems = {
    'Mobile Phone': false,
    'Camera': false,
    'Medicines': false,
    'Notebook': false,
    'Earrings': false,
    'Ring': false,
    'ID': false,
    'Ballpen': false,
    'Wristwatch': false,
    'Necklace': false,
  };
  TextEditingController otherProhibitedItemController = TextEditingController();

  @override
  void didUpdateWidget(covariant HostDetailsModal oldWidget) {
    super.didUpdateWidget(oldWidget);
    print('didUpdateWidget called: isOpen = ${widget.isOpen}');
    if (widget.isOpen && !oldWidget.isOpen) {
      print('Initializing modal...');
      _initializeModal();
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.isOpen) {
      _initializeModal();
    }
  }

  Future<void> _initializeModal() async {
    setState(() {
      visitPurposeId = null;
      selectedTimeSlotId = null;
      laptop = false;
      phone = false;
      tablet = false;
      otherDeviceBrand = '';
      wantsHighCareAccess = false;
      symptoms.updateAll((key, value) => false);

      prohibitedItems.updateAll((key, value) => false);
      step = 1;
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
      print(Uri.parse('$baseUrl/purposes'));

      print('Purposes response: ${response.body}');
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

  // Final submission
  Future<void> submit() async {
    if (visitPurposeId == null || selectedTimeSlotId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please fill all required fields')),
      );
      return;
    }

    // Retrieve stored user data
    final prefs = await SharedPreferences.getInstance();
    final firstName = prefs.getString('firstName');
    final lastName = prefs.getString('lastName');
    final email = prefs.getString('email');
    final contactNumber = prefs.getString('contactNumber');
    final address = prefs.getString('address');
    final recentPlacesVisited = recentPlacesVisitedController.text;
    final otherProhibitedItem = otherProhibitedItemController.text;

    final visitorData = {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'contactNumber': contactNumber,
      'address': address,
      'visitedEmployeeId': widget.host['id'],
      'visitPurposeId': visitPurposeId,
      'selectedTimeSlot': selectedTimeSlotId,
      'isHighCare': wantsHighCareAccess ? "Yes" : "No",
      'fever': symptoms['Fever'] ?? false,
      'cough': symptoms['Cough'] ?? false,
      'openWound': symptoms['Open Wound'] ?? false,
      'nausea': symptoms['Nausea'] ?? false,
      'otherAllergies': otherAllergies,
      'recentPlaces': recentPlacesVisited,
      'mobilePhone': prohibitedItems['Mobile Phone'] ?? false,
      'camera': prohibitedItems['Camera'] ?? false,
      'medicines': prohibitedItems['Medicines'] ?? false,
      'notebook': prohibitedItems['Notebook'] ?? false,
      'earrings': prohibitedItems['Earrings'] ?? false,
      'otherProhibited': otherProhibitedItem,
      'skinBoils': symptoms['Skin Boils'] ?? false,
      'skinAllergies': symptoms['Skin Allergies'] ?? false,
      'openSores': symptoms['Open Sores'] ?? false,
      'diarrhea': symptoms['Diarrhea'] ?? false,
      'ring': prohibitedItems['Ring'] ?? false,
      'id_card': prohibitedItems['ID'] ?? false,
      'ballpen': prohibitedItems['Ballpen'] ?? false,
      'wristwatch': prohibitedItems['Wristwatch'] ?? false,
      'necklace': prohibitedItems['Necklace'] ?? false,
    };

    print(visitorData);

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/visits'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(visitorData),
      );

      print('Status Code: ${response.statusCode}');
      print('Response body: ${response.body}');

      if (response.statusCode == 201) {
        await widget.fetchVisitors();
        widget.onClose();
      } else {
        throw Exception('Failed to create visitor');
      }
    } catch (e) {
      print('Error submitting visitor: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to submit visitor info')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      contentPadding: const EdgeInsets.all(16),
      content: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 400),
        child: SingleChildScrollView(
          child: step == 1
              ? buildStep1()
              : step == 2
                  ? buildStep2()
                  : step == 3
                      ? buildStep3()
                      : step == 4
                          ? buildStep4()
                          : buildStep5(),
        ),
      ),
    );
  }

  Widget buildStep1() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("Visitor's Information",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 12),
        DropdownButtonFormField<int>(
          value: visitPurposeId,
          items: visitPurposes
              .map((p) => DropdownMenuItem<int>(
                    value: p['id'],
                    child: Text(p['name']),
                  ))
              .toList(),
          onChanged: (val) => setState(() => visitPurposeId = val),
          decoration: InputDecoration(labelText: 'Purpose'),
        ),
        SizedBox(height: 20),
        Text("Select Time Slot", style: TextStyle(fontWeight: FontWeight.bold)),
        ...timeSlots.map((slot) {
          final formatted =
              "${formatTime(slot['start_time'])} - ${formatTime(slot['end_time'])}";
          return ListTile(
            title: Text(formatted),
            leading: Radio<int>(
              value: slot['id'],
              groupValue: selectedTimeSlotId,
              onChanged: (val) => setState(() => selectedTimeSlotId = val),
            ),
          );
        }),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            ElevatedButton(
              onPressed: () {
                // Do something like close the modal or go back
                Navigator.pop(context); // or setState(() => step = 0);
              },
              child: Text('Back'),
            ),
            ElevatedButton(
              onPressed: (visitPurposeId == null || selectedTimeSlotId == null)
                  ? null
                  : () => setState(() => step = 2),
              child: Text('Next'),
            ),
          ],
        ),
      ],
    );
  }

  Widget buildStep2() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Select Devices",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        CheckboxListTile(
          title: Text("Laptop"),
          value: laptop,
          onChanged: (val) => setState(() => laptop = val!),
        ),
        CheckboxListTile(
          title: Text("Phone"),
          value: phone,
          onChanged: (val) => setState(() => phone = val!),
        ),
        CheckboxListTile(
          title: Text("Tablet"),
          value: tablet,
          onChanged: (val) => setState(() => tablet = val!),
        ),

        // Replace "Others" checkbox with text field
        SizedBox(height: 10),
        Text("Other Device (optional)",
            style: TextStyle(fontWeight: FontWeight.bold)),
        TextField(
          decoration: InputDecoration(
            hintText: "Enter device",
            border: OutlineInputBorder(),
          ),
          onChanged: (val) => setState(() => otherDeviceBrand = val),
        ),
        SizedBox(height: 10),
        Text("Brand Name", style: TextStyle(fontWeight: FontWeight.bold)),
        TextField(
          decoration: InputDecoration(
            hintText: "Enter brand",
            border: OutlineInputBorder(),
          ),
          onChanged: (val) => setState(() => deviceBrand = val),
        ),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.end,
          children: [
            ElevatedButton(
              onPressed: () {
                // Proceed to next step
                setState(() => step = 3);
              },
              child: Text('Next'),
            ),
          ],
        ),
      ],
    );
  }

  Widget buildStep3() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("High Care Access",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 12),
        Text("Does the visitor want to request high care access?"),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () {
                setState(() {
                  wantsHighCareAccess = true;
                  step = 4; // proceed to symptoms modal
                });
              },
              child: Text('Yes'),
            ),
            SizedBox(width: 20),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  wantsHighCareAccess = false;
                  step = 6; // skip to final submission (we’ll use 6 for submit)
                });
                submit();
              },
              child: Text('No'),
            ),
          ],
        ),
        SizedBox(height: 20),
        ElevatedButton(
            onPressed: () => setState(() => step = 2), child: Text('Back')),
      ],
    );
  }

  Widget buildStep4() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("Symptoms / Conditions",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 12),
        ...symptoms.keys.map((key) {
          return CheckboxListTile(
            title: Text(key),
            value: symptoms[key],
            onChanged: (val) => setState(() => symptoms[key] = val ?? false),
          );
        }),
        TextField(
          decoration: InputDecoration(labelText: "Other Allergies"),
          onChanged: (val) => setState(() => otherAllergies = val),
        ),
        TextField(
          decoration:
              InputDecoration(labelText: "Places Visited (past 7 days)"),
          controller: recentPlacesVisitedController,
        ),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            ElevatedButton(
                onPressed: () => setState(() => step = 3), child: Text('Back')),
            ElevatedButton(
                onPressed: () => setState(() => step = 5), child: Text('Next')),
          ],
        ),
      ],
    );
  }

  Widget buildStep5() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text("Prohibited Items",
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        SizedBox(height: 12),
        ...prohibitedItems.keys.map((key) {
          return CheckboxListTile(
            title: Text(key),
            value: prohibitedItems[key],
            onChanged: (val) =>
                setState(() => prohibitedItems[key] = val ?? false),
          );
        }),
        TextField(
          decoration: InputDecoration(labelText: "Other Prohibited Items"),
          controller: otherProhibitedItemController,
        ),
        SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            ElevatedButton(
                onPressed: () => setState(() => step = 4), child: Text('Back')),
            ElevatedButton(
              onPressed: () async {
                await submit();
              },
              child: Text('Submit'),
            ),
          ],
        ),
      ],
    );
  }
}
