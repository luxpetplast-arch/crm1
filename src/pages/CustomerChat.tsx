import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { api } from '../lib/api';

interface Conversation {
  customerId: string;
  customerName: string;
  customerPhone: string;
  telegramUsername?: string;
  lastMessage: {
    message: string;
    senderType: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  message: string;
  senderType: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  admin?: {
    name: string;
  };
}

export function CustomerChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    // Har 5 sekundda yangilanadi
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(selectedCustomerId);
      // Har 3 sekundda xabarlarni yangilash
      const interval = setInterval(() => fetchMessages(selectedCustomerId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedCustomerId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/customer-chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (customerId: string) => {
    try {
      const response = await api.get(`/customer-chat/${customerId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      await api.post(`/customer-chat/${selectedCustomerId}/send`, {
        message: newMessage.trim()
      });
      setNewMessage('');
      await fetchMessages(selectedCustomerId);
      await fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    await fetchMessages(customerId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    return date.toLocaleDateString();
  };

  const selectedConversation = conversations.find(c => c.customerId === selectedCustomerId);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Yuklanmoqda...</div>;
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mijozlar bilan chat</h1>
        <Badge color="blue">
          {conversations.reduce((sum, c) => sum + c.unreadCount, 0)} yangi xabar
        </Badge>
      </div>

      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Suhbatlar ro'yxati */}
        <Card className="col-span-4 p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-900">Suhbatlar</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Hozircha suhbatlar yo'q
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.customerId}
                  onClick={() => handleSelectConversation(conversation.customerId)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCustomerId === conversation.customerId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.customerName}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <Badge color="red">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{conversation.customerPhone}</p>
                      {conversation.telegramUsername && (
                        <p className="text-xs text-gray-500">@{conversation.telegramUsername}</p>
                      )}
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.lastMessage.senderType === 'ADMIN' ? '✓ ' : ''}
                          {conversation.lastMessage.message}
                        </p>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <span className="text-xs text-gray-400 ml-2">
                        {formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat oynasi */}
        <Card className="col-span-8 p-0 overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">
                  {selectedConversation.customerName}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedConversation.customerPhone}
                  {selectedConversation.telegramUsername && (
                    <span className="ml-2">• @{selectedConversation.telegramUsername}</span>
                  )}
                </p>
              </div>

              {/* Xabarlar */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    Hozircha xabarlar yo'q. Birinchi bo'lib yozing!
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.senderType === 'ADMIN'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 border'
                        }`}
                      >
                        {message.senderType === 'ADMIN' && message.admin && (
                          <p className="text-xs opacity-75 mb-1">{message.admin.name}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderType === 'ADMIN' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString('uz-UZ', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {message.senderType === 'ADMIN' && (
                            <span className="ml-1">✓</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Xabar yuborish */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Xabar yozing..."
                    className="flex-1"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending}>
                    {sending ? 'Yuborilmoqda...' : 'Yuborish'}
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="mt-2">Suhbatni tanlang</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
