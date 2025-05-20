import 'package:flutter/material.dart';

class FeatureIcon extends StatefulWidget {
  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  const FeatureIcon({super.key, required this.icon, required this.label, this.onTap});

  @override
  State<FeatureIcon> createState() => _FeatureIconState();
}

class _FeatureIconState extends State<FeatureIcon> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: Column(
        children: [
          CircleAvatar(
            backgroundColor: Colors.indigo[900],
            child: Icon(widget.icon, color: Colors.white),
          ),
          const SizedBox(height: 8),
          Text(widget.label),
        ],
      ),
    );
  }
}


