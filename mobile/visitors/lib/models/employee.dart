class Employee {
  final int id;
  final String name;
  final String department;
  final String profileImage;

  Employee({
    required this.id,
    required this.name,
    required this.department,
    required this.profileImage,
  });

  factory Employee.fromJson(Map<String, dynamic> json) {
    return Employee(
      id: json['id'],
      name: json['name'],
      department: json['department'],
      profileImage: json['profileImage'] ?? '',
    );
  }
}
