import 'package:flutter/material.dart';
import '../../../providers/auth_providers.dart';
import '../login/login_page.dart';
import 'package:provider/provider.dart';

class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  State<RegisterPage> createState() => _RegisterPageState();
}

class _RegisterPageState extends State<RegisterPage> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _firstName = TextEditingController();
  final TextEditingController _lastName = TextEditingController();
  final TextEditingController _email = TextEditingController();
  final TextEditingController _password = TextEditingController();
  final TextEditingController _confirmPassword = TextEditingController();

  bool _passwordVisible = false;
  bool _confirmPasswordVisible = false;

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _email.dispose();
    _password.dispose();
    _confirmPassword.dispose();
    super.dispose();
  }

  void _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.register(
      firstName: _firstName.text,
      lastName: _lastName.text,
      email: _email.text,
      password: _password.text,
    );

    if (success != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration successful!')),
      );
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginPage()),
      );
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Registration failed.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F6FB),
      body: Center(
        child: SingleChildScrollView(
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child:
                    Image.asset('assets/images/franklin-logo.png', width: 150),
              ),
              Container(
                width: 400,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: const [
                    BoxShadow(color: Colors.black12, blurRadius: 10)
                  ],
                ),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Register',
                          style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1C274C))),
                      const SizedBox(height: 5),
                      const Text(
                          'Hello! Welcome to Franklin Baker, where quality and innovation meet purpose.',
                          style: TextStyle(
                              fontSize: 14, color: Color(0xFF1C274C))),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                              child: _buildTextField('First Name', _firstName)),
                          const SizedBox(width: 10),
                          Expanded(
                              child: _buildTextField('Last Name', _lastName)),
                        ],
                      ),
                      const SizedBox(height: 10),
                      _buildTextField('Email', _email,
                          type: TextInputType.emailAddress),
                      const SizedBox(height: 10),
                      _buildPasswordField(
                          'Password', _password, _passwordVisible, () {
                        setState(() => _passwordVisible = !_passwordVisible);
                      }),
                      const SizedBox(height: 10),
                      _buildPasswordField('Confirm Password', _confirmPassword,
                          _confirmPasswordVisible, () {
                        setState(() =>
                            _confirmPasswordVisible = !_confirmPasswordVisible);
                      }),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: _submitRegister,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1C274C),
                          minimumSize: const Size(double.infinity, 50),
                        ),
                        child: const Text('Register',
                            style: TextStyle(color: Colors.white)),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pushReplacement(
                              context,
                              MaterialPageRoute(
                                  builder: (_) => const LoginPage()));
                        },
                        child: const Text('Back to Login',
                            style: TextStyle(
                                color: Color(0xFF1C274C),
                                fontWeight: FontWeight.bold)),
                      )
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller,
      {TextInputType type = TextInputType.text}) {
    return TextFormField(
      controller: controller,
      keyboardType: type,
      decoration:
          InputDecoration(labelText: label, border: const OutlineInputBorder()),
      validator: (value) =>
          value == null || value.isEmpty ? 'Enter $label' : null,
    );
  }

  Widget _buildPasswordField(String label, TextEditingController controller,
      bool isVisible, VoidCallback toggle) {
    return TextFormField(
      controller: controller,
      obscureText: !isVisible,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
        suffixIcon: IconButton(
          icon: Icon(isVisible ? Icons.visibility_off : Icons.visibility),
          onPressed: toggle,
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) return 'Enter $label';
        if (label == 'Confirm Password' && value != _password.text) {
          return 'Passwords do not match';
        }
        return null;
      },
    );
  }
}
