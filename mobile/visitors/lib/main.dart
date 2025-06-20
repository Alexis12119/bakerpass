import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:provider/provider.dart';
import 'providers/auth_providers.dart';
import 'views/login/login_page.dart';
import 'package:permission_handler/permission_handler.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env"); // await this!
  await requestPermissions();
  runApp(const MyApp());
}

// Request permissions before app starts
Future<void> requestPermissions() async {
  final statuses = await [
    Permission.camera,
    Permission.photos, // READ_MEDIA_IMAGES on Android 13+
    Permission.storage, // READ_EXTERNAL_STORAGE
  ].request();

  // Optional: Handle denial or permanent denial
  if (statuses[Permission.camera]!.isPermanentlyDenied ||
      statuses[Permission.photos]!.isPermanentlyDenied ||
      statuses[Permission.storage]!.isPermanentlyDenied) {
    await openAppSettings();
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'Login',
        theme: ThemeData(primarySwatch: Colors.blue),
        home: const LoginPage(),
      ),
    );
  }
}
