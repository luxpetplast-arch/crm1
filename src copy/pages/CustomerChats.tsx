import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../lib/api';
import { formatDateTime } from '../lib/dateUtils';
import { 
  MessageCircle,
  Send,
  User,
  Clock,
  Bot,
  RefreshCw
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  from: 'user' | 'bot';
  timestamp: Date;
  customerName?: string;
  customerPhone?: string;
  customerTelegramId?: string;
}

interface ChatHistory {
  customerTelegramId: string;
  customerName: string;
  customerPhone: string;
  messages: Message[];
  lastMessage: Date;
  unreadCount: number;
}

export default function CustomerChats() {
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load chat histories
  const loadChats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/customer-chats');
      setChats(response.data);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message to customer
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      setSending(true);
      const response = await api.post('/api/send-message', {
        telegramChatId: selectedChat.customerTelegramId,
        message: newMessage.trim()
      });

      if (response.data.success) {
        // Add message to local state
        const newMsg: Message = {
          id: Date.now().toString(),
          text: newMessage.trim(),
          from: 'bot',
          timestamp: new Date(),
          customerName: 'Admin'
        };

        setSelectedChat(prev => ({
          ...prev!,
          messages: [...prev!.messages, newMsg],
          lastMessage: new Date()
        }));

        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Refresh chats
  const refreshChats = async () => {
    setRefreshing(true);
    await loadChats();
    setRefreshing(false);
  };

  useEffect(() => {
    loadChats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-lg font-semibold">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Mijoz Yozishmalari</span>
        </h1>
        <Button 
          onClick={refreshChats}
          disabled={refreshing}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Yangilash
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <Card className="h-[600px] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
              <CardTitle className="text-lg">Chatlar ({chats.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto h-[520px]">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Hech qanday yozishmalar topilmadi</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <div
                      key={chat.customerTelegramId}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                        selectedChat?.customerTelegramId === chat.customerTelegramId ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{chat.customerName}</span>
                            {chat.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {chat.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{chat.customerPhone}</p>
                          <p className="text-xs text-muted-foreground">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {formatDateTime(chat.lastMessage)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {selectedChat ? (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      {selectedChat.customerName}
                    </>
                  ) : (
                    'Chat tanlang'
                  )}
                </span>
                {selectedChat && (
                  <span className="text-sm text-muted-foreground">
                    {selectedChat.customerPhone}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-[520px]">
              {selectedChat ? (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {selectedChat.messages.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Hech qanday xabarlar yo'q</p>
                      </div>
                    ) : (
                      selectedChat.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.from === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.from === 'user'
                                ? 'bg-muted text-foreground'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.from === 'user' ? (
                                <User className="w-3 h-3" />
                              ) : (
                                <Bot className="w-3 h-3" />
                              )}
                              <span className="text-xs font-medium">
                                {message.from === 'user' ? message.customerName : 'Admin'}
                              </span>
                              <span className="text-xs opacity-75">
                                {formatDateTime(message.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm break-words">{message.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabar yozing..."
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Chat tanlang</p>
                    <p className="text-sm">Mijoz bilan yozishma uchun chapdan chat tanlang</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
