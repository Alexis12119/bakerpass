import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../schedule_option.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

final baseUrl = dotenv.env['BASE_URL'] ?? '';

void showProfilePopup(
    BuildContext context, int hostId, String name, String department) async {
  List<dynamic> timeSlots = [];

  try {
    final res = await http.get(
      Uri.parse("$baseUrl/hosts/$hostId/available-timeslots"),
    );

    if (res.statusCode == 200) {
      timeSlots = json.decode(res.body);
    } else {
      // Handle error response
    }
  } catch (e) {
    print("Error: $e");
  }

  showDialog(
    context: context,
    builder: (BuildContext context) {
      return Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: Colors.white,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(20)),
              child: Image.asset(
                'assets/images/jiro.jpg',
                fit: BoxFit.cover,
                height: 200,
                width: double.infinity,
              ),
            ),
            const SizedBox(height: 16),
            Text(name,
                style:
                    const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text(department),
            const SizedBox(height: 12),
            const Text("Time Availability",
                style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 10),

            // Render fetched time slots
            ...timeSlots.map((slot) {
              final time = "${slot['start_time']} - ${slot['end_time']}";
              return ScheduleOption(time: time, isSelected: false);
            }),

            const SizedBox(height: 12),
            IconButton(
              icon: const Icon(Icons.exit_to_app, color: Color(0xFF1C274C)),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        ),
      );
    },
  );
}

class ScheduleOption extends StatefulWidget {
  final String time;
  final bool isSelected;

  const ScheduleOption(
      {super.key, required this.time, required this.isSelected});

  @override
  State<ScheduleOption> createState() => _ScheduleOptionState();
}

class _ScheduleOptionState extends State<ScheduleOption> {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: widget.isSelected
            ? const Color(0xFF1C274C)
            : const Color(0xFFE0E0E0),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
      child: Row(
        children: [
          Icon(
            widget.isSelected
                ? Icons.radio_button_checked
                : Icons.radio_button_unchecked,
            color: widget.isSelected ? Colors.white : Colors.grey,
          ),
          const SizedBox(width: 12),
          Text(
            widget.time,
            style: TextStyle(
              color: widget.isSelected ? Colors.white : Colors.black,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
