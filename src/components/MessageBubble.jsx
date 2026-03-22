import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useChatStore } from '../store/chatStore';
import EmojiReactionBar from './EmojiReactionBar';
import AIFeedback from './AIFeedback';

const SWIPE_THRESHOLD = 65;

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getSenderLabel(sender) {
  switch (sender) {
    case 'ai_astrologer':
      return '🤖 AI Astrologer';
    case 'human_astrologer':
      return '🧑‍💼 Astrologer Vikram';
    default:
      return '';
  }
}

function getBubbleStyle(sender) {
  switch (sender) {
    case 'user':
      return { bubbleColor: '#2D1B6E', align: 'flex-end', textColor: '#E8DEFF' };
    case 'ai_astrologer':
      return { bubbleColor: '#1A2540', align: 'flex-start', textColor: '#D4E8FF' };
    case 'human_astrologer':
      return { bubbleColor: '#1A3028', align: 'flex-start', textColor: '#CCEEDD' };
    default:
      return { bubbleColor: '#2A1F3A', align: 'flex-start', textColor: '#C0B0D0' };
  }
}

export default function MessageBubble({ message, replyToMessage }) {
  const setReplyTo = useChatStore((s) => s.setReplyTo);
  const setReaction = useChatStore((s) => s.setReaction);
  const reactions = useChatStore((s) => s.reactions);

  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const translateX = useSharedValue(0);
  const replyIconOpacity = useSharedValue(0);

  const currentReaction = reactions[message.id];
  const { bubbleColor, align, textColor } = getBubbleStyle(message.sender);
  const isUser = message.sender === 'user';

  // ── Swipe to reply (only for non-event messages) ──────────────────────────
  const triggerReply = useCallback(() => {
    setReplyTo({ id: message.id, text: message.text, sender: message.sender });
  }, [message]);

  const panGesture = Gesture.Pan()
    .activeOffsetX([8, 9999]) // Only activate on rightward swipe
    .failOffsetY([-12, 12])   // Cancel if user scrolls vertically
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, SWIPE_THRESHOLD + 24);
        replyIconOpacity.value = interpolate(
          e.translationX,
          [0, SWIPE_THRESHOLD],
          [0, 1],
          Extrapolation.CLAMP
        );
      }
    })
    .onEnd(() => {
      if (translateX.value >= SWIPE_THRESHOLD) {
        scheduleOnRN(triggerReply);
      }
      translateX.value = withSpring(0, { damping: 15, stiffness: 180 });
      replyIconOpacity.value = withSpring(0);
    });

  // ── Long press to show emoji bar ──────────────────────────────────────────
  const longPressGesture = Gesture.LongPress()
    .minDuration(450)
    .onStart(() => {
      scheduleOnRN(setShowEmojiBar, true);
    });

  const composed = Gesture.Simultaneous(panGesture, longPressGesture);

  // ── Animated styles ───────────────────────────────────────────────────────
  const bubbleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconStyle = useAnimatedStyle(() => ({
    opacity: replyIconOpacity.value,
    transform: [
      {
        scale: interpolate(
          replyIconOpacity.value,
          [0, 1],
          [0.6, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // ── Event / System messages ───────────────────────────────────────────────
  if (message.type === 'event') {
    return (
      <View style={styles.eventWrapper}>
        <View style={styles.eventBubble}>
          <Text style={styles.eventText}>{message.text}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.row, { justifyContent: align }]}>
      {/* Reply icon that peeks out from behind (only on left side, non-user) */}
      {!isUser && (
        <Animated.View style={[styles.replyIcon, replyIconStyle]}>
          <Text style={styles.replyIconText}>↩</Text>
        </Animated.View>
      )}

      <GestureDetector gesture={composed}>
        <Animated.View
          style={[styles.bubbleWrapper, { alignItems: isUser ? 'flex-end' : 'flex-start' }, bubbleAnimStyle]}
        >
          {/* Emoji bar */}
          {showEmojiBar && (
            <EmojiReactionBar
              currentReaction={currentReaction}
              onSelect={(emoji) => setReaction(message.id, emoji)}
              onDismiss={() => setShowEmojiBar(false)}
            />
          )}

          {/* Sender label */}
          {(message.sender === 'ai_astrologer' || message.sender === 'human_astrologer') && (
            <Text style={styles.senderLabel}>{getSenderLabel(message.sender)}</Text>
          )}

          {/* Reply context */}
          {message.replyTo && replyToMessage && (
            <View style={styles.replyContext}>
              <View style={styles.replyContextBar} />
              <Text style={styles.replyContextText} numberOfLines={1}>
                {replyToMessage.text}
              </Text>
            </View>
          )}

          {/* Main bubble */}
          <View style={[styles.bubble, { backgroundColor: bubbleColor }]}>
            <Text style={[styles.messageText, { color: textColor }]}>{message.text}</Text>
            <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
          </View>

          {/* Reaction badge */}
          {currentReaction && (
            <View style={[styles.reactionBadge, isUser ? styles.reactionBadgeRight : styles.reactionBadgeLeft]}>
              <Text style={styles.reactionEmoji}>{currentReaction}</Text>
            </View>
          )}

          {/* AI Feedback (only for ai_astrologer messages) */}
          {message.sender === 'ai_astrologer' && (
            <AIFeedback
              messageId={message.id}
              feedbackType={message.feedbackType}
            />
          )}
        </Animated.View>
      </GestureDetector>

      {/* Reply icon on user side */}
      {isUser && (
        <Animated.View style={[styles.replyIcon, replyIconStyle]}>
          <Text style={styles.replyIconText}>↩</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  bubbleWrapper: {
    maxWidth: '78%',
    position: 'relative',
    paddingBottom: 4,
  },
  senderLabel: {
    color: '#7A6B8A',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 3,
    marginLeft: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    color: '#6B5B80',
    fontSize: 10,
    textAlign: 'right',
    marginTop: 4,
  },
  // Reply context inside bubble
  replyContext: {
    flexDirection: 'row',
    backgroundColor: '#0D0A18',
    borderRadius: 10,
    padding: 8,
    marginBottom: 4,
    overflow: 'hidden',
    maxWidth: '100%',
  },
  replyContextBar: {
    width: 3,
    backgroundColor: '#7B4FBF',
    borderRadius: 2,
    marginRight: 8,
  },
  replyContextText: {
    color: '#7A6B8A',
    fontSize: 12,
    flex: 1,
  },
  // Reaction badge
  reactionBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#1C1228',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#3D2B5E',
  },
  reactionBadgeLeft: {
    left: 8,
  },
  reactionBadgeRight: {
    right: 8,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  // Reply icon
  replyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2D1B4E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  replyIconText: {
    color: '#9B7FD4',
    fontSize: 14,
  },
  // Event / system message
  eventWrapper: {
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 16,
  },
  eventBubble: {
    backgroundColor: '#1A1228',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#2D1B4E',
  },
  eventText: {
    color: '#7A6B8A',
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});