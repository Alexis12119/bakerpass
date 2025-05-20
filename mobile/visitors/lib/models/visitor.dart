class Visitor {
  final int id;
  final String firstName;
  final String lastName;
  final String email;
  final String contactNumber;
  final String address;

  Visitor({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.contactNumber,
    required this.address,
  });

  factory Visitor.fromJson(Map<String, dynamic> json) {
    return Visitor(
      id: json['id'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      email: json['email'],
      contactNumber: json['contactNumber'] ?? '',
      address: json['address'] ?? '',
    );
  }

  String get fullName => '$firstName $lastName';
}
