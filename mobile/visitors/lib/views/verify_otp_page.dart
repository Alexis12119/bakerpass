import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_providers.dart';
import 'reset_password_page.dart';

class VerifyOtpPage extends StatefulWidget {
  final String email;
  final String role;

  const VerifyOtpPage({
    super.key,
    required this.email,
    required this.role,
  });

  @override
  State<VerifyOtpPage> createState() => _VerifyOtpPageState();
}

class _VerifyOtpPageState extends State<VerifyOtpPage> {
  final TextEditingController _otpController = TextEditingController();
  String? _errorMessage;

  Future<void> _handleVerifyOtp(AuthProvider authProvider) async {
    final otp = _otpController.text.trim();

    if (otp.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter the OTP.';
      });
      return;
    }

    final result = await authProvider.verifyOtp(
      email: widget.email,
      otp: otp,
      role: widget.role,
    );

    if (result['success'] && mounted) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ResetPasswordPage(
            email: widget.email,
            role: widget.role,
          ),
        ),
      );
    } else {
      setState(() {
        _errorMessage = result['message'] ?? 'Invalid OTP.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Container(
            width: 400,
            padding: const EdgeInsets.all(24.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12.0),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Verify OTP',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1C274C),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Enter the OTP sent to your email.',
                  style: TextStyle(
                    fontSize: 14,
                    color: Color(0xFF1C274C),
                  ),
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _otpController,
                  decoration: const InputDecoration(
                    hintText: 'Enter OTP',
                    border: OutlineInputBorder(),
                  ),
                  keyboardType: TextInputType.number,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: authProvider.isLoading
                      ? null
                      : () => _handleVerifyOtp(authProvider),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1C274C),
                    minimumSize: const Size(double.infinity, 50),
                  ),
                  child: authProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Verify',
                          style: TextStyle(color: Colors.white)),
                ),
                if (_errorMessage != null) ...[
                  const SizedBox(height: 20),
                  Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
