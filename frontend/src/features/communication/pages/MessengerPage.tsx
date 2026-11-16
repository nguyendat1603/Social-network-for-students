import React, { useEffect, useRef, useState } from 'react';
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
  const [statusError, setStatusError] = useState('');
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedConvId = searchParams.get('convId');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const selected = useRef(selectedConvId);
  selected.current = selectedConvId;
  const mounted = useRef(false);
  const conversationVersion = useRef(0);
  const selectConversation = (id: string) => {
    selected.current = id;
    messageVersion.current++;
    setSearchParams({ convId: id }, { replace: true });
  };
  const messageVersion = useRef(0);
  const [messageState, setMessageState] = useState<{ id: string; items: ChatMessageItem[] } | null>(null);
  const messages = messageState?.id === selectedConvId ? messageState.items : [];

  const loadConversations = async () => {
    const version = ++conversationVersion.current;
    try {
      const list = await communicationService.listConversations();
      if (!mounted.current || version !== conversationVersion.current) return;
      setConversations(list);
      if (!selected.current && list.length > 0) {
        selectConversation(list[0].id);
      }
    } catch (err) {
      if (mounted.current && version === conversationVersion.current) setStatusError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng thử lại.');
    }
  };

  const loadMessages = async (convId: string) => {
    if (!mounted.current || selected.current !== convId) return;
    const version = ++messageVersion.current;
    try {
      const list = await communicationService.listMessages(convId);
      if (mounted.current && selected.current === convId && version === messageVersion.current) { setMessageState({ id: convId, items: list }); setStatusError(''); }
    } catch (err) {
      if (mounted.current && selected.current === convId && version === messageVersion.current) setStatusError(err instanceof Error ? err.message : 'Không thể tải dữ liệu. Vui lòng thử lại.');
    }
  };

  useEffect(() => {
    mounted.current = true;
    loadConversations();
    return () => { mounted.current = false; conversationVersion.current++; messageVersion.current++; };
  }, []);

  useEffect(() => {
    setMessageState(null);
    setStatusError('');
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
    return () => { messageVersion.current++; };
  }, [selectedConvId]);

  const activeConversation =
    conversations.find((c) => c.id === selectedConvId) || null;

  return (
    <MainLayout pageClassName="campus-page campus-communication">
      {statusError && <p role="alert" className="campus-error">{statusError}</p>}
      <header className="campus-page-heading"><h1>Tin nhắn</h1></header>
      <div className="campus-messenger-grid"
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
            borderRadius: 9,
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
              onSelect={selectConversation}
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
              onSelect={selectConversation}
            />
          </div>
        </div>

        {/* Right Panel: Active Conversation */}
        <ChatConversationPanel
          key={selectedConvId}
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
