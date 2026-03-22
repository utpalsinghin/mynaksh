import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useChatStore } from '../store/chatStore';

export default function ReplyPreview() {
  const replyTo = useChatStore((s) => s.replyTo);
  const clearReply = useChatStore((s) => s.clearReply);
  const getMessageById = useChatStore((s) => s.getMessageById);

  if (!replyTo) return null;

  const originalMessage = getMessageById(replyTo.id);
  const senderLabel =
    replyTo.sender === 'user'
      ? 'You'
      : replyTo.sender === 'ai_astrologer'
      ? '🤖 AI Astrologer'
      : replyTo.sender === 'human_astrologer'
      ? '🧑‍💼 Astrologer Vikram'
      : replyTo.sender;

  return (
    <Animated.View
      entering={FadeInDown.duration(200).springify()}
      exiting={FadeOutDown.duration(150)}
      style={styles.container}
    >
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <Text style={styles.senderLabel}>Replying to {senderLabel}</Text>
        <Text style={styles.previewText} numberOfLines={1}>
          {originalMessage?.text || replyTo.text}
        </Text>
      </View>
      <TouchableOpacity onPress={clearReply} style={styles.cancelButton} hitSlop={8}>
        <Text style={styles.cancelIcon}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1530',
    borderTopWidth: 1,
    borderTopColor: '#2D1B4E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  accentBar: {
    width: 3,
    height: '100%',
    minHeight: 36,
    backgroundColor: '#7B4FBF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  senderLabel: {
    color: '#9B7FD4',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  previewText: {
    color: '#7A6B8A',
    fontSize: 13,
  },
  cancelButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2D1B4E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelIcon: {
    color: '#9B8CB0',
    fontSize: 11,
    fontWeight: '700',
  },
});