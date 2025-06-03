import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'login/login_page.dart';

class ResetPasswordPage extends StatefulWidget {
  final String email;
  final String role;

  const ResetPasswordPage({required this.email, required this.role, super.key});

  @override
  State<ResetPasswordPage> createState() => _ResetPasswordPageState();
}

class _ResetPasswordPageState extends State<ResetPasswordPage> {
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  bool _newPasswordVisible = false;
  bool _confirmPasswordVisible = false;

  bool _isLoading = false;

  void _showDialog(String title, String message, {bool success = false}) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(title,
            style: TextStyle(color: success ? Colors.green : Colors.red)),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              if (success) {
                Navigator.push(
                    context, MaterialPageRoute(builder: (_) => LoginPage()));
              }
            },
            child: const Text('OK'),
          )
        ],
      ),
    );
  }

  Future<void> _handleResetPassword() async {
    final newPassword = _newPasswordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (newPassword.isEmpty || confirmPassword.isEmpty) {
      _showDialog('Error', 'Please fill in both password fields.');
      return;
    }

    if (newPassword != confirmPassword) {
      _showDialog('Error', 'Passwords do not match.');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final response = await http.post(
        Uri.parse('${dotenv.env['BASE_URL']}/reset'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': widget.email,
          'role': widget.role,
          'newPassword': newPassword,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        _showDialog('Success', data['message'], success: true);
      } else {
        _showDialog('Error', data['message'] ?? 'Something went wrong.');
      }
    } catch (e) {
      _showDialog('Error', 'Network error: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            width: 400,
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              boxShadow: const [
                BoxShadow(color: Colors.black12, blurRadius: 10)
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Reset Password",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1C274C),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  "Hello! Welcome to Franklin Baker, where quality and innovation meet purpose.",
                  style: TextStyle(fontSize: 14, color: Color(0xFF1C274C)),
                ),
                const SizedBox(height: 20),

                // New Password
                _buildPasswordInput(
                  label: "New Password",
                  controller: _newPasswordController,
                  isVisible: _newPasswordVisible,
                  onToggleVisibility: () {
                    setState(() => _newPasswordVisible = !_newPasswordVisible);
                  },
                ),

                const SizedBox(height: 16),

                // Confirm Password
                _buildPasswordInput(
                  label: "Confirm New Password",
                  controller: _confirmPasswordController,
                  isVisible: _confirmPasswordVisible,
                  onToggleVisibility: () {
                    setState(() =>
                        _confirmPasswordVisible = !_confirmPasswordVisible);
                  },
                ),

                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _handleResetPassword,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1C274C),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text("Reset Password",
                            style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),

                const SizedBox(height: 16),

                const Divider(),
                const SizedBox(height: 8),

                Center(
                  child: TextButton(
                    onPressed: () {
                      Navigator.push(context,
                          MaterialPageRoute(builder: (_) => LoginPage()));
                    },
                    child: const Text(
                      "Back",
                      style: TextStyle(
                          color: Color(0xFF1C274C),
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordInput({
    required String label,
    required TextEditingController controller,
    required bool isVisible,
    required VoidCallback onToggleVisibility,
  }) {
    return Stack(
      children: [
        TextField(
          controller: controller,
          obscureText: !isVisible,
          decoration: InputDecoration(
            labelText: label,
            border: const OutlineInputBorder(),
            suffixIcon: IconButton(
              icon: Icon(
                isVisible ? Icons.visibility_off : Icons.visibility,
                color: const Color(0xFF1C274C),
              ),
              onPressed: onToggleVisibility,
            ),
          ),
        ),
      ],
    );
  }
}
