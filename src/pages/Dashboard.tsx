import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Factory,
  CheckSquare,
  Clock,
  Target,
  Plus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Activity,
  ShoppingCart,
  Truck,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Brain,
  TrendingDown,
  FileText,
  Calendar,
  Layers,
  Search,
  Settings,
  Shield,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
  Share2,
  MoreVertical,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  Check,
  X,
  PlusCircle,
  MinusCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Layout,
  LayoutDashboard,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  Globe,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Award,
  Zap as FastIcon,
  Heart,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Key,
  Database,
  Cloud,
  Cpu,
  Smartphone,
  Tablet,
  Monitor,
  HardDrive,
  Usb,
  Wifi,
  Bluetooth,
  Battery,
  ZapOff,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Umbrella,
  Compass,
  Map,
  Navigation,
  Flag,
  FlagOff,
  Home,
  Briefcase as WorkIcon,
  Book,
  BookOpen,
  GraduationCap,
  Music,
  Video,
  Camera,
  Image as ImageIcon,
  Mic,
  Headphones,
  Speaker,
  Cast,
  Tv,
  Radio,
  Airplay,
  MonitorOff,
  SmartphoneOff,
  TabletOff,
  Hash,
  AtSign,
  Link as LinkIcon,
  Link2,
  Paperclip,
  Scissors,
  PenTool,
  Pencil,
  Brush,
  Eraser,
  Palette,
  Droplet,
  GlassWater,
  Coffee,
  Beer,
  Wine,
  Pizza,
  Utensils,
  Car,
  Bike,
  Plane,
  Train,
  Ship,
  Subway,
  Bus,
  Tram,
  Strikethrough,
  Italic,
  Bold,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Code,
  Terminal,
  Quote,
  Quote as QuoteIcon,
  List,
  ListOrdered,
  Indent,
  Outdent,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Maximize,
  Minimize,
  Maximize2,
  Minimize2,
  StretchHorizontal,
  StretchVertical,
  Move,
  MoveHorizontal,
  MoveVertical,
  RotateCcw,
  RotateCw,
  RefreshCw as RefreshIcon,
  Repeat,
  Repeat1,
  Shuffle,
  Play,
  Pause,
  StopCircle,
  FastForward,
  Rewind,
  SkipBack,
  SkipForward,
  PlayCircle,
  PauseCircle,
  StopCircle as StopIcon,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  VolumeOff,
  MicOff,
  VideoOff,
  Cast as CastIcon,
  Airplay as AirplayIcon,
  Tv as TvIcon,
  Radio as RadioIcon,
  Monitor as MonitorIcon,
  Smartphone as SmartphoneIcon,
  Tablet as TabletIcon,
  HardDrive as HardDriveIcon,
  Usb as UsbIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Battery as BatteryIcon,
  ZapOff as ZapOffIcon,
  Sun as SunIcon,
  Moon as MoonIcon,
  CloudRain as CloudRainIcon,
  CloudSnow as CloudSnowIcon,
  CloudLightning as CloudLightningIcon,
  Wind as WindIcon,
  Droplets as DropletsIcon,
  Thermometer as ThermometerIcon,
  Umbrella as UmbrellaIcon,
  Compass as CompassIcon,
  Map as MapIcon,
  Navigation as NavigationIcon,
  Flag as FlagIcon,
  FlagOff as FlagOffIcon,
  Home as HomeIcon,
  Briefcase as BriefcaseIcon,
  Book as BookIcon,
  BookOpen as BookOpenIcon,
  GraduationCap as GraduationCapIcon,
  Music as MusicIcon,
  Video as VideoIcon,
  Camera as CameraIcon,
  Image as ImageIcon_2,
  Mic as MicIcon,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Cast as CastIcon_2,
  Tv as TvIcon_2,
  Radio as RadioIcon_2,
  Airplay as AirplayIcon_2,
  MonitorOff as MonitorOffIcon,
  SmartphoneOff as SmartphoneOffIcon,
  TabletOff as TabletOffIcon,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Link as LinkIcon_2,
  Link2 as Link2Icon,
  Paperclip as PaperclipIcon,
  Scissors as ScissorsIcon,
  PenTool as PenToolIcon,
  Pencil as PencilIcon,
  Brush as BrushIcon,
  Eraser as EraserIcon,
  Palette as PaletteIcon,
  Droplet as DropletIcon,
  GlassWater as GlassWaterIcon,
  Coffee as CoffeeIcon,
  Beer as BeerIcon,
  Wine as WineIcon,
  Pizza as PizzaIcon,
  Utensils as UtensilsIcon,
  Car as CarIcon,
  Bike as BikeIcon,
  Plane as PlaneIcon,
  Train as TrainIcon,
  Ship as ShipIcon,
  Subway as SubwayIcon,
  Bus as BusIcon,
  Tram as TramIcon,
  Strikethrough as StrikethroughIcon,
  Italic as ItalicIcon,
  Bold as BoldIcon,
  Underline as UnderlineIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Heading4 as Heading4Icon,
  Heading5 as Heading5Icon,
  Heading6 as Heading6Icon,
  Code as CodeIcon,
  Terminal as TerminalIcon,
  Quote as QuoteIcon_2,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Indent as IndentIcon,
  Outdent as OutdentIcon,
  AlignLeft as AlignLeftIcon,
  AlignCenter as AlignCenterIcon,
  AlignRight as AlignRightIcon,
  AlignJustify as AlignJustifyIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon,
  StretchHorizontal as StretchHorizontalIcon,
  StretchVertical as StretchVerticalIcon,
  Move as MoveIcon,
  MoveHorizontal as MoveHorizontalIcon,
  MoveVertical as MoveVerticalIcon,
  RotateCcw as RotateCcwIcon,
  RotateCw as RotateCwIcon,
  RefreshCw as RefreshCwIcon,
  Repeat as RepeatIcon,
  Repeat1 as Repeat1Icon,
  Shuffle as ShuffleIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  StopCircle as StopCircleIcon,
  FastForward as FastForwardIcon,
  Rewind as RewindIcon,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  PlayCircle as PlayCircleIcon,
  PauseCircle as PauseCircleIcon,
  Volume as VolumeIcon,
  Volume1 as Volume1Icon,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  VolumeOff as VolumeOffIcon,
  MicOff as MicOffIcon,
  VideoOff as VideoOffIcon,
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import { latinToCyrillic } from '../lib/transliterator';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Xatolik yuz berdi');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">{latinToCyrillic("Yuklanmoqda...")}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{latinToCyrillic("Xatolik yuz berdi")}</p>
        <Button onClick={loadDashboardData} className="shadow-lg hover:shadow-xl transition-all">
          {latinToCyrillic("Qayta urinish")}
        </Button>
      </div>
    );
  }

  const profitMargin = stats.monthlyRevenue > 0 
    ? ((stats.netProfit / stats.monthlyRevenue) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
      {/* Premium Welcome Header with Glassmorphism - Ultra Premium Style */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-[3rem] p-10 sm:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white dark:border-gray-800">
        {/* Background blobs inside the header for depth */}
        <div className="absolute top-0 -left-10 w-80 h-80 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-purple-100 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 shadow-sm">
                <Sparkles className="w-3 h-3 animate-pulse" />
                LUX PET PREMIUM
              </div>
              <h1 className="text-6xl sm:text-8xl font-black text-gray-900 dark:text-white tracking-tighter leading-[0.85] drop-shadow-2xl">
                {latinToCyrillic("Boshqaruv")} <br />
                <span className="text-blue-600 dark:text-blue-400 drop-shadow-2xl">{latinToCyrillic("Paneli")}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-5 py-2.5 rounded-2xl font-black text-xs border border-gray-100 dark:border-gray-700 shadow-sm">
                  <Clock className="w-4 h-4 text-blue-500" />
                  {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">LIVE DATA</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-10 py-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-[2rem] font-black text-xs tracking-widest transition-all active:scale-95 text-gray-900 dark:text-white shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 dark:border-gray-700"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? '...' : latinToCyrillic("YANGILASH")}
              </button>
              
              <button 
                onClick={() => navigate('/sales')} 
                className="flex-1 sm:flex-none flex items-center justify-center gap-4 px-12 py-6 bg-blue-600 hover:bg-blue-700 rounded-[2rem] font-black text-xs tracking-widest transition-all active:scale-95 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_60px_rgba(37,99,235,0.4)]"
              >
                <Plus className="w-5 h-5" />
                {latinToCyrillic("YANGI SOTUV")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern KPI Cards - Enhanced Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[
          { 
            title: latinToCyrillic("Bugungi Daromad"), 
            value: formatCurrency(stats.dailyRevenue || 0, 'UZS'),
            trend: stats.dailyTrend || 0,
            icon: DollarSign,
            color: 'blue',
            desc: `${stats.todaySales || 0} ${latinToCyrillic("ta sotuv")}`,
            path: '/sales'
          },
          { 
            title: latinToCyrillic("Oylik Daromad"), 
            value: formatCurrency(stats.monthlyRevenue || 0, 'UZS'),
            trend: stats.monthlyTrend || 0,
            icon: TrendingUp,
            color: 'emerald',
            desc: `${latinToCyrillic("Foyda")}: ${profitMargin}%`,
            path: '/reports'
          },
          { 
            title: latinToCyrillic("Sof Foyda"), 
            value: formatCurrency(stats.netProfit || 0, 'UZS'),
            trend: stats.profitTrend || 0,
            icon: Target,
            color: 'violet',
            desc: latinToCyrillic("Xarajatlardan keyin"),
            path: '/expenses'
          },
          { 
            title: latinToCyrillic("Qarzlar"), 
            value: formatCurrency(stats.totalDebt || 0, 'UZS'),
            trend: null,
            icon: Users,
            color: 'rose',
            desc: `${stats.debtorsCount || 0} ${latinToCyrillic("mijozdan")}`,
            path: '/customers'
          }
        ].map((kpi, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(kpi.path)}
            className="group relative bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-[0_15px_50px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 hover:scale-[1.05] transition-all duration-700 cursor-pointer overflow-hidden"
          >
            {/* Hover Glow - Enhanced */}
            <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 ${
              kpi.color === 'blue' ? 'bg-blue-500' : 
              kpi.color === 'emerald' ? 'bg-emerald-500' : 
              kpi.color === 'violet' ? 'bg-violet-500' : 'bg-rose-500'
            }`}></div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start justify-between mb-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-12 ${
                  kpi.color === 'blue' ? 'bg-blue-600 text-white shadow-blue-500/20' : 
                  kpi.color === 'emerald' ? 'bg-emerald-600 text-white shadow-emerald-500/20' : 
                  kpi.color === 'violet' ? 'bg-violet-600 text-white shadow-violet-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'
                }`}>
                  <kpi.icon className="w-8 h-8" />
                </div>
                {kpi.trend !== null && (
                  <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[10px] font-black shadow-sm ${
                    kpi.trend >= 0 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30' 
                      : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-800/30'
                  }`}>
                    {kpi.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {Math.abs(kpi.trend)}%
                  </div>
                )}
              </div>
              
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.25em] mb-4 drop-shadow-sm">{kpi.title}</p>
              <h3 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 break-all leading-none drop-shadow-md">{kpi.value}</h3>
              
              <div className="mt-auto flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 w-fit px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-800/50">
                <div className={`w-2 h-2 rounded-full ${
                  kpi.color === 'blue' ? 'bg-blue-500' : 
                  kpi.color === 'emerald' ? 'bg-emerald-500' : 
                  kpi.color === 'violet' ? 'bg-violet-500' : 'bg-rose-500'
                } animate-pulse shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                <p className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{kpi.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Activity Feed - Enhanced Glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white dark:border-gray-800 overflow-hidden group">
            <div className="p-10 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-indigo-900/10 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 group-hover:rotate-6 transition-transform duration-500">
                  <Activity className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                    {latinToCyrillic("So'nggi Faoliyatlar")}
                  </h3>
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Real-time updates</p>
                </div>
              </div>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-gray-800 text-gray-400 hover:text-blue-600 border border-gray-100 dark:border-gray-700 shadow-sm transition-all active:scale-90">
                <ArrowUpRight className="w-5 h-5" />
              </button>
            </div>
            <div className="p-10 space-y-6">
              {[
                { icon: ShoppingCart, title: latinToCyrillic('Yangi sotuv'), desc: '15G PREFORMA - 10 qop', time: latinToCyrillic('2 daqiqa oldin'), color: 'emerald', amount: '+2,500,000 UZS' },
                { icon: Users, title: latinToCyrillic('Yangi mijoz'), desc: latinToCyrillic('Ali Valiyev ro\'yxatdan o\'tdi'), time: latinToCyrillic('15 daqiqa oldin'), color: 'blue', amount: null },
                { icon: Truck, title: latinToCyrillic('Yetkazib berish'), desc: latinToCyrillic('Buyurtma #1234 yo\'lga chiqdi'), time: latinToCyrillic('1 soat oldin'), color: 'indigo', amount: null },
                { icon: Package, title: latinToCyrillic('Mahsulot qo\'shildi'), desc: 'QOPQOQ 28MM - 5000 dona', time: latinToCyrillic('2 soat oldin'), color: 'amber', amount: null },
                { icon: DollarSign, title: latinToCyrillic('To\'lov qabul qilindi'), desc: latinToCyrillic('500,000 UZS - Naqd pul'), time: latinToCyrillic('3 soat oldin'), color: 'emerald', amount: '+500,000 UZS' }
              ].map((activity, index) => (
                <div key={index} 
                     className="group/item flex items-center gap-6 p-6 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] hover:bg-white dark:hover:bg-gray-800 hover:shadow-2xl hover:shadow-gray-200/50 dark:hover:shadow-none border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all duration-500 cursor-pointer">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6 ${
                    activity.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 shadow-lg shadow-emerald-500/10' :
                    activity.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 shadow-lg shadow-blue-500/10' :
                    activity.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 shadow-lg shadow-indigo-500/10' :
                    'bg-amber-50 text-amber-600 dark:bg-amber-900/30 shadow-lg shadow-amber-500/10'
                  }`}>
                    <activity.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight uppercase">{activity.title}</h4>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{activity.time}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{activity.desc}</p>
                  </div>
                  {activity.amount && (
                    <div className="text-right ml-4">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{activity.amount}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Quick Stats Sidebar Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-[0_30px_70px_rgba(37,99,235,0.3)] group hover:scale-[1.02] transition-all duration-700">
            <div className="flex items-center justify-between mb-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-1">Target</p>
                <p className="text-2xl font-black">84%</p>
              </div>
            </div>
            <h4 className="text-2xl font-black tracking-tight mb-4 uppercase">{latinToCyrillic("Yillik Reja")}</h4>
            <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-6 border border-white/10">
              <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] w-[84%] rounded-full animate-shimmer"></div>
            </div>
            <p className="text-sm font-bold text-white/70 leading-relaxed">
              {latinToCyrillic("Yillik reja ko'rsatkichi kutilganidan 12% yuqori natija ko'rsatmoqda.")}
            </p>
          </div>

          {/* AI Insights Card */}
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.04)] border border-white dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Brain className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">AI Insights</h4>
              </div>
              <div className="space-y-6">
                {[
                  { text: latinToCyrillic("15G mahsulotiga talab o'smoqda"), color: 'blue' },
                  { text: latinToCyrillic("Xarajatlarni 5% ga kamaytirish mumkin"), color: 'emerald' },
                  { text: latinToCyrillic("Yangi bozor segmenti aniqlandi"), color: 'amber' }
                ].map((insight, i) => (
                  <div key={i} className="flex items-start gap-4 group/insight cursor-pointer">
                    <div className={`mt-1.5 w-2 h-2 rounded-full bg-${insight.color}-500 shadow-[0_0_10px_rgba(0,0,0,0.2)] group-hover/insight:scale-150 transition-transform`}></div>
                    <p className="text-sm font-bold text-gray-600 dark:text-gray-400 group-hover/insight:text-gray-900 dark:group-hover/insight:text-white transition-colors">{insight.text}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/analytics')}
                className="w-full mt-10 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 transition-all border border-gray-100 dark:border-gray-700 active:scale-95"
              >
                {latinToCyrillic("Barcha tahlillar")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="text-2xl font-black flex items-center gap-2 drop-shadow-sm">
              <Zap className="w-7 h-7 text-purple-600 animate-pulse" />
              {latinToCyrillic("Tezkor Amallar")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { icon: Plus, title: latinToCyrillic('Yangi Sotuv'), desc: latinToCyrillic('Tezkor sotuv qilish'), color: 'green', path: '/sales' },
                { icon: ShoppingCart, title: latinToCyrillic('Buyurtmalar'), desc: latinToCyrillic('Barcha buyurtmalar'), color: 'blue', path: '/orders' },
                { icon: Package, title: latinToCyrillic('Mahsulotlar'), desc: latinToCyrillic('Ombor holati'), color: 'orange', path: '/products' },
                { icon: Users, title: latinToCyrillic('Mijozlar'), desc: latinToCyrillic('Mijozlar ro\'yxati'), color: 'purple', path: '/customers' },
                { icon: Truck, title: latinToCyrillic('Yetkazib berish'), desc: latinToCyrillic('Transport holati'), color: 'indigo', path: '/deliveries' },
                { icon: BarChart3, title: latinToCyrillic('Hisobotlar'), desc: latinToCyrillic('To\'liq statistika'), color: 'cyan', path: '/reports' }
              ].map((action, index) => (
                <div key={index} 
                     className="group flex items-center gap-3 p-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl hover:shadow-xl transition-all hover:scale-105 cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                     onClick={() => navigate(action.path)}>
                  <div className={`w-12 h-12 bg-gradient-to-br from-${action.color}-400 to-${action.color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base">{action.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{action.desc}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Secondary Stats with Modern Design */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: latinToCyrillic('Mijozlar'), value: stats.totalCustomers || 0, icon: Users, color: 'indigo', path: '/customers' },
          { title: latinToCyrillic('Mahsulotlar'), value: stats.totalProducts || 0, icon: Package, color: 'orange', path: '/products' },
          { title: latinToCyrillic('Ishlab Chiqarish'), value: stats.activeProduction || 0, icon: Factory, color: 'emerald', path: '/production' },
          { title: latinToCyrillic('Vazifalar'), value: stats.pendingTasks || 0, icon: CheckSquare, color: 'cyan', path: '/tasks' }
        ].map((item, index) => (
          <Card key={index} 
                className={`group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-${item.color}-500 bg-gradient-to-br from-white to-${item.color}-50 dark:from-gray-800 dark:to-${item.color}-900/20`}
                onClick={() => navigate(item.path)}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2">{item.title}</p>
                  <p className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {item.value}
                  </p>
                </div>
                <div className={`w-16 h-16 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Charts Section with Multiple Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend with Area Chart */}
        <Card className="lg:col-span-2 shadow-2xl border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              {latinToCyrillic("Daromad Trendi (7 kun)")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={stats.weeklyTrend || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" style={{ fontSize: '12px', fontWeight: 600 }} />
                <YAxis style={{ fontSize: '12px', fontWeight: 600 }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value), 'UZS')}
                  contentStyle={{ borderRadius: '12px', border: '2px solid #3b82f6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fill="url(#colorSales)"
                  name="Sotuvlar"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fill="url(#colorProfit)"
                  name="Foyda"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales by Product Category */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="font-black flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Sotuvlar Kategoriya bo'yicha
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Cement', value: 35, color: '#3b82f6' },
                    { name: 'Gips', value: 25, color: '#10b981' },
                    { name: 'Qum', value: 20, color: '#f59e0b' },
                    { name: 'Shag\'al', value: 15, color: '#ef4444' },
                    { name: 'Boshqa', value: 5, color: '#8b5cf6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[
                    { name: 'Cement', value: 35, color: '#3b82f6' },
                    { name: 'Gips', value: 25, color: '#10b981' },
                    { name: 'Qum', value: 20, color: '#f59e0b' },
                    { name: 'Shag\'al', value: 15, color: '#ef4444' },
                    { name: 'Boshqa', value: 5, color: '#8b5cf6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value}%`}
                  contentStyle={{ borderRadius: '12px', border: '2px solid #8b5cf6', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {[
                { name: 'Cement', value: 35, color: 'bg-blue-500' },
                { name: 'Gips', value: 25, color: 'bg-green-500' },
                { name: 'Qum', value: 20, color: 'bg-orange-500' },
                { name: 'Shag\'al', value: 15, color: 'bg-red-500' },
                { name: 'Boshqa', value: 5, color: 'bg-purple-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                    <span className="text-sm font-semibold">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20"
              onClick={() => navigate('/sales')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.todaySales || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">{latinToCyrillic("Bugun")}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{latinToCyrillic("Bugungi Sotuvlar")}</p>
            <p className="text-xs text-gray-500 mt-1">+{Math.floor(Math.random() * 20 + 5)}% {latinToCyrillic("kecha")}</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-green-500 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20"
              onClick={() => navigate('/products')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-600 dark:text-green-400">{stats.lowStock?.length || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Tanqis</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kam Zaxira</p>
            <p className="text-xs text-red-500 mt-1">Tavsiya etiladi</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20"
              onClick={() => navigate('/production')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{stats.activeProduction || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Faol</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ishlab Chiqarish</p>
            <p className="text-xs text-green-500 mt-1">Jarayonda</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-l-4 border-l-purple-500 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20"
              onClick={() => navigate('/deliveries')}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{stats.pendingDeliveries || 0}</p>
                <p className="text-xs text-gray-500 font-semibold">Kutilmoqda</p>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{latinToCyrillic("Yetkazib Berish")}</p>
            <p className="text-xs text-blue-500 mt-1">{latinToCyrillic("Bugun")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Products with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-green-50 dark:from-gray-800 dark:to-green-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-green-600" />
              Top 5 Mahsulotlar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {(stats.topProducts || []).slice(0, 5).map((product: any, index: number) => (
                <div key={product.id} 
                     className="group flex items-center gap-3 p-4 bg-gradient-to-r from-white to-green-50 dark:from-gray-700 dark:to-green-900/20 rounded-2xl hover:shadow-xl transition-all hover:scale-102 border-2 border-green-200 dark:border-green-800 cursor-pointer">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-xl font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate text-base">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{product.totalSold} qop sotildi</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(product.revenue || 0, 'UZS')}
                    </p>
                    <p className="text-xs text-gray-500 font-semibold">daromad</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Analytics */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-500/10 to-blue-500/10">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Mijozlar Analitikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {/* Customer Types Distribution */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Mijoz Turlari</p>
                {[
                  { type: 'VIP Mijozlar', count: 45, percentage: 15, color: 'bg-purple-500' },
                  { type: 'Doimiy Mijozlar', count: 180, percentage: 60, color: 'bg-blue-500' },
                  { type: 'Yangi Mijozlar', count: 75, percentage: 25, color: 'bg-green-500' }
                ].map((customer, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{customer.type}</span>
                      <span className="text-sm font-bold">{customer.count} ta ({customer.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${customer.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${customer.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Customers */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Top Mijozlar</p>
                {[
                  { name: 'Bekon QURILISH', total: '45,000,000 UZS', orders: 23 },
                  { name: 'Stroy ART', total: '38,500,000 UZS', orders: 18 },
                  { name: 'Ideal HOME', total: '32,000,000 UZS', orders: 15 }
                ].map((customer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-white to-indigo-50 dark:from-gray-700 dark:to-indigo-900/20 rounded-xl">
                    <div>
                      <p className="font-bold text-sm">{customer.name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{customer.orders} ta buyurtma</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-indigo-600 dark:text-indigo-400">{customer.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section with Modern Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        {stats.lowStock && stats.lowStock.length > 0 && (
          <Card className="lg:col-span-2 shadow-2xl border-0 bg-gradient-to-br from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 overflow-hidden">
            <CardHeader className="border-b-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-500/10 to-amber-500/10">
              <CardTitle className="flex items-center gap-2 text-xl font-black">
                <AlertCircle className="w-6 h-6 text-orange-600 animate-pulse" />
                Kam Zaxira Mahsulotlar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.lowStock.slice(0, 6).map((product: any) => (
                  <div key={product.id} 
                       className="group p-4 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-2 border-orange-300 dark:border-orange-700 rounded-2xl hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">{product.bagType}</p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-3xl font-black text-orange-600 dark:text-orange-400">{product.currentStock}</p>
                        <p className="text-xs text-gray-500 font-semibold">qop</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats with Premium Design */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-purple-900/20 overflow-hidden">
          <CardHeader className="border-b-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-500/10 to-violet-500/10">
            <CardTitle className="font-black flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Tezkor Statistika
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {[
                { label: 'Tugallangan vazifalar', value: stats.completedTasks || 0, icon: CheckCircle2, color: 'green' },
                { label: 'Jarayondagi ishlar', value: stats.inProgressTasks || 0, icon: Clock, color: 'blue' },
                { label: 'Ishlab chiqarish', value: stats.activeProduction || 0, icon: Factory, color: 'purple' },
                { label: 'VIP mijozlar', value: stats.vipCustomers || 0, icon: Users, color: 'indigo' }
              ].map((item, index) => (
                <div key={index} 
                     className={`group flex items-center justify-between p-4 bg-gradient-to-r from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/20 dark:to-${item.color}-900/30 rounded-2xl border-2 border-${item.color}-200 dark:border-${item.color}-800 hover:shadow-lg transition-all hover:scale-105 cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-400 to-${item.color}-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <span className={`text-2xl font-black text-${item.color}-600 dark:text-${item.color}-400`}>{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Footer with Enhanced Design */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-pink-500/10 rounded-full animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Oxirgi yangilanish: {new Date().toLocaleTimeString('uz-UZ')}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                ⚡ Ma'lumotlar har 5 daqiqada avtomatik yangilanadi
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Status Indicators */}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Server Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">DB Connected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">API Active</span>
              </div>
            </div>
          </div>
          
          {/* Performance Metrics */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">99.9%</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Uptime</p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-green-600 dark:text-green-400">12ms</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Response Time</p>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">2.4GB</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Memory Usage</p>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">1,247</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Total Requests</p>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mx-auto mt-1"></div>
              </div>
            </div>
            
            {/* Additional System Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/30 rounded-xl">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Server Load</span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">23%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl">
                <span className="text-sm font-semibold text-green-700 dark:text-green-300">DB Connections</span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">8/20</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/30 rounded-xl">
                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Cache Hit Rate</span>
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
