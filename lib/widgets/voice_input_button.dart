import 'package:flutter/material.dart';
import '../core/theme.dart';

class VoiceInputButton extends StatelessWidget {
  final Function(String) onResult;
  final String? hintText;
  final IconData icon;
  final double size;

  const VoiceInputButton({
    super.key,
    required this.onResult,
    this.hintText = 'Tap to speak...',
    this.icon = Icons.mic,
    this.size = 48,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Voice input disabled', style: AppTypography.body),
            backgroundColor: AppColors.cardBackground,
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: AppColors.primary.withValues(alpha: 0.2),
          shape: BoxShape.circle,
          border: Border.all(
            color: AppColors.primary,
            width: 2,
          ),
        ),
        child: Icon(
          icon,
          color: AppColors.primary,
          size: size * 0.4,
        ),
      ),
    );
  }
}

class VoiceInputOverlay extends StatelessWidget {
  final bool isListening;
  final String lastWords;
  final VoidCallback onCancel;

  const VoiceInputOverlay({
    super.key,
    required this.isListening,
    required this.lastWords,
    required this.onCancel,
  });

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}
