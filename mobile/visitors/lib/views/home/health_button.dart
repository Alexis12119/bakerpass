import 'package:flutter/material.dart';

class HealthButton extends StatefulWidget {
  final String label;
  const HealthButton({super.key, required this.label});

  @override
  State<HealthButton> createState() => _HealthButtonState();
}

class _HealthButtonState extends State<HealthButton> {
  bool selected = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => selected = !selected),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: selected ? Colors.indigo[900] : Colors.white,
          border: Border.all(color: Colors.indigo),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Text(
          widget.label,
          style: TextStyle(
            color: selected ? Colors.white : Colors.indigo,
          ),
        ),
      ),
    );
  }
}


