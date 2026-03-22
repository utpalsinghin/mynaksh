import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import StarRating from './StarRating';

// BlurView — graceful fallback if not available
let BlurView;
try {
  BlurView = require('@react-native-community/blur').BlurView;
} catch {
  BlurView = null;
}

export default function EndChatOverlay({ visible, onClose, onRate }) {
  if (!visible) return null;

  const BackdropComponent = BlurView || View;
  const backdropProps = BlurView
    ? { blurType: 'dark', blurAmount: 12 }
    : { style: { backgroundColor: 'rgba(10, 6, 20, 0.88)' } };

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={StyleSheet.absoluteFillObject}
    >
      <BackdropComponent
        {...backdropProps}
        style={[StyleSheet.absoluteFillObject, styles.backdrop]}
      />

      <View style={styles.centeredWrapper}>
        <Animated.View
          entering={SlideInDown.springify().damping(18).stiffness(120)}
          style={styles.card}
        >
          {/* Decorative top icon */}
          <View style={styles.iconWrapper}>
            <Text style={styles.moonIcon}>🌙</Text>
          </View>

          <Text style={styles.thankYouTitle}>Session Complete</Text>
          <Text style={styles.thankYouSubtitle}>
            Your consultation with Astrologer Vikram has ended.{'\n'}
            May the stars guide your path forward. ✨
          </Text>

          <View style={styles.divider} />

          <StarRating onRate={onRate} />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#1C1228',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3D2B5E',
    shadowColor: '#7B4FBF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2D1B4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#5A3A8A',
  },
  moonIcon: {
    fontSize: 30,
  },
  thankYouTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F0E6FF',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  thankYouSubtitle: {
    fontSize: 14,
    color: '#9B8CB0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#2D1B4E',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 40,
    backgroundColor: '#4A2A7A',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#7B4FBF',
  },
  closeButtonText: {
    color: '#E2D4FF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});