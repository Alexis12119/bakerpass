class Employee {
  final int id;
  final String name;
  final String department;

  Employee({
    required this.id,
    required this.name,
    required this.department,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'],
      name: json['name'],
      department: json['department'],
    );
  }
}
