import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/auth_providers.dart';
import 'verify_otp_page.dart';

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({super.key});

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController _emailController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  String? _errorMessage;

  Future<void> _handleForgotPassword(AuthProvider authProvider) async {
    if (_emailController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter your email.';
      });
      return;
    }

    final response = await authProvider.forgotPassword(_emailController.text);

    if (response['success']) {
      final role = response['role'];
      if (role != null) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => VerifyOtpPage(
              email: _emailController.text,
              role: role!,
            ),
          ),
        );
      } else {
        setState(() {
          _errorMessage = 'No role returned from server.';
        });
      }
    } else {
      setState(() {
        _errorMessage = response['message'] ?? 'Something went wrong.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: Stack(
        children: [
          Center(
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
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 10,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      const Text(
                        'Forgot Password',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1C274C),
                        ),
                      ),
                      const SizedBox(height: 10),
                      const Text(
                        'Hello! Welcome to Franklin Baker, where quality and innovation meet purpose.',
                        style: TextStyle(
                          color: Color(0xFF1C274C),
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextFormField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          border: OutlineInputBorder(),
                        ),
                        keyboardType: TextInputType.emailAddress,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: authProvider.isLoading
                            ? null
                            : () => _handleForgotPassword(authProvider),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1C274C),
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: authProvider.isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white)
                            : const Text('Send',
                                style: TextStyle(color: Colors.white)),
                      ),
                      const SizedBox(height: 20),
                      const Divider(),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Back to Login',
                          style: TextStyle(
                            color: Color(0xFF1C274C),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
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
          ),
          Positioned(
            top: 40,
            left: 20,
            child: Image.asset(
              'assets/images/franklin-logo.png', // Make sure the path is correct
              width: 150,
              height: 100,
            ),
          ),
        ],
      ),
    );
  }
}
