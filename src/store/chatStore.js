import { create } from 'zustand';
import mockMessages from '../data/mockMessages';

export const useChatStore = create((set, get) => ({
  messages: mockMessages,
  replyTo: null,      // { id, text, sender }
  reactions: {},      // { messageId: emoji }
  feedbackChips: {},  // { messageId: chipLabel }

  // Reply actions
  setReplyTo: (msg) => set({ replyTo: msg }),
  clearReply: () => set({ replyTo: null }),

  // Reaction actions
  setReaction: (id, emoji) =>
    set((state) => ({
      reactions: { ...state.reactions, [id]: emoji },
    })),

  clearReaction: (id) =>
    set((state) => {
      const updated = { ...state.reactions };
      delete updated[id];
      return { reactions: updated };
    }),

  // AI Feedback actions
  updateFeedback: (id, type) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, hasFeedback: true, feedbackType: type } : m
      ),
    })),

  setFeedbackChip: (id, chip) =>
    set((state) => ({
      feedbackChips: {
        ...state.feedbackChips,
        [id]: state.feedbackChips[id] === chip ? null : chip, // toggle
      },
    })),

  // Add new message
  addMessage: (text) => {
    const { replyTo, messages } = get();
    const newMsg = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: Date.now(),
      type: 'text',
      replyTo: replyTo ? replyTo.id : undefined,
    };
    set({ messages: [...messages, newMsg], replyTo: null });
  },

  // Get message by id (helper)
  getMessageById: (id) => get().messages.find((m) => m.id === id),
}));