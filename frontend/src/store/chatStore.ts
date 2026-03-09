import { create } from 'zustand';
import { Conversation, Message } from '../types';
import { conversationsApi, messagesApi } from '../lib/api';
import axios from 'axios';

interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  createConversation: (gameId?: string) => Promise<Conversation>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  sendMessage: (message: string, image?: File) => Promise<void>;
  clearCurrent: () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  sending: false,
  error: null,

  fetchConversations: async () => {
    try {
      const conversations = await conversationsApi.list();
      set({ conversations: Array.isArray(conversations) ? conversations : [] });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  },

  createConversation: async (gameId?: string) => {
    const conversation = await conversationsApi.create(gameId);
    set((state) => ({
      conversations: [conversation, ...state.conversations],
      currentConversation: conversation,
      messages: [],
    }));
    return conversation;
  },

  selectConversation: async (conversation) => {
    set({ currentConversation: conversation, loading: true, error: null });
    try {
      const messages = await messagesApi.list(conversation.id);
      set({ messages: Array.isArray(messages) ? messages : [], loading: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ loading: false });
    }
  },

  deleteConversation: async (id) => {
    await conversationsApi.delete(id);
    set((state) => {
      const conversations = state.conversations.filter((c) => c.id !== id);
      const currentConversation =
        state.currentConversation?.id === id ? null : state.currentConversation;
      return {
        conversations,
        currentConversation,
        messages: currentConversation ? state.messages : [],
      };
    });
  },

  sendMessage: async (message, image) => {
    const { currentConversation } = get();
    if (!currentConversation) return;

    // Clear any previous error
    set({ error: null });

    // Add optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      image_url: image ? URL.createObjectURL(image) : null,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      sending: true,
    }));

    try {
      const assistantMsg = await messagesApi.send(
        currentConversation.id,
        message,
        image
      );

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        sending: false,
      }));

      // Refresh conversations to get updated titles
      get().fetchConversations();
    } catch (error) {
      console.error('Failed to send message:', error);

      // Extract error message from API response
      let errorMsg = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      set({ sending: false, error: errorMsg });

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        set((state) => (state.error === errorMsg ? { error: null } : state));
      }, 5000);
    }
  },

  clearCurrent: () => set({ currentConversation: null, messages: [], error: null }),
  clearError: () => set({ error: null }),
}));
