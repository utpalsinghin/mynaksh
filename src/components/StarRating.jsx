import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function StarItem({ index, filled, onPress }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(1.4), withSpring(1));
    onPress(index + 1);
  };

  return (
    <AnimatedTouchable onPress={handlePress} style={animatedStyle}>
      <Text style={[styles.star, filled && styles.starFilled]}>
        {filled ? '★' : '☆'}
      </Text>
    </AnimatedTouchable>
  );
}

export default function StarRating({ onRate }) {
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRate = (val) => {
    if (submitted) return;
    setRating(val);
    setTimeout(() => {
      Alert.alert(
        '⭐ Rating Captured',
        `You rated this session ${val} out of 5 stars. Thank you for your feedback!`,
        [{ text: 'Done', onPress: () => onRate && onRate(val) }]
      );
      setSubmitted(true);
    }, 400);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {submitted ? `You rated: ${rating}/5` : 'Rate your session'}
      </Text>
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <StarItem
            key={i}
            index={i}
            filled={i < rating}
            onPress={handleRate}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 8,
  },
  label: {
    color: '#D4AF6A',
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 40,
    color: '#4A3728',
    paddingHorizontal: 4,
  },
  starFilled: {
    color: '#F5C842',
  },
});