class Visit {
  final String hostName;
  final String department;
  final String purpose;
  final String timeIn;
  final String timeOut;
  final int qrCodeData;
  final String approvalStatus;

  Visit({
    required this.hostName,
    required this.department,
    required this.purpose,
    required this.timeIn,
    required this.timeOut,
    required this.qrCodeData,
    required this.approvalStatus,
  });

  factory Visit.fromJson(Map<String, dynamic> json) {
    return Visit(
      hostName: json['hostName'],
      department: json['department'],
      purpose: json['purpose'],
      timeIn: json['timeIn'],
      timeOut: json['timeOut'],
      qrCodeData: json['qrCodeData'],
      approvalStatus: json['approvalStatus'],
    );
  }
}
