import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useChatStore } from '../store/chatStore';
import MessageBubble from '../components/MessageBubble';
import ReplyPreview from '../components/ReplyPreview';
import EndChatOverlay from '../components/EndChatOverlay';

export default function ChatScreen() {
  const messages = useChatStore((s) => s.messages);
  const addMessage = useChatStore((s) => s.addMessage);
  const getMessageById = useChatStore((s) => s.getMessageById);
  const replyTo = useChatStore((s) => s.replyTo);

  const [inputText, setInputText] = useState('');
  const [endChatVisible, setEndChatVisible] = useState(false);
  const flatListRef = useRef(null);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    addMessage(trimmed);
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleEndChat = () => {
    setEndChatVisible(true);
  };

  const handleRated = (rating) => {
    // rating is captured via Alert inside StarRating
    // keep overlay open until user taps Close
  };

  const renderItem = ({ item }) => {
    const replyToMessage = item.replyTo ? getMessageById(item.replyTo) : null;
    return <MessageBubble message={item} replyToMessage={replyToMessage} />;
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0A18" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* ── Header ─────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>🔮</Text>
              </View>
              <View>
                <Text style={styles.headerTitle}>Astrologer Vikram</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Live Session</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleEndChat}
              style={styles.endChatButton}
              activeOpacity={0.8}
            >
              <Text style={styles.endChatText}>End Chat</Text>
            </TouchableOpacity>
          </View>

          {/* ── Message List ────────────────────────────────────────────── */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />

          {/* ── Reply Preview ────────────────────────────────────────────── */}
          <ReplyPreview />

          {/* ── Input Bar ───────────────────────────────────────────────── */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Ask about your stars…"
              placeholderTextColor="#4A3A5A"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              returnKeyType="send"
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              onPress={handleSend}
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ── End Chat Overlay ─────────────────────────────────────────── */}
        <EndChatOverlay
          visible={endChatVisible}
          onClose={() => setEndChatVisible(false)}
          onRate={handleRated}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0D0A18',
  },
  flex: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#110E1F',
    borderBottomWidth: 1,
    borderBottomColor: '#1E1530',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B4E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5A3A8A',
  },
  avatarText: {
    fontSize: 20,
  },
  headerTitle: {
    color: '#E2D4FF',
    fontSize: 16,
    fontWeight: '700',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2ECC71',
  },
  onlineText: {
    color: '#2ECC71',
    fontSize: 11,
    fontWeight: '500',
  },
  endChatButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#3A1520',
    borderWidth: 1,
    borderColor: '#8B2A3A',
  },
  endChatText: {
    color: '#E07080',
    fontSize: 13,
    fontWeight: '600',
  },
  // List
  listContent: {
    paddingVertical: 12,
    paddingBottom: 8,
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#110E1F',
    borderTopWidth: 1,
    borderTopColor: '#1E1530',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#1A1430',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#E2D4FF',
    fontSize: 15,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#2D1B4E',
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#5A2A9A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7B4FBF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#2A1A3A',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#E2D4FF',
    fontSize: 16,
    marginLeft: 2,
  },
});