import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:fl_chart/fl_chart.dart';
import '../core/theme.dart';
import '../providers/device_provider.dart';

class NeutralMonitorScreen extends ConsumerWidget {
  const NeutralMonitorScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final neutralDataAsync = ref.watch(neutralDataProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Neutral Monitor',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: neutralDataAsync.when(
        data: (neutralData) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Current readings
              _buildCurrentReadings(neutralData),
              const SizedBox(height: 16),
              
              // Status card
              _buildStatusCard(neutralData),
              const SizedBox(height: 24),
              
              // Explanation
              _buildExplanationCard(),
              const SizedBox(height: 24),
              
              // Live graph
              Text(
                'Live Current Comparison',
                style: AppTypography.heading3,
              ),
              const SizedBox(height: 16),
              
              Container(
                height: 200,
                padding: const EdgeInsets.all(16),
                decoration: AppDecorations.card,
                child: LineChart(
                  _buildCurrentChart(),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Fault log
              Text(
                'Fault Log',
                style: AppTypography.heading3,
              ),
              const SizedBox(height: 16),
              
              _buildFaultLog(),
              
              const SizedBox(height: 100),
            ],
          ),
        ),
        loading: () => const Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
          ),
        ),
        error: (error, _) => _buildError(error.toString()),
      ),
    );
  }

  Widget _buildCurrentReadings(dynamic neutralData) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: AppDecorations.card,
      child: Row(
        children: [
          Expanded(
            child: _buildCurrentColumn(
              'Live Current',
              neutralData.liveCurrentA,
              AppColors.secondary,
              Icons.electric_bolt,
            ),
          ),
          Container(
            width: 1,
            height: 80,
            color: AppColors.border,
          ),
          Expanded(
            child: _buildCurrentColumn(
              'Neutral Current',
              neutralData.neutralCurrentA,
              AppColors.warning,
              Icons.compare_arrows,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrentColumn(String label, double value, Color color, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 8),
        Text(
          label,
          style: AppTypography.bodySmall,
        ),
        const SizedBox(height: 8),
        Text(
          '${value.toStringAsFixed(2)} A',
          style: AppTypography.shareTechMono(
            size: 20,
            weight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildStatusCard(dynamic neutralData) {
    final isSafe = neutralData.isSafe;
    final difference = neutralData.differenceMa;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isSafe 
            ? AppColors.primary.withValues(alpha: 0.1) 
            : AppColors.danger.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSafe 
              ? AppColors.primary.withValues(alpha: 0.3) 
              : AppColors.danger.withValues(alpha: 0.3),
          width: 2,
        ),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 16,
                height: 16,
                decoration: BoxDecoration(
                  color: isSafe ? AppColors.primary : AppColors.danger,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 12),
              Text(
                isSafe ? 'HEALTHY' : 'BROKEN NEUTRAL DETECTED',
                style: AppTypography.orbitron(
                  size: 18,
                  weight: FontWeight.bold,
                  color: isSafe ? AppColors.primary : AppColors.danger,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            'Difference: ${difference.toStringAsFixed(1)} mA',
            style: AppTypography.shareTechMono(
              size: 24,
              weight: FontWeight.bold,
              color: isSafe ? AppColors.primary : AppColors.danger,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Threshold: 30 mA',
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildExplanationCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.info_outline,
                color: AppColors.secondary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'What is Neutral Monitoring?',
                style: AppTypography.dmSans(weight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'In a healthy electrical system, the current in the live wire should equal the current in the neutral wire. If these differ significantly, it indicates current leakage to earth, which can be a shock hazard or fire risk.',
            style: AppTypography.bodySmall,
          ),
        ],
      ),
    );
  }

  Widget _buildFaultLog() {
    // Mock fault log data
    final faults = [
      {
        'time': '2 days ago',
        'difference': '45.2 mA',
        'status': 'Resolved',
      },
      {
        'time': '5 days ago',
        'difference': '38.7 mA',
        'status': 'Resolved',
      },
    ];
    
    if (faults.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: AppDecorations.card,
        child: Center(
          child: Column(
            children: [
              Icon(
                Icons.check_circle,
                size: 48,
                color: AppColors.primary.withValues(alpha: 0.5),
              ),
              const SizedBox(height: 12),
              Text(
                'No neutral faults recorded',
                style: AppTypography.body.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return Column(
      children: faults.map((fault) {
        return Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.all(16),
          decoration: AppDecorations.card,
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.warning,
                  color: AppColors.danger,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Imbalance: ${fault['difference']}',
                      style: AppTypography.dmSans(weight: FontWeight.w600),
                    ),
                    Text(
                      fault['time']!,
                      style: AppTypography.bodySmall,
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  fault['status']!,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildError(String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 64,
            color: AppColors.danger,
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading neutral data',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: AppTypography.body.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  LineChartData _buildCurrentChart() {
    return LineChartData(
      gridData: FlGridData(
        show: true,
        drawVerticalLine: false,
        getDrawingHorizontalLine: (value) {
          return FlLine(
            color: AppColors.border,
            strokeWidth: 1,
          );
        },
      ),
      titlesData: FlTitlesData(
        leftTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            reservedSize: 40,
            getTitlesWidget: (value, meta) {
              return Text(
                '${value.toInt()}A',
                style: AppTypography.caption,
              );
            },
          ),
        ),
        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        bottomTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
      ),
      borderData: FlBorderData(show: false),
      lineBarsData: [
        // Live current line
        LineChartBarData(
          spots: const [
            FlSpot(0, 2.5),
            FlSpot(1, 2.8),
            FlSpot(2, 2.6),
            FlSpot(3, 3.0),
            FlSpot(4, 2.7),
            FlSpot(5, 2.9),
            FlSpot(6, 2.8),
          ],
          isCurved: true,
          color: AppColors.secondary,
          barWidth: 3,
          dotData: const FlDotData(show: false),
        ),
        // Neutral current line
        LineChartBarData(
          spots: const [
            FlSpot(0, 2.4),
            FlSpot(1, 2.7),
            FlSpot(2, 2.5),
            FlSpot(3, 2.9),
            FlSpot(4, 2.6),
            FlSpot(5, 2.8),
            FlSpot(6, 2.7),
          ],
          isCurved: true,
          color: AppColors.warning,
          barWidth: 3,
          dotData: const FlDotData(show: false),
        ),
      ],
    );
  }
}
