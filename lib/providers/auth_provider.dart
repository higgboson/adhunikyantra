import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants.dart';

final firebaseAuthProvider = Provider<FirebaseAuth>((ref) {
  return FirebaseAuth.instance;
});

final authStateProvider = StreamProvider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).authStateChanges();
});

final currentUserProvider = Provider<User?>((ref) {
  return ref.watch(firebaseAuthProvider).currentUser;
});

class AuthNotifier extends StateNotifier<AsyncValue<void>> {
  final FirebaseAuth _auth;
  
  AuthNotifier(this._auth) : super(const AsyncValue.data(null));
  
  Future<bool> signInWithEmailAndPassword(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        // Store device ID in prefs
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.prefDeviceId, credential.user!.uid);
        state = const AsyncValue.data(null);
        return true;
      }
      
      state = const AsyncValue.data(null);
      return false;
    } on FirebaseAuthException catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
  
  Future<bool> signUpWithEmailAndPassword(String email, String password) async {
    state = const AsyncValue.loading();
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      
      if (credential.user != null) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.prefDeviceId, credential.user!.uid);
        state = const AsyncValue.data(null);
        return true;
      }
      
      state = const AsyncValue.data(null);
      return false;
    } on FirebaseAuthException catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
      return false;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }
  
  Future<void> signOut() async {
    state = const AsyncValue.loading();
    try {
      await _auth.signOut();
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(AppConstants.prefDeviceId);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> resetPassword(String email) async {
    state = const AsyncValue.loading();
    try {
      await _auth.sendPasswordResetEmail(email: email);
      state = const AsyncValue.data(null);
    } on FirebaseAuthException catch (e) {
      state = AsyncValue.error(e, StackTrace.current);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  String? getErrorMessage(Object error) {
    if (error is FirebaseAuthException) {
      switch (error.code) {
        case 'user-not-found':
          return 'No user found with this email.';
        case 'wrong-password':
          return 'Incorrect password.';
        case 'invalid-email':
          return 'Invalid email address.';
        case 'user-disabled':
          return 'This account has been disabled.';
        case 'too-many-requests':
          return 'Too many attempts. Please try again later.';
        case 'email-already-in-use':
          return 'An account already exists with this email.';
        case 'weak-password':
          return 'Password is too weak. Use at least 6 characters.';
        default:
          return error.message ?? 'Authentication failed.';
      }
    }
    return error.toString();
  }
}

final authActionsProvider = StateNotifierProvider<AuthNotifier, AsyncValue<void>>((ref) {
  return AuthNotifier(ref.watch(firebaseAuthProvider));
});

// Onboarding Provider
final onboardingCompleteProvider = FutureProvider<bool>((ref) async {
  final prefs = await SharedPreferences.getInstance();
  return prefs.getBool(AppConstants.prefOnboardingComplete) ?? false;
});

class OnboardingNotifier extends StateNotifier<AsyncValue<void>> {
  OnboardingNotifier() : super(const AsyncValue.data(null));
  
  Future<void> completeOnboarding() async {
    state = const AsyncValue.loading();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConstants.prefOnboardingComplete, true);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
  
  Future<void> resetOnboarding() async {
    state = const AsyncValue.loading();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool(AppConstants.prefOnboardingComplete, false);
      state = const AsyncValue.data(null);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}

final onboardingActionsProvider = StateNotifierProvider<OnboardingNotifier, AsyncValue<void>>((ref) {
  return OnboardingNotifier();
});
