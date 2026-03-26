import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../core/theme.dart';
import '../providers/settings_provider.dart';

class HistoryScreen extends ConsumerStatefulWidget {
  const HistoryScreen({super.key});

  @override
  ConsumerState<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends ConsumerState<HistoryScreen> {
  String _selectedRange = '24H';
  final List<String> _timeRanges = ['1H', '6H', '24H', '7D', '30D'];

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: 0,
        title: Text(
          'History & Analytics',
          style: AppTypography.heading3,
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Time Range Selector
            _buildTimeRangeSelector(),
            const SizedBox(height: 24),
            
            // Total Power Chart
            Text(
              'Total Power Consumption',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            Container(
              height: 200,
              padding: const EdgeInsets.all(16),
              decoration: AppDecorations.card,
              child: LineChart(
                _buildTotalPowerChart(),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Per Circuit Chart
            Text(
              'Per Circuit Usage',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            Container(
              height: 200,
              padding: const EdgeInsets.all(16),
              decoration: AppDecorations.card,
              child: LineChart(
                _buildCircuitChart(),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Energy Summary
            settingsAsync.when(
              data: (settings) => _buildEnergySummary(settings.electricityRateRs),
              loading: () => _buildSummaryShimmer(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            
            const SizedBox(height: 24),
            
            // Fault History
            Text(
              'Recent Faults',
              style: AppTypography.heading3,
            ),
            const SizedBox(height: 16),
            
            _buildFaultHistoryList(),
            
            const SizedBox(height: 24),
            
            // Export Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: OutlinedButton.icon(
                onPressed: () {
                  // Export PDF
                },
                icon: const Icon(Icons.download),
                label: Text(
                  'Export PDF Report',
                  style: AppTypography.dmSans(
                    size: 16,
                    weight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 100),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeRangeSelector() {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.cardBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: _timeRanges.map((range) {
          final isSelected = range == _selectedRange;
          return Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _selectedRange = range;
                });
              },
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.primary : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  range,
                  textAlign: TextAlign.center,
                  style: AppTypography.dmSans(
                    size: 14,
                    weight: isSelected ? FontWeight.w600 : FontWeight.w400,
                    color: isSelected ? AppColors.background : AppColors.textSecondary,
                  ),
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildEnergySummary(double rate) {
    // Mock data for demo
    final todayKwh = 8.5;
    final todayCost = todayKwh * rate;
    final weekKwh = 58.3;
    final weekCost = weekKwh * rate;
    final projectedMonthly = weekCost * 4.3;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Energy Summary',
            style: AppTypography.heading3,
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: _buildSummaryItem(
                  'Today',
                  '${todayKwh.toStringAsFixed(1)} kWh',
                  'Rs ${todayCost.toStringAsFixed(0)}',
                  AppColors.primary,
                ),
              ),
              Expanded(
                child: _buildSummaryItem(
                  'This Week',
                  '${weekKwh.toStringAsFixed(1)} kWh',
                  'Rs ${weekCost.toStringAsFixed(0)}',
                  AppColors.secondary,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          const Divider(color: AppColors.border),
          const SizedBox(height: 16),
          
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Projected Monthly Bill',
                style: AppTypography.body,
              ),
              Text(
                'Rs ${projectedMonthly.toStringAsFixed(0)}',
                style: AppTypography.numericLarge,
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.trending_down,
                  color: AppColors.primary,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'You are using 12% less energy than last week',
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, String cost, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: AppTypography.shareTechMono(
            size: 20,
            weight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          cost,
          style: AppTypography.bodySmall,
        ),
      ],
    );
  }

  Widget _buildFaultHistoryList() {
    // Mock fault data
    final faults = [
      {
        'type': 'OVERLOAD',
        'circuit': 'Living Room',
        'time': '2 hours ago',
        'resolved': true,
      },
      {
        'type': 'THERMAL',
        'circuit': 'Kitchen',
        'time': '1 day ago',
        'resolved': true,
      },
    ];
    
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
                  color: AppColors.warning.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.warning,
                  color: AppColors.warning,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fault['type'] as String,
                      style: AppTypography.dmSans(
                        weight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '${fault['circuit']} • ${fault['time']}',
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
                  'Resolved',
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

  Widget _buildSummaryShimmer() {
    return Container(
      height: 200,
      decoration: AppDecorations.card,
      child: const Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
        ),
      ),
    );
  }

  LineChartData _buildTotalPowerChart() {
    // Generate mock data
    final spots = <FlSpot>[
      const FlSpot(0, 120),
      const FlSpot(1, 150),
      const FlSpot(2, 180),
      const FlSpot(3, 160),
      const FlSpot(4, 200),
      const FlSpot(5, 220),
      const FlSpot(6, 190),
      const FlSpot(7, 250),
      const FlSpot(8, 280),
      const FlSpot(9, 240),
      const FlSpot(10, 300),
      const FlSpot(11, 320),
    ];

    return LineChartData(
      gridData: FlGridData(
        show: true,
        drawVerticalLine: false,
        horizontalInterval: 50,
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
            interval: 100,
            reservedSize: 40,
            getTitlesWidget: (value, meta) {
              return Text(
                '${value.toInt()}W',
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
      minX: 0,
      maxX: 11,
      minY: 0,
      maxY: 400,
      lineBarsData: [
        LineChartBarData(
          spots: spots,
          isCurved: true,
          color: AppColors.primary,
          barWidth: 3,
          isStrokeCapRound: true,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(
            show: true,
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
        ),
      ],
    );
  }

  LineChartData _buildCircuitChart() {
    final colors = [AppColors.primary, AppColors.secondary, AppColors.warning, AppColors.danger];
    
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
            interval: 50,
            reservedSize: 40,
            getTitlesWidget: (value, meta) {
              return Text(
                '${value.toInt()}W',
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
      lineBarsData: List.generate(4, (index) {
        final spots = <FlSpot>[
          FlSpot(0, 30 + index * 20.0),
          FlSpot(1, 40 + index * 25.0),
          FlSpot(2, 35 + index * 22.0),
          FlSpot(3, 50 + index * 20.0),
          FlSpot(4, 45 + index * 24.0),
          FlSpot(5, 60 + index * 18.0),
          FlSpot(6, 55 + index * 22.0),
          FlSpot(7, 70 + index * 16.0),
        ];
        
        return LineChartBarData(
          spots: spots,
          isCurved: true,
          color: colors[index],
          barWidth: 2,
          isStrokeCapRound: true,
          dotData: const FlDotData(show: false),
        );
      }),
    );
  }
}
