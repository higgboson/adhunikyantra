import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  // Background colors
  static const Color background = Color(0xFF0A0E17);
  static const Color cardBackground = Color(0xFF131929);
  static const Color surface = Color(0xFF0D1320);
  
  // Accent colors
  static const Color primary = Color(0xFF00FF88);
  static const Color primaryDark = Color(0xFF00CC6A);
  static const Color secondary = Color(0xFF00D4FF);
  static const Color secondaryDark = Color(0xFF00A8CC);
  
  // Status colors
  static const Color warning = Color(0xFFFF6B35);
  static const Color danger = Color(0xFFFF3355);
  static const Color success = Color(0xFF00FF88);
  static const Color info = Color(0xFF00D4FF);
  
  // Text colors
  static const Color textPrimary = Color(0xFFE8F0FE);
  static const Color textSecondary = Color(0xFF7A8BA8);
  static const Color textMuted = Color(0xFF5A6B88);
  
  // Border colors
  static const Color border = Color(0xFF1E2D42);
  static const Color borderGlow = Color(0xFF00FF88);
  
  // Status indicators
  static Color getStatusColor(double value, double warningThreshold, double dangerThreshold) {
    if (value >= dangerThreshold) return danger;
    if (value >= warningThreshold) return warning;
    return success;
  }
  
  static Color getCurrentColor(double current) {
    if (current > 5.5) return danger;
    if (current > 4.0) return warning;
    return success;
  }
  
  static Color getTempColor(double temp) {
    if (temp > 60) return danger;
    if (temp > 50) return warning;
    return success;
  }
  
  static Color getVoltageColor(double voltage) {
    if (voltage >= 200 && voltage <= 250) return success;
    return danger;
  }
  
  static Color getLeakageColor(double leakage) {
    if (leakage < 30) return success;
    return danger;
  }
}

class AppTypography {
  static TextStyle orbitron({
    double size = 16,
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.textPrimary,
  }) {
    return GoogleFonts.orbitron(
      fontSize: size,
      fontWeight: weight,
      color: color,
    );
  }
  
  static TextStyle dmSans({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.textPrimary,
  }) {
    return GoogleFonts.dmSans(
      fontSize: size,
      fontWeight: weight,
      color: color,
    );
  }
  
  static TextStyle shareTechMono({
    double size = 14,
    FontWeight weight = FontWeight.w400,
    Color color = AppColors.textPrimary,
  }) {
    return GoogleFonts.shareTechMono(
      fontSize: size,
      fontWeight: weight,
      color: color,
    );
  }
  
  // Predefined styles
  static TextStyle get heading1 => orbitron(size: 32, weight: FontWeight.bold, color: AppColors.textPrimary);
  static TextStyle get heading2 => orbitron(size: 24, weight: FontWeight.bold, color: AppColors.textPrimary);
  static TextStyle get heading3 => orbitron(size: 20, weight: FontWeight.w600, color: AppColors.textPrimary);
  static TextStyle get subtitle => dmSans(size: 16, weight: FontWeight.w500, color: AppColors.textSecondary);
  static TextStyle get body => dmSans(size: 14, color: AppColors.textPrimary);
  static TextStyle get bodySmall => dmSans(size: 12, color: AppColors.textSecondary);
  static TextStyle get caption => dmSans(size: 10, color: AppColors.textMuted);
  static TextStyle get numeric => shareTechMono(size: 20, weight: FontWeight.w600, color: AppColors.primary);
  static TextStyle get numericLarge => shareTechMono(size: 36, weight: FontWeight.bold, color: AppColors.primary);
}

class AppDecorations {
  static BoxDecoration get card => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: AppColors.border, width: 1),
  );
  
  static BoxDecoration get cardGlow => BoxDecoration(
    color: AppColors.cardBackground,
    borderRadius: BorderRadius.circular(16),
    border: Border.all(color: AppColors.borderGlow.withValues(alpha: 0.3), width: 1),
    boxShadow: [
      BoxShadow(
        color: AppColors.borderGlow.withValues(alpha: 0.1),
        blurRadius: 20,
        spreadRadius: 2,
      ),
    ],
  );
  
  static BoxDecoration get buttonGradient => BoxDecoration(
    gradient: const LinearGradient(
      colors: [AppColors.primary, AppColors.primaryDark],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    borderRadius: BorderRadius.circular(12),
    boxShadow: [
      BoxShadow(
        color: AppColors.primary.withValues(alpha: 0.3),
        blurRadius: 12,
        spreadRadius: 2,
      ),
    ],
  );
  
  static BoxDecoration get dangerGradient => BoxDecoration(
    gradient: LinearGradient(
      colors: [AppColors.danger, AppColors.danger.withRed(180)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    borderRadius: BorderRadius.circular(12),
  );
  
  static BoxDecoration get outlinedButton => BoxDecoration(
    border: Border.all(color: AppColors.border, width: 1),
    borderRadius: BorderRadius.circular(12),
  );
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      primaryColor: AppColors.primary,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.cardBackground,
        // background: AppColors.background, // Deprecated, use surface
        error: AppColors.danger,
        onPrimary: AppColors.background,
        onSecondary: AppColors.background,
        onSurface: AppColors.textPrimary,
        // onBackground: AppColors.textPrimary, // Deprecated, use onSurface
        onError: Colors.white,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        centerTitle: true,
        titleTextStyle: AppTypography.heading3,
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.cardBackground,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AppColors.cardBackground,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surface,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        labelStyle: AppTypography.bodySmall,
        hintStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: AppColors.background,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: AppTypography.dmSans(weight: FontWeight.w600),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.textPrimary,
          side: const BorderSide(color: AppColors.border),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: AppTypography.dmSans(weight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: AppTypography.dmSans(weight: FontWeight.w600),
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary;
          }
          return AppColors.textSecondary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return AppColors.primary.withValues(alpha: 0.3);
          }
          return AppColors.border;
        }),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
      ),
    );
  }
}
