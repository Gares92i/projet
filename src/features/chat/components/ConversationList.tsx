import { useEffect, useState } from 'react';
import { ChatConversation } from '@/types/chat';
import { Skeleton } from '@/ui/skeleton';
// import { getUserConversations } from '../services/conversationService';
import { ConversationItem } from './ConversationItem';
import { useAuth } from '@/features/auth/contexts/AuthContext';
import { conversationService } from "../services/conversationService";

interface ConversationListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversation: ChatConversation) => void;
  searchQuery: string;
}

export function ConversationList({ 
  selectedConversationId, 
  onSelectConversation,
  searchQuery
}: ConversationListProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      setIsLoading(true);
      try {
        // const data = await getUserConversations();
        console.log('Loaded conversations:', conversations);
        setConversations(conversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user]);

  // No need to add demo conversations here, as they are already included in getUserConversations

  const filteredConversations = conversations.filter(conv => 
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center p-3">
            <Skeleton className="h-10 w-10 rounded-full mr-3" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (filteredConversations.length === 0) {
    return (
      <p className="text-center text-muted-foreground p-4">
        {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
      </p>
    );
  }

  return (
    <>
      {filteredConversations.map(conversation => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => onSelectConversation(conversation)}
        />
      ))}
    </>
  );
}
