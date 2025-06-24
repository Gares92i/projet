import { useState, useEffect } from 'react';
import { ChatMessage, ChatConversation } from '@/types/chat';
import { useDemoMessages } from "./useDemoMessages";

export function useConversationMessages(
  conversation: ChatConversation | null, 
  currentUserId: string | null
) {
  const [userId, setUserId] = useState<string | null>(currentUserId);
  
  // Update userId when currentUserId changes
  useEffect(() => {
    setUserId(currentUserId);
  }, [currentUserId]);

  // Hook for demo conversations
  const { 
    messages, 
    sendMessage,
    isDemo
  } = useDemoMessages(conversation, userId);

  return {
    messages,
    isLoading: false,
    isSending: false,
    sendMessage
  };
}
