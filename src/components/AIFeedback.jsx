import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useChatStore } from '../store/chatStore';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FEEDBACK_CHIPS = ['Inaccurate', 'Too Vague', 'Too Long'];

export default function AIFeedback({ messageId, feedbackType }) {
  const updateFeedback = useChatStore((s) => s.updateFeedback);
  const setFeedbackChip = useChatStore((s) => s.setFeedbackChip);
  const feedbackChips = useChatStore((s) => s.feedbackChips);

  const selectedChip = feedbackChips[messageId];
  const isDisliked = feedbackType === 'disliked';
  const isLiked = feedbackType === 'liked';

  const handleLike = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateFeedback(messageId, 'liked');
  };

  const handleDislike = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    updateFeedback(messageId, 'disliked');
  };

  const handleChipSelect = (chip) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFeedbackChip(messageId, chip);
  };

  return (
    <View style={styles.container}>
      {/* Like / Dislike row */}
      <View style={styles.row}>
        <Text style={styles.helpText}>Was this helpful?</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            onPress={handleLike}
            style={[styles.feedbackBtn, isLiked && styles.feedbackBtnActive]}
            activeOpacity={0.7}
          >
            <Text style={styles.feedbackIcon}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDislike}
            style={[styles.feedbackBtn, isDisliked && styles.feedbackBtnActiveDislike]}
            activeOpacity={0.7}
          >
            <Text style={styles.feedbackIcon}>👎</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Feedback chips — only shown when disliked */}
      {isDisliked && (
        <View style={styles.chipsRow}>
          {FEEDBACK_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              onPress={() => handleChipSelect(chip)}
              style={[styles.chip, selectedChip === chip && styles.chipSelected]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.chipText, selectedChip === chip && styles.chipTextSelected]}
              >
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Confirmation text after chip selected */}
      {isDisliked && selectedChip && (
        <Text style={styles.confirmText}>✓ Thanks for letting us know.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpText: {
    color: '#6B5B80',
    fontSize: 11,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  feedbackBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1530',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D1B4E',
  },
  feedbackBtnActive: {
    backgroundColor: '#1A3A2A',
    borderColor: '#2ECC71',
  },
  feedbackBtnActiveDislike: {
    backgroundColor: '#3A1A1A',
    borderColor: '#E74C3C',
  },
  feedbackIcon: {
    fontSize: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#1E1530',
    borderWidth: 1,
    borderColor: '#3D2B5E',
  },
  chipSelected: {
    backgroundColor: '#3D2B5E',
    borderColor: '#7B4FBF',
  },
  chipText: {
    color: '#7A6B8A',
    fontSize: 11,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#C9A7F0',
  },
  confirmText: {
    color: '#5A8A6A',
    fontSize: 11,
    marginTop: 6,
  },
});