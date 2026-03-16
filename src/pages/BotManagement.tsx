import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import api from '../lib/api';
import { 
  Bot, 
  MessageCircle, 
  Settings, 
  RefreshCw,
  Send,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BotStatus {
  name: string;
  active: boolean;
  type: string;
}

interface BotHealth {
  totalBots: number;
  activeBots: number;
  inactiveBots: number;
  botStatus: Record<string, string>;
}

export default function BotManagement() {
  const [bots, setBots] = useState<BotStatus[]>([]);
  const [health, setHealth] = useState<BotHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedBots, setSelectedBots] = useState<string[]>([]);
  const [chatIds, setChatIds] = useState('');

  useEffect(() => {
    loadBotData();
  }, []);

  const loadBotData = async () => {
    try {
      setLoading(true);
      const [botsRes, healthRes] = await Promise.all([
        api.get('/bots/list'),
        api.get('/bots/status')
      ]);
      
      setBots(botsRes.data.data.bots);
      setHealth(healthRes.data.data);
    } catch (error) {
      console.error('Bot ma\'lumotlarini yuklashda xatolik:', error);
    } finally {
      setLoading(false);
    }
  };

  const restartBot = async (botName: string) => {
    try {
      await api.post(`/bots/restart/${botName}`);
      alert(`${botName} bot qayta ishga tushdi!`);
      loadBotData();
    } catch (error) {
      alert('Botni qayta ishga tushirishda xatolik!');
    }
  };

  const sendBroadcast = async () => {
    try {
      const payload: any = {
        message: broadcastMessage,
        botNames: selectedBots.length > 0 ? selectedBots : undefined
      };

      if (chatIds.trim()) {
        payload.chatIds = chatIds.split(',').map(id => id.trim());
      }

      await api.post('/bots/broadcast', payload);
      alert('Xabar muvaffaqiyatli yuborildi!');
      setShowBroadcast(false);
      setBroadcastMessage('');
      setSelectedBots([]);
      setChatIds('');
    } catch (error) {
      alert('Xabar yuborishda xatolik!');
    }
  };

  const getBotStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBotIcon = (type: string) => {
    switch (type) {
      case 'Mijozlar':
        return <Users className="w-6 h-6 text-blue-500" />;
      case 'Ishlab chiqarish':
        return <Settings className="w-6 h-6 text-green-500" />;
      case 'Logistika':
        return <BarChart3 className="w-6 h-6 text-purple-500" />;
      case 'Admin':
        return <Bot className="w-6 h-6 text-red-500" />;
      default:
        return <MessageCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            Bot Boshqaruvi
          </h1>
          <p className="text-muted-foreground mt-1">
            Telegram botlarini boshqaring va kuzating
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowBroadcast(true)}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Xabar yuborish
          </Button>
          <Button
            onClick={loadBotData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Bot Health Overview */}
      {health && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Jami Botlar</p>
                  <p className="text-2xl font-bold">{health.totalBots}</p>
                </div>
                <Bot className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Faol Botlar</p>
                  <p className="text-2xl font-bold text-green-600">{health.activeBots}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nofaol Botlar</p>
                  <p className="text-2xl font-bold text-red-600">{health.inactiveBots}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Samaradorlik</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((health.activeBots / health.totalBots) * 100)}%
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bot List */}
      <Card>
        <CardHeader>
          <CardTitle>Botlar Ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bots.map((bot) => (
              <div
                key={bot.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getBotIcon(bot.type)}
                  <div>
                    <h3 className="font-semibold capitalize">{bot.name}</h3>
                    <p className="text-sm text-muted-foreground">{bot.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {health && getBotStatusIcon(health.botStatus[bot.name] || 'unknown')}
                    <span className="text-sm">
                      {health?.botStatus[bot.name] === 'active' ? 'Faol' : 
                       health?.botStatus[bot.name] === 'inactive' ? 'Nofaol' : 
                       health?.botStatus[bot.name] === 'error' ? 'Xatolik' : 'Noma\'lum'}
                    </span>
                  </div>

                  <Button
                    onClick={() => restartBot(bot.name)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Qayta ishga tushirish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Broadcast Modal */}
      <Modal
        isOpen={showBroadcast}
        onClose={() => setShowBroadcast(false)}
        title="Xabar Yuborish"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Xabar matni</label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Xabar matnini kiriting..."
              className="w-full p-3 border rounded-lg resize-none h-32"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Chat ID'lar (ixtiyoriy)</label>
            <Input
              value={chatIds}
              onChange={(e) => setChatIds(e.target.value)}
              placeholder="123456789, 987654321, ..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Vergul bilan ajratilgan chat ID'lar. Bo'sh qoldirsa admin chatlarga yuboriladi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Botlarni tanlang</label>
            <div className="space-y-2">
              {bots.map((bot) => (
                <label key={bot.name} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedBots.includes(bot.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBots([...selectedBots, bot.name]);
                      } else {
                        setSelectedBots(selectedBots.filter(name => name !== bot.name));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">{bot.name} ({bot.type})</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hech qaysi bot tanlanmasa, barcha botlarga yuboriladi.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={sendBroadcast}
              disabled={!broadcastMessage.trim()}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-2" />
              Yuborish
            </Button>
            <Button
              onClick={() => setShowBroadcast(false)}
              variant="outline"
              className="flex-1"
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}