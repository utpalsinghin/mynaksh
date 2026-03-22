import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

const EMOJIS = ['🙏', '✨', '🌙', '😊', '🔥', '💫', '❤️'];

function EmojiButton({ emoji, index, onSelect, isSelected }) {
  const scale = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(index * 40, withSpring(1, { damping: 12, stiffness: 200 }));
    return () => {
      scale.value = withSpring(0);
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={() => onSelect(emoji)}
        style={[styles.emojiButton, isSelected && styles.emojiButtonSelected]}
        activeOpacity={0.7}
      >
        <Text style={styles.emojiText}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EmojiReactionBar({ onSelect, currentReaction, onDismiss }) {
  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      style={styles.container}
    >
      <View style={styles.bar}>
        {EMOJIS.map((emoji, index) => (
          <EmojiButton
            key={emoji}
            emoji={emoji}
            index={index}
            isSelected={currentReaction === emoji}
            onSelect={(e) => {
              onSelect(e);
              onDismiss();
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -56,
    left: 0,
    right: 0,
    alignItems: 'flex-start',
    zIndex: 100,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#1C1228',
    borderRadius: 28,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#3D2B5E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonSelected: {
    backgroundColor: '#3D2B5E',
  },
  emojiText: {
    fontSize: 22,
  },
});