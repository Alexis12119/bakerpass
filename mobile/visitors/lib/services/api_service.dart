import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/employee.dart';

class ApiService {
  static final String baseUrl = dotenv.env['BASE_URL'] ?? '';

  static Future<List<Employee>> fetchEmployees({String search = ''}) async {
    final response =
        await http.get(Uri.parse('$baseUrl/employees?search=$search'));

    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      return data.map((e) => Employee.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load employees');
    }
  }

  Future<List<dynamic>> fetchTimeSlots(int hostId) async {
    final res =
        await http.get(Uri.parse("$baseUrl/employees/$hostId/available-timeslots"));
    if (res.statusCode == 200) {
      return json.decode(res.body);
    } else {
      throw Exception("Failed to load time slots");
    }
  }
}
