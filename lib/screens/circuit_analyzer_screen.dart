import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:firebase_database/firebase_database.dart';
import '../core/theme.dart';
import '../core/constants.dart';

// API Configuration
const String _anthropicApiKey = 'sk-ant-your-key-here';
const String _anthropicApiUrl = 'https://api.anthropic.com/v1/messages';

class CircuitAnalyzerScreen extends StatefulWidget {
  const CircuitAnalyzerScreen({super.key});

  @override
  State<CircuitAnalyzerScreen> createState() => _CircuitAnalyzerScreenState();
}

class _CircuitAnalyzerScreenState extends State<CircuitAnalyzerScreen> {
  final ImagePicker _imagePicker = ImagePicker();
  List<Map<String, dynamic>> _circuits = [];
  bool _isLoading = false;
  String? _faultMessage;
  bool _faultActive = false;
  bool _previousFaultActive = false;
  int _faultCircuit = 0;
  String? _faultExplanation;
  bool _showingFaultDialog = false;
  final ScrollController _boardScrollController = ScrollController();
  final GlobalKey _boardKey = GlobalKey();
  final List<Map<String, dynamic>> _faultHistory = [];
  bool _isOffline = false;
  String? _lastError;
  bool _isRetrying = false;

  Stream<Map<String, dynamic>> get _readingsStream {
    return FirebaseDatabase.instance
        .ref('${AppConstants.deviceId}/readings')
        .onValue
        .map((event) {
      if (event.snapshot.value != null) {
        return Map<String, dynamic>.from(event.snapshot.value as Map);
      }
      return {};
    });
  }

  void _onFaultDismissed() {
    setState(() {
      _faultMessage = null;
      _faultActive = false;
    });
  }

  void _clearCircuits() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        title: Text('Clear Board?', style: AppTypography.heading3),
        content: Text(
          'This will remove all circuit data. You can upload a new DB schedule.',
          style: AppTypography.body,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel', style: AppTypography.body),
          ),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _circuits = [];
                _lastError = null;
              });
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
            ),
            child: Text(
              'Clear',
              style: AppTypography.dmSans(
                weight: FontWeight.w600,
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _checkForNewFault(Map<String, dynamic> readings) {
    final currentFaultActive = readings['faultActive'] == true;
    
    // Detect transition from false to true
    if (currentFaultActive && !_previousFaultActive) {
      final faultMessage = readings['faultMessage']?.toString() ?? 'Unknown fault';
      final faultCircuit = (readings['faultCircuit'] as num?)?.toInt() ?? 0;
      final current = readings['current$faultCircuit'] ?? 0.0;
      
      // Find circuit info
      Map<String, dynamic>? circuitInfo;
      if (faultCircuit > 0 && faultCircuit <= _circuits.length) {
        circuitInfo = _circuits[faultCircuit - 1];
      }
      
      _fetchFaultExplanation(
        faultMessage: faultMessage,
        faultCircuit: faultCircuit,
        current: current,
        circuitInfo: circuitInfo,
      );
    }
    
    _previousFaultActive = currentFaultActive;
  }

  Future<void> _fetchFaultExplanation({
    required String faultMessage,
    required int faultCircuit,
    required dynamic current,
    Map<String, dynamic>? circuitInfo,
  }) async {
    final mcbRating = circuitInfo?['mcb_rating']?.toString() ?? 'Unknown';
    final area = circuitInfo?['area']?.toString() ?? 'Unknown area';
    final currentStr = current is num ? current.toStringAsFixed(1) : 'Unknown';
    
    final prompt = '''Adhunik Yantra smart circuit monitor detected a fault.
Fault type: $faultMessage
Affected circuit: $faultCircuit
Live current at fault: $currentStr A
MCB rating: $mcbRating A
Area powered by this circuit: $area

In exactly 2 sentences explain:
1. What likely caused this fault in simple terms
2. What the homeowner should do right now
Write clearly for a non-technical person.''';

    try {
      final response = await http.post(
        Uri.parse(_anthropicApiUrl),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': _anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: jsonEncode({
          'model': 'claude-sonnet-4-20250514',
          'max_tokens': 300,
          'messages': [
            {
              'role': 'user',
              'content': prompt,
            },
          ],
        }),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final content = responseData['content'] as List<dynamic>;
        final textContent = content.firstWhere(
          (item) => item['type'] == 'text',
          orElse: () => null,
        );

        if (textContent != null) {
          final explanation = textContent['text'] as String;
          
          // Add to fault history
          final faultEntry = {
            'timestamp': DateTime.now().toIso8601String(),
            'faultMessage': faultMessage,
            'faultCircuit': faultCircuit,
            'explanation': explanation,
            'mcbRating': mcbRating,
            'area': area,
            'current': currentStr,
          };
          
          setState(() {
            _faultHistory.insert(0, faultEntry);
            _faultExplanation = explanation;
          });
          
          // Show fault dialog
          _showFaultDialog(explanation, faultCircuit);
        }
      }
    } catch (e) {
      debugPrint('Error fetching fault explanation: $e');
      // Still show dialog with basic info even if Claude fails
      final fallbackExplanation = 
          'A fault was detected on circuit $faultCircuit powering $area. '
          'The current reading of $currentStr A exceeded the MCB rating of $mcbRating A. '
          'Please check the connected appliances and turn off the circuit if needed.';
      
      setState(() {
        _faultExplanation = fallbackExplanation;
      });
      
      _showFaultDialog(fallbackExplanation, faultCircuit);
    }
  }

  void _showFaultDialog(String explanation, int faultCircuit) {
    if (_showingFaultDialog || !mounted) return;
    
    _showingFaultDialog = true;
    
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.cardBackground,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.warning_amber, color: AppColors.danger),
            const SizedBox(width: 12),
            Text(
              '⚠ Fault Detected',
              style: AppTypography.heading3.copyWith(color: AppColors.danger),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                explanation,
                style: AppTypography.body,
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.electrical_services, color: AppColors.danger, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Circuit $faultCircuit affected',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _showingFaultDialog = false;
            },
            child: Text(
              'Dismiss',
              style: AppTypography.body.copyWith(color: AppColors.textSecondary),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              _showingFaultDialog = false;
              await _turnOffCircuit(faultCircuit);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
            ),
            child: Text(
              'Turn Off Circuit',
              style: AppTypography.dmSans(weight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _turnOffCircuit(int circuit) async {
    try {
      final relayRef = FirebaseDatabase.instance
          .ref('${AppConstants.deviceId}/relay/$circuit');
      await relayRef.set(false);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Circuit $circuit turned off remotely',
              style: AppTypography.body.copyWith(color: Colors.white),
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    } catch (e) {
      _showError('Failed to turn off circuit: $e');
    }
  }

  void _showFaultHistory() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        minChildSize: 0.5,
        maxChildSize: 0.9,
        builder: (context, scrollController) {
          return Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.history, color: AppColors.primary, size: 28),
                    const SizedBox(width: 12),
                    Text(
                      'Fault History',
                      style: AppTypography.heading2,
                    ),
                    const Spacer(),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
              ),
              // List
              Expanded(
                child: _faultHistory.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.check_circle_outline,
                              size: 64,
                              color: AppColors.success.withValues(alpha: 0.5),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'No faults recorded',
                              style: AppTypography.body.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        controller: scrollController,
                        padding: const EdgeInsets.all(16),
                        itemCount: _faultHistory.length,
                        itemBuilder: (context, index) {
                          final fault = _faultHistory[index];
                          final timestamp = DateTime.tryParse(fault['timestamp'] ?? '');
                          
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 8,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.danger.withValues(alpha: 0.15),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        'Circuit ${fault['faultCircuit']}',
                                        style: AppTypography.shareTechMono(
                                          size: 12,
                                          color: AppColors.danger,
                                          weight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const Spacer(),
                                    Text(
                                      timestamp != null
                                          ? '${timestamp.day}/${timestamp.month}/${timestamp.year} ${timestamp.hour}:${timestamp.minute.toString().padLeft(2, '0')}'
                                          : 'Unknown time',
                                      style: AppTypography.caption.copyWith(
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  fault['faultMessage'] ?? 'Unknown fault',
                                  style: AppTypography.body.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  fault['explanation'] ?? '',
                                  style: AppTypography.bodySmall.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        await _processImage(pickedFile);
      }
    } catch (e) {
      _showError('Failed to pick image: $e');
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Select Image Source',
                style: AppTypography.heading3,
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildSourceOption(
                    icon: Icons.camera_alt,
                    label: 'Camera',
                    onTap: () {
                      Navigator.pop(context);
                      _pickImage(ImageSource.camera);
                    },
                  ),
                  _buildSourceOption(
                    icon: Icons.photo_library,
                    label: 'Gallery',
                    onTap: () {
                      Navigator.pop(context);
                      _pickImage(ImageSource.gallery);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSourceOption({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        width: 120,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 40,
              color: AppColors.primary,
            ),
            const SizedBox(height: 12),
            Text(
              label,
              style: AppTypography.body.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _processImage(XFile pickedFile) async {
    setState(() {
      _isLoading = true;
      _lastError = null;
    });

    try {
      // Check internet connectivity
      try {
        final result = await InternetAddress.lookup('google.com');
        setState(() {
          _isOffline = result.isEmpty;
        });
      } catch (_) {
        setState(() {
          _isOffline = true;
        });
        throw Exception('No internet connection. Please check your network.');
      }

      // Read image bytes and convert to base64
      final bytes = await pickedFile.readAsBytes();
      
      // Check if image is too small (likely too dark/blurry)
      if (bytes.length < 10000) {
        throw Exception('Image appears too dark or blurry. Please retake with better lighting.');
      }
      
      final base64Image = base64Encode(bytes);

      // Send to Claude API
      final circuits = await _analyzeWithClaude(base64Image);

      setState(() {
        _circuits = circuits;
        _isLoading = false;
        _isRetrying = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _isRetrying = false;
        _lastError = e.toString().replaceAll('Exception: ', '');
      });
      _showError(_lastError!);
    }
  }

  Future<List<Map<String, dynamic>>> _analyzeWithClaude(String base64Image) async {
    const prompt = '''Extract all circuits from this electrical DB schedule image.
Return ONLY a valid JSON array with no other text, markdown, or explanation. Each object must have exactly these fields:
id (string like R1 Y2 B3),
phase (R Y B or N),
mcb_rating (number in amps),
wire_size (string like 1.5mm²),
load_watts (number, estimate if not shown),
area (string describing what the circuit powers),
circuit_type (one of: lighting socket ac heater motor other),
classification (heavy if load>1500 or type is ac/heater/motor, else light)
If any field is unknown use null.''';

    final response = await http.post(
      Uri.parse(_anthropicApiUrl),
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': _anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: jsonEncode({
        'model': 'claude-sonnet-4-20250514',
        'max_tokens': 1000,
        'messages': [
          {
            'role': 'user',
            'content': [
              {
                'type': 'image',
                'source': {
                  'type': 'base64',
                  'media_type': 'image/jpeg',
                  'data': base64Image,
                },
              },
              {
                'type': 'text',
                'text': prompt,
              },
            ],
          },
        ],
      }),
    );

    if (response.statusCode != 200) {
      throw Exception('API error: ${response.statusCode} - ${response.body}');
    }

    final responseData = jsonDecode(response.body);
    final content = responseData['content'] as List<dynamic>;
    final textContent = content.firstWhere(
      (item) => item['type'] == 'text',
      orElse: () => null,
    );

    if (textContent == null) {
      throw Exception('No text content in response');
    }

    final jsonText = textContent['text'] as String;

    // Parse JSON response
    try {
      final List<dynamic> parsed = jsonDecode(jsonText);
      return parsed.map((item) => Map<String, dynamic>.from(item)).toList();
    } catch (e) {
      throw Exception('Failed to parse JSON response: $e');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: AppTypography.body.copyWith(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return OrientationBuilder(
      builder: (context, orientation) {
        final isLandscape = orientation == Orientation.landscape;
        
        return Scaffold(
          backgroundColor: AppColors.background,
          appBar: AppBar(
            backgroundColor: AppColors.background,
            elevation: 0,
            leading: IconButton(
              onPressed: () => context.pop(),
              icon: const Icon(
                Icons.arrow_back_ios,
                color: AppColors.textPrimary,
              ),
            ),
            title: Text(
              'Circuit Analyzer',
              style: AppTypography.heading3,
            ),
            centerTitle: true,
            actions: [
              IconButton(
                onPressed: _circuits.isNotEmpty ? _clearCircuits : null,
                icon: Icon(
                  Icons.refresh,
                  color: _circuits.isNotEmpty ? AppColors.textPrimary : AppColors.textMuted,
                ),
                tooltip: 'Clear and upload again',
              ),
              IconButton(
                onPressed: _showFaultHistory,
                icon: Badge(
                  isLabelVisible: _faultHistory.isNotEmpty,
                  label: Text('${_faultHistory.length}'),
                  child: const Icon(
                    Icons.history,
                    color: AppColors.textPrimary,
                  ),
                ),
                tooltip: 'Fault History',
              ),
            ],
          ),
          body: SafeArea(
            child: Stack(
              children: [
                isLandscape 
                  ? _buildLandscapeLayout()
                  : _buildPortraitLayout(),
                
                // Offline indicator
                if (_isOffline)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      color: AppColors.warning,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.wifi_off, size: 16, color: Colors.white),
                          const SizedBox(width: 8),
                          Text(
                            'No internet connection',
                            style: AppTypography.caption.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                
                // Loading indicator
                if (_isLoading)
                  Container(
                    color: AppColors.background.withValues(alpha: 0.8),
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(24),
                        decoration: BoxDecoration(
                          color: AppColors.cardBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Analyzing DB Schedule...',
                              style: AppTypography.body,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPortraitLayout() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildUploadSection(),
        const SizedBox(height: 24),
        _buildBoardWithStream(),
        const SizedBox(height: 24),
        _buildLiveStatusSection(),
        const SizedBox(height: 100),
      ],
    );
  }

  Widget _buildLandscapeLayout() {
    return Row(
      children: [
        // Left side - Upload and controls
        Expanded(
          flex: 1,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildUploadSection(),
              const SizedBox(height: 24),
              _buildLiveStatusSection(),
            ],
          ),
        ),
        // Right side - Board
        Expanded(
          flex: 2,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              _buildBoardWithStream(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBoardWithStream() {
    return StreamBuilder<Map<String, dynamic>>(
      stream: _readingsStream,
      builder: (context, snapshot) {
        final readings = snapshot.data ?? {};
        final isConnected = snapshot.hasData;
        
        _checkForNewFault(readings);
        
        if (readings['faultActive'] == true && readings['faultMessage'] != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              setState(() {
                _faultActive = true;
                _faultMessage = readings['faultMessage']?.toString();
                _faultCircuit = (readings['faultCircuit'] as num?)?.toInt() ?? 0;
              });
            }
          });
        }
        
        return _buildBoardSection(readings: readings, isConnected: isConnected);
      },
    );
  }

  Widget _buildUploadSection() {
    final hasError = _lastError != null;
    
    return Container(
      decoration: AppDecorations.card,
      child: InkWell(
        onTap: hasError ? null : _showImageSourceDialog,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: _circuits.isEmpty
            ? _buildEmptyState(hasError)
            : _buildUploadedState(),
        ),
      ),
    );
  }

  Widget _buildEmptyState(bool hasError) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            color: hasError 
                ? AppColors.danger.withValues(alpha: 0.1)
                : AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: hasError 
                  ? AppColors.danger.withValues(alpha: 0.3)
                  : AppColors.primary.withValues(alpha: 0.3),
              width: 2,
            ),
          ),
          child: Center(
            child: Icon(
              hasError ? Icons.error_outline : Icons.document_scanner_outlined,
              size: 48,
              color: hasError ? AppColors.danger : AppColors.primary,
            ),
          ),
        ),
        const SizedBox(height: 20),
        if (hasError) ...[
          Text(
            'Upload Failed',
            style: AppTypography.heading3.copyWith(
              color: AppColors.danger,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _lastError!,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ElevatedButton.icon(
                onPressed: _isRetrying ? null : _retryUpload,
                icon: _isRetrying 
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.refresh, size: 18),
                label: Text(_isRetrying ? 'Retrying...' : 'Try Again'),
              ),
            ],
          ),
        ] else ...[
          Text(
            'Upload your DB Schedule',
            style: AppTypography.heading3.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            'Take a clear photo of your electrical distribution board schedule to analyze circuits',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lightbulb_outline, 
                  size: 16, 
                  color: AppColors.warning,
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    'Tip: Ensure good lighting and capture all circuit details',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _showImageSourceDialog,
            icon: const Icon(Icons.camera_alt, size: 18),
            label: const Text('Upload Photo'),
          ),
        ],
      ],
    );
  }

  void _retryUpload() {
    setState(() {
      _lastError = null;
      _isRetrying = true;
    });
    _showImageSourceDialog();
  }

  Widget _buildUploadedState() {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(
            Icons.check_circle,
            color: AppColors.success,
            size: 32,
          ),
        ),
        const SizedBox(height: 16),
        Text(
          '${_circuits.length} Circuits Loaded',
          style: AppTypography.heading3.copyWith(fontSize: 18),
        ),
        const SizedBox(height: 8),
        Text(
          'Tap refresh to upload a new schedule',
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildBoardSection({required Map<String, dynamic> readings, required bool isConnected}) {
    return Column(
      key: _boardKey,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Row(
            children: [
              Text(
                'DB BOARD',
                style: AppTypography.caption.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1,
                ),
              ),
              const SizedBox(width: 12),
              // Live Status Indicator
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isConnected 
                      ? AppColors.success.withValues(alpha: 0.15)
                      : AppColors.textMuted.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isConnected 
                        ? AppColors.success.withValues(alpha: 0.5)
                        : AppColors.textMuted.withValues(alpha: 0.5),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(
                        color: isConnected ? AppColors.success : AppColors.textMuted,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      isConnected ? 'Live — Adhunik Yantra' : 'Offline',
                      style: AppTypography.caption.copyWith(
                        color: isConnected ? AppColors.success : AppColors.textMuted,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        _circuits.isEmpty
            ? Container(
                width: double.infinity,
                height: 200,
                decoration: AppDecorations.card,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.dashboard_outlined,
                        size: 48,
                        color: AppColors.textMuted,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Board will appear here after upload',
                        style: AppTypography.body.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              )
            : DBBoardWidget(
                circuits: _circuits,
                readings: readings,
                faultActive: _faultActive,
                faultCircuit: _faultCircuit,
                onCircuitTap: (circuit) => _showCircuitDetails(context, circuit),
              ),
      ],
    );
  }

  void _showCircuitDetails(BuildContext context, Map<String, dynamic> circuit) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.cardBackground,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => CircuitDetailsSheet(circuit: circuit),
    );
  }

  Widget _buildLiveStatusSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 12),
          child: Text(
            'LIVE STATUS',
            style: AppTypography.caption.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
            ),
          ),
        ),
        Container(
          width: double.infinity,
          height: 150,
          decoration: AppDecorations.card,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.electric_bolt,
                  size: 48,
                  color: AppColors.textMuted,
                ),
                const SizedBox(height: 16),
                Text(
                  'Live readings from Adhunik Yantra',
                  style: AppTypography.body.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class DBBoardWidget extends StatelessWidget {
  final List<Map<String, dynamic>> circuits;
  final Map<String, dynamic> readings;
  final bool faultActive;
  final int faultCircuit;
  final Function(Map<String, dynamic>) onCircuitTap;

  const DBBoardWidget({
    super.key,
    required this.circuits,
    required this.readings,
    required this.faultActive,
    required this.faultCircuit,
    required this.onCircuitTap,
  });

  @override
  Widget build(BuildContext context) {
    final heavyCircuits = circuits
        .where((c) => c['classification']?.toString().toLowerCase() == 'heavy')
        .toList();
    final lightCircuits = circuits
        .where((c) => c['classification']?.toString().toLowerCase() != 'heavy')
        .toList();

    final totalLoadKw = circuits.fold<double>(
      0,
      (sum, c) => sum + ((c['load_watts'] as num?)?.toDouble() ?? 0),
    ) / 1000;

    return Container(
      decoration: AppDecorations.card,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeaderStats(totalLoadKw, heavyCircuits.length, lightCircuits.length),
          if (heavyCircuits.isNotEmpty)
            _buildSection(
              title: 'HEAVY CIRCUITS',
              color: AppColors.warning,
              circuits: heavyCircuits,
              onTap: onCircuitTap,
            ),
          if (lightCircuits.isNotEmpty)
            _buildSection(
              title: 'LIGHT CIRCUITS',
              color: AppColors.success,
              circuits: lightCircuits,
              onTap: onCircuitTap,
            ),
        ],
      ),
    );
  }

  Widget _buildHeaderStats(double totalLoadKw, int heavyCount, int lightCount) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatItem(
            label: 'Total Load',
            value: '${totalLoadKw.toStringAsFixed(2)} kW',
            icon: Icons.electric_bolt,
          ),
          Container(width: 1, height: 40, color: AppColors.border),
          _buildStatItem(
            label: 'Heavy',
            value: heavyCount.toString(),
            icon: Icons.warning_amber,
            valueColor: AppColors.warning,
          ),
          Container(width: 1, height: 40, color: AppColors.border),
          _buildStatItem(
            label: 'Light',
            value: lightCount.toString(),
            icon: Icons.check_circle_outline,
            valueColor: AppColors.success,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required String label,
    required String value,
    required IconData icon,
    Color? valueColor,
  }) {
    return Column(
      children: [
        Row(
          children: [
            Icon(icon, size: 16, color: AppColors.textMuted),
            const SizedBox(width: 4),
            Text(label, style: AppTypography.caption),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTypography.shareTechMono(
            size: 18,
            weight: FontWeight.bold,
            color: valueColor ?? AppColors.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildSection({
    required String title,
    required Color color,
    required List<Map<String, dynamic>> circuits,
    required Function(Map<String, dynamic>) onTap,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            border: Border(
              bottom: BorderSide(color: color.withValues(alpha: 0.5), width: 2),
            ),
          ),
          child: Text(
            title,
            style: AppTypography.caption.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
              letterSpacing: 1.2,
            ),
          ),
        ),
        SizedBox(
          height: 130,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(12),
            itemCount: circuits.length,
            itemBuilder: (context, index) {
              final circuitIndex = index + 1; // circuit 1, 2, etc.
              final isFaulted = faultActive && faultCircuit == circuitIndex;
              final liveCurrent = readings['current$circuitIndex'] ?? 0.0;
              return MCBCard(
                circuit: circuits[index],
                onTap: () => onTap(circuits[index]),
                isFaulted: isFaulted,
                liveCurrent: liveCurrent is num ? liveCurrent.toDouble() : 0.0,
              );
            },
          ),
        ),
      ],
    );
  }
}

class CircuitDetailsSheet extends StatefulWidget {
  final Map<String, dynamic> circuit;

  const CircuitDetailsSheet({
    super.key,
    required this.circuit,
  });

  @override
  State<CircuitDetailsSheet> createState() => _CircuitDetailsSheetState();
}

class _CircuitDetailsSheetState extends State<CircuitDetailsSheet> {
  String _aiResponse = '';
  bool _isAnalyzing = true;
  Color _borderColor = AppColors.border;

  @override
  void initState() {
    super.initState();
    _fetchAISafetyCheck();
  }

  Future<void> _fetchAISafetyCheck() async {
    final circuitJson = jsonEncode(widget.circuit);
    final prompt = '''You are an electrical safety assistant. Analyse this circuit and give a 2-3 line practical safety check.
Circuit data: $circuitJson
Cover: (1) is MCB rating appropriate for load, (2) is wire size adequate, (3) any safety concerns.
Be concise. Write for a homeowner.
Start with OK or WARNING or DANGER.''';

    try {
      final response = await http.post(
        Uri.parse(_anthropicApiUrl),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': _anthropicApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: jsonEncode({
          'model': 'claude-sonnet-4-20250514',
          'max_tokens': 300,
          'messages': [
            {
              'role': 'user',
              'content': prompt,
            },
          ],
        }),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final content = responseData['content'] as List<dynamic>;
        final textContent = content.firstWhere(
          (item) => item['type'] == 'text',
          orElse: () => null,
        );

        if (textContent != null) {
          final text = textContent['text'] as String;
          setState(() {
            _aiResponse = text;
            _isAnalyzing = false;
            // Determine border color based on response start
            final upperText = text.toUpperCase();
            if (upperText.startsWith('OK')) {
              _borderColor = AppColors.success;
            } else if (upperText.startsWith('WARNING')) {
              _borderColor = AppColors.warning;
            } else if (upperText.startsWith('DANGER')) {
              _borderColor = AppColors.danger;
            }
          });
        }
      } else {
        setState(() {
          _aiResponse = 'Unable to analyze. Please try again.';
          _isAnalyzing = false;
        });
      }
    } catch (e) {
      setState(() {
        _aiResponse = 'Error analyzing circuit: $e';
        _isAnalyzing = false;
      });
    }
  }

  Color _getPhaseColor(String? phase) {
    switch (phase?.toUpperCase()) {
      case 'R':
        return const Color(0xFFFF4444);
      case 'Y':
        return const Color(0xFFFFC107);
      case 'B':
        return const Color(0xFF2196F3);
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final circuit = widget.circuit;
    final phaseColor = _getPhaseColor(circuit['phase']?.toString());
    
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.6,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      builder: (context, scrollController) {
        return SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Drag handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 24),
                    decoration: BoxDecoration(
                      color: AppColors.textMuted,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                
                // Header - Area name
                Text(
                  circuit['area']?.toString() ?? 'Unknown Area',
                  style: AppTypography.heading2,
                ),
                const SizedBox(height: 16),
                
                // Chips row - MCB Rating, Wire Size, Load
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _buildChip(
                      icon: Icons.electrical_services,
                      label: '${circuit['mcb_rating']?.toString() ?? '?'}A MCB',
                      color: AppColors.primary,
                    ),
                    _buildChip(
                      icon: Icons.cable,
                      label: circuit['wire_size']?.toString() ?? 'Unknown wire',
                      color: AppColors.secondary,
                    ),
                    _buildChip(
                      icon: Icons.bolt,
                      label: '${circuit['load_watts']?.toString() ?? '?'}W',
                      color: AppColors.info,
                    ),
                    _buildChip(
                      icon: Icons.circle,
                      label: circuit['circuit_type']?.toString() ?? 'Unknown',
                      color: phaseColor,
                      isCircle: true,
                    ),
                    _buildChip(
                      icon: Icons.power,
                      label: 'Phase ${circuit['phase']?.toString() ?? '?'}',
                      color: phaseColor,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Text(
                  'AI SAFETY CHECK',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _borderColor, width: 2),
                  ),
                  child: _isAnalyzing
                      ? Row(
                          children: [
                            const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Analyzing circuit safety...',
                              style: AppTypography.bodySmall,
                            ),
                          ],
                        )
                      : Text(_aiResponse, style: AppTypography.body),
                ),
                const SizedBox(height: 24),
                Text(
                  'WIRING PATH',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 16),
                _buildWiringPath(),
                const SizedBox(height: 24),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text('Circuit ID: ', style: AppTypography.bodySmall),
                      Text(
                        circuit['id']?.toString() ?? 'Unknown',
                        style: AppTypography.shareTechMono(
                          size: 14,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      'Close',
                      style: AppTypography.dmSans(weight: FontWeight.w600),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildChip({
    required IconData icon,
    required String label,
    required Color color,
    bool isCircle = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          isCircle
              ? Container(
                  width: 10,
                  height: 10,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                )
              : Icon(icon, size: 14, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWiringPath() {
    final steps = [
      ('Incomer', AppColors.danger),
      ('MCB', AppColors.textSecondary),
      ('Conduit', AppColors.textSecondary),
      ('Junction', AppColors.textSecondary),
      ('Load', AppColors.success),
    ];

    return SizedBox(
      height: 60,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: steps.length,
        itemBuilder: (context, index) {
          final (label, color) = steps[index];
          final isLast = index == steps.length - 1;

          return Row(
            children: [
              Column(
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.textPrimary, width: 2),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    label,
                    style: AppTypography.caption.copyWith(
                      fontSize: 9,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              if (!isLast)
                Container(
                  width: 40,
                  height: 1,
                  margin: const EdgeInsets.only(bottom: 12),
                  child: CustomPaint(
                    size: const Size(40, 1),
                    painter: DashedLinePainter(),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class DashedLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.textMuted
      ..strokeWidth = 1;

    const dashWidth = 4.0;
    const dashSpace = 4.0;
    double startX = 0;

    while (startX < size.width) {
      canvas.drawLine(
        Offset(startX, size.height / 2),
        Offset(startX + dashWidth, size.height / 2),
        paint,
      );
      startX += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

class MCBCard extends StatelessWidget {
  final Map<String, dynamic> circuit;
  final VoidCallback onTap;
  final bool isFaulted;
  final double liveCurrent;

  const MCBCard({
    super.key,
    required this.circuit,
    required this.onTap,
    this.isFaulted = false,
    this.liveCurrent = 0.0,
  });

  Color _getPhaseColor(String? phase) {
    switch (phase?.toUpperCase()) {
      case 'R':
        return const Color(0xFFFF4444);
      case 'Y':
        return const Color(0xFFFFC107);
      case 'B':
        return const Color(0xFF2196F3);
      default:
        return AppColors.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final phaseColor = _getPhaseColor(circuit['phase']?.toString());
    final mcbRating = circuit['mcb_rating']?.toString() ?? '?';
    final area = circuit['area']?.toString() ?? 'Unknown';
    final id = circuit['id']?.toString() ?? '?';

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: 80,
        height: 110,
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(
          color: isFaulted 
              ? AppColors.danger.withValues(alpha: 0.3)
              : AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isFaulted ? AppColors.danger : AppColors.border,
            width: isFaulted ? 2 : 1,
          ),
        ),
        child: Stack(
          children: [
            // Pulsing border animation for fault
            if (isFaulted)
              Positioned.fill(
                child: TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.0, end: 1.0),
                  duration: const Duration(milliseconds: 1000),
                  curve: Curves.easeInOut,
                  builder: (context, value, child) {
                    return Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.danger.withValues(alpha: 0.3 + (0.4 * value)),
                          width: 2 + (2 * value),
                        ),
                      ),
                    );
                  },
                ),
              ),
            Column(
              children: [
                Container(
                  width: double.infinity,
                  height: 8,
                  decoration: BoxDecoration(
                    color: phaseColor,
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      topRight: Radius.circular(12),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${mcbRating}A',
                  style: AppTypography.shareTechMono(
                    size: 20,
                    weight: FontWeight.bold,
                    color: isFaulted ? AppColors.danger : AppColors.primary,
                  ),
                ),
                const SizedBox(height: 2),
                // Live current reading
                Text(
                  '${liveCurrent.toStringAsFixed(1)}A live',
                  style: AppTypography.shareTechMono(
                    size: 9,
                    color: AppColors.success,
                  ),
                ),
                const SizedBox(height: 2),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Text(
                    area,
                    style: AppTypography.caption.copyWith(fontSize: 9),
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const Spacer(),
                // FAULT badge
                if (isFaulted)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.danger,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'FAULT',
                      style: AppTypography.caption.copyWith(
                        fontSize: 8,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  )
                else
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      id,
                      style: AppTypography.shareTechMono(
                        size: 10,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                const SizedBox(height: 6),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
