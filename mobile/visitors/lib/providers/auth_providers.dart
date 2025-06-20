import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;

class AuthProvider extends ChangeNotifier {
  final String baseUrl = dotenv.env['BASE_URL'] ?? '';
  bool _loading = false;

  bool get isLoading => _loading;

  Future<bool> login(String email, String password) async {
    _loading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'role': "Visitor",
        }),
      );

      _loading = false;
      notifyListeners();

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        final prefs = await SharedPreferences.getInstance();
        await prefs.setInt('userId', data['id']);
        await prefs.setString('email', data['email']);
        await prefs.setString('firstName', data['firstName']);
        await prefs.setString('lastName', data['lastName']);
        await prefs.setString('contactNumber', data['contactNumber'] ?? '');
        await prefs.setString('address', data['address'] ?? '');
        await prefs.setString('role', data['role']);
        await prefs.setString('profileImage', data['profileImage'] ?? '');

        return true;
      } else {
        return false;
      }
    } catch (e) {
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<String?> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String role = 'Visitor',
  }) async {
    _loading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          'role': "Visitor",
        }),
      );

      _loading = false;
      notifyListeners();

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['message']; // success message
      } else {
        return 'Registration failed. Please try again.';
      }
    } catch (e) {
      _loading = false;
      notifyListeners();
      return 'An error occurred: $e';
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/forgot'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );

      notifyListeners();

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return {
          'success': true,
          'role': data['role'],
        };
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'],
        };
      }
    } catch (e) {
      notifyListeners();
      return {
        'success': false,
        'message': 'Something went wrong.',
      };
    }
  }

  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
    required String role,
  }) async {
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'otp': otp,
          'role': role,
        }),
      );

      notifyListeners();

      if (response.statusCode == 200) {
        return {'success': true};
      } else {
        final error = jsonDecode(response.body);
        return {
          'success': false,
          'message': error['message'],
        };
      }
    } catch (e) {
      notifyListeners();
      return {
        'success': false,
        'message': 'Something went wrong.',
      };
    }
  }
}
