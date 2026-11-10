import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MainLayout } from '../../../components/layout/MainLayout';
import { useAuth } from '../../../hooks/useAuth';
import { communicationService } from '../../../services/communication.service';
import {
  ChatMessageItem,
  ConversationItem,
} from '../../../types/communication.types';
import { DirectMessageList } from '../components/DirectMessageList';
import { ProjectGroupChatList } from '../components/ProjectGroupChatList';
import { ChatConversationPanel } from '../components/ChatConversationPanel';

export const MessengerPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConvId = searchParams.get('convId');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    initialConvId
  );
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  const loadConversations = async () => {
    try {
      const list = await communicationService.listConversations();
      setConversations(list);
      if (!selectedConvId && list.length > 0) {
        setSelectedConvId(initialConvId || list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const list = await communicationService.listMessages(convId);
      setMessages(list);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      setSearchParams({ convId: selectedConvId }, { replace: true });
      loadMessages(selectedConvId);
    }
  }, [selectedConvId]);

  const activeConversation =
    conversations.find((c) => c.id === selectedConvId) || null;

  return (
    <MainLayout>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* Left Sidebar: Group Chats & Direct Messages */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 14,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <div>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-primary)' }}>
              🛠️ Phòng Chat Nhóm Đồ án
            </h4>
            <ProjectGroupChatList
              conversations={conversations}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14 }}>
            <h4 style={{ margin: '0 0 8px', fontSize: 14, color: 'var(--text-primary)' }}>
              💬 Tin nhắn Trực tiếp (1-1)
            </h4>
            <DirectMessageList
              conversations={conversations}
              currentUserId={user?.userId}
              selectedId={selectedConvId}
              onSelect={setSelectedConvId}
            />
          </div>
        </div>

        {/* Right Panel: Active Conversation */}
        <ChatConversationPanel
          conversation={activeConversation}
          messages={messages}
          currentUserId={user?.userId}
          onSendMessage={async (payload) => {
            if (!selectedConvId) return;
            await communicationService.sendMessage(selectedConvId, payload);
            await loadMessages(selectedConvId);
            await loadConversations();
          }}
        />
      </div>
    </MainLayout>
  );
};
