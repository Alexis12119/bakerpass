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
      hostName: json['host_name'],
      department: json['department'],
      purpose: json['purpose'],
      timeIn: json['time_in'],
      timeOut: json['time_out'],
      qrCodeData: json['qr_code_data'] as int,
      approvalStatus: json['approval_status'],
    );
  }
}
