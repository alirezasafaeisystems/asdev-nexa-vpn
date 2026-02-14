'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield, Zap, Globe, Clock, Users, Server, CreditCard,
  Ticket, MessageCircle, Settings, LogOut, Menu, X, Check,
  ChevronLeft, Copy, QrCode, Download, Upload, AlertCircle,
  Crown, Rocket, Star, Headphones, Lock, Wifi, Activity,
  BarChart3, FileText, UserPlus, Ban, CheckCircle, XCircle,
  RefreshCw, ExternalLink, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { BRAND } from '@/lib/brand';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';

// ============================================
// Types
// ============================================
interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  role: 'USER' | 'SUPPORT' | 'ADMIN';
  hasUsedTrial: boolean;
}

interface Plan {
  id: string;
  name: string;
  nameFa: string;
  description: string | null;
  descriptionFa: string | null;
  priceUsd: number;
  priceToman: number | null;
  durationDays: number;
  durationLabel: string | null;
  trafficGB: number | null;
  maxDevices: number;
  features: string | null;
  featuresFa: string | null;
  isTrial: boolean;
  isActive: boolean;
}

interface Server {
  id: string;
  name: string;
  location: string;
  countryCode: string;
  status: string;
  loadPercent: number;
}

interface Subscription {
  id: string;
  status: string;
  expiresAt: string;
  trafficGB: number | null;
  usedGB: number;
  plan: Plan;
  server?: Server;
}

interface Config {
  id: string;
  uuid: string;
  configUrl: string | null;
  protocol: string;
  server: Server;
  expiresAt: string;
  isActive: boolean;
}

interface Invoice {
  id: string;
  status: string;
  amountUsd: number;
  asset: string;
  amountAsset: number;
  address: string;
  createdAt: string;
  plan: Plan;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  lastMessageAt: string;
}

// ============================================
// API Helper
// ============================================
const api = {
  async get<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API Error');
    }
    return res.json();
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'API Error');
    }
    return res.json();
  },
};

// ============================================
// Auth Hook
// ============================================
function useAuth() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get<{ user: User }>('/api/v1/auth/me').then(r => r.user),
    retry: false,
  });
}

// ============================================
// Data Hooks
// ============================================
function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<{ plans: Plan[] }>('/api/v1/plans').then(r => r.plans),
  });
}

function useServers() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => api.get<{ servers: Server[] }>('/api/v1/servers').then(r => r.servers),
  });
}

function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => api.get<{ subscriptions: Subscription[] }>('/api/v1/subscriptions').then(r => r.subscriptions),
  });
}

function useConfigs() {
  return useQuery({
    queryKey: ['configs'],
    queryFn: () => api.get<{ configs: Config[] }>('/api/v1/configs').then(r => r.configs),
  });
}

function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => api.get<{ invoices: Invoice[] }>('/api/v1/invoices').then(r => r.invoices),
  });
}

function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.get<{ tickets: Ticket[] }>('/api/v1/tickets').then(r => r.tickets),
  });
}

// ============================================
// Landing Page Component
// ============================================
function LandingPage({ onLogin }: { onLogin: () => void }) {
  const { data: plans } = usePlans();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!email || !password) {
      toast({ title: 'خطا', description: 'لطفاً ایمیل و رمز عبور را وارد کنید', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/v1/auth/login' : '/api/v1/auth/register';
      await api.post(endpoint, { email, password });
      onLogin();
      toast({ title: isLogin ? 'خوش آمدید!' : 'ثبت‌نام موفق!', description: 'در حال ورود...' });
    } catch (err) {
      toast({
        title: 'خطا',
        description: err instanceof Error ? err.message : 'خطا در احراز هویت',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, title: 'سرعت بالا', desc: 'سرورهای بهینه‌شده برای حداکثر سرعت' },
    { icon: Shield, title: 'امنیت نظامی', desc: 'رمزگذاری AES-256 برای حفظ حریم خصوصی' },
    { icon: Globe, title: 'سرورهای جهانی', desc: 'دسترسی به سرورهای آلمان، هلند، فنلاند و...' },
    { icon: Clock, title: 'آنلاین ۲۴/۷', desc: 'پشتیبانی همیشگی از طریق تلگرام' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                NexaVPN
              </h1>
              <p className="text-xs text-slate-400">نسل بعدی امنیت دیجیتال</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-300" onClick={() => { setIsLogin(true); setShowAuth(true); }}>
              ورود
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500" onClick={() => { setIsLogin(false); setShowAuth(true); }}>
              شروع رایگان
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-6 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1">
          <Rocket className="h-3 w-3 ml-2" />
          ۳ روز رایگان آزمایشی
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          اینترنت آزاد
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            بدون محدودیت
          </span>
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
          با نکساوی‌پی‌ان به دنیای بدون مرز متصل شوید. سرعت بالا، امنیت تضمینی و پشتیبانی ۲۴ ساعته.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8" onClick={() => { setIsLogin(false); setShowAuth(true); }}>
            شروع رایگان
            <ChevronLeft className="mr-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="border-slate-700 text-slate-300" onClick={() => document.getElementById('pricing')?.scrollIntoView()}>
            مشاهده پلن‌ها
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-16">
          {[
            { value: '۱۰+۵', label: 'کاربر فعال' },
            { value: '۳', label: 'سرور فعال' },
            { value: '۹۹.۹٪', label: 'آپتایم' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
              <p className="text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-cyan-500/30 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mb-3">
                  <f.icon className="h-6 w-6 text-cyan-400" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 text-sm">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">پلن‌های اشتراک</h2>
          <p className="text-slate-400">پلن مناسب خود را انتخاب کنید</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans?.filter(p => !p.isTrial).map((plan, i) => (
            <Card key={plan.id} className={`relative bg-slate-900/50 border-slate-800 ${i === 1 ? 'border-cyan-500/50 ring-1 ring-cyan-500/20' : ''}`}>
              {i === 1 && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600">
                  <Star className="h-3 w-3 ml-1" />
                  محبوب‌ترین
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{plan.nameFa}</CardTitle>
                <CardDescription className="text-slate-500">{plan.descriptionFa}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.priceUsd}$</span>
                  <span className="text-slate-500">/ماه</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.featuresFa && JSON.parse(plan.featuresFa).map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-cyan-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${i === 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                  onClick={() => { setIsLogin(false); setShowAuth(true); }}
                >
                  انتخاب پلن
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Trial Banner */}
        <div className="mt-12 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl border border-cyan-500/20 max-w-3xl mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">۳ روز رایگان آزمایشی</h3>
          <p className="text-slate-400 mb-4">قبل از خرید، سرویس را رایگان امتحان کنید</p>
          <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10" onClick={() => { setIsLogin(false); setShowAuth(true); }}>
            درخواست آزمایشی
          </Button>
        </div>
      </section>

      {/* How to Use */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">نحوه استفاده</h2>
          <p className="text-slate-400">فقط در ۳ مرحله ساده</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { step: '۱', title: 'ثبت‌نام', desc: 'با ایمیل خود ثبت‌نام کنید' },
            { step: '۲', title: 'پرداخت', desc: 'پلن مورد نظر را خریداری کنید' },
            { step: '۳', title: 'اتصال', desc: 'کانفیگ را دریافت و وصل شوید' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-slate-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-bold text-white">{BRAND.productName}</span>
          </div>
          <p className="text-sm">پشتیبانی: {BRAND.supportTelegram} در تلگرام</p>
          <p className="text-sm mt-2">
            <Link href="/brand" className="text-cyan-400 hover:text-cyan-300">
              توسعه و اجرا توسط {BRAND.ownerName} ({BRAND.masterBrandName})
            </Link>
          </p>
          <p className="text-xs mt-2">© ۱۴۰۴ نکساوی‌پی‌ان - تمامی حقوق محفوظ است</p>
        </div>
      </footer>

      {/* Auth Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>{isLogin ? 'ورود به حساب' : 'ثبت‌نام'}</DialogTitle>
            <DialogDescription className="text-slate-400">
              {isLogin ? 'خوش برگشتید!' : 'با ایمیل خود ثبت‌نام کنید'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">ایمیل</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-slate-300">رمز عبور</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                dir="ltr"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="ghost" className="text-slate-400" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'حساب ندارید؟' : 'حساب دارید؟'}
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600" onClick={handleAuth} disabled={loading}>
              {loading ? 'لطفاً صبر کنید...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Dashboard Layout
// ============================================
function DashboardLayout({
  user,
  activeTab,
  onTabChange,
  onLogout,
}: {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'داشبورد', icon: Activity },
    { id: 'configs', label: 'کانفیگ‌ها', icon: Download },
    { id: 'subscriptions', label: 'اشتراک‌ها', icon: Crown },
    { id: 'invoices', label: 'پرداخت‌ها', icon: CreditCard },
    { id: 'tickets', label: 'پشتیبانی', icon: Headphones },
    ...(user.role === 'ADMIN' ? [
      { id: 'admin-users', label: 'کاربران', icon: Users },
      { id: 'admin-servers', label: 'سرورها', icon: Server },
      { id: 'admin-plans', label: 'پلن‌ها', icon: Settings },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex" dir="rtl">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'fixed inset-y-0 right-0 z-50' : 'hidden md:block'} w-64 bg-slate-900 border-l border-slate-800 flex-shrink-0`}>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">NexaVPN</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${activeTab === item.id ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:text-white'}`}
              onClick={() => { onTabChange(item.id); setSidebarOpen(false); }}
            >
              <item.icon className="h-4 w-4 ml-2" />
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="bg-gradient-to-br from-cyan-400 to-blue-600">
              <AvatarFallback className="bg-transparent text-white">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName || 'کاربر'}</p>
              <p className="text-xs text-slate-500 truncate" dir="ltr">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full text-slate-400 hover:text-white" onClick={onLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            خروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="border-b border-slate-800 bg-slate-900 p-4 flex items-center gap-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-bold">NexaVPN</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {activeTab === 'dashboard' && <DashboardContent user={user} />}
            {activeTab === 'configs' && <ConfigsContent />}
            {activeTab === 'subscriptions' && <SubscriptionsContent />}
            {activeTab === 'invoices' && <InvoicesContent />}
            {activeTab === 'tickets' && <TicketsContent />}
            {activeTab === 'admin-users' && <AdminUsersContent />}
            {activeTab === 'admin-servers' && <AdminServersContent />}
            {activeTab === 'admin-plans' && <AdminPlansContent />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================
// Dashboard Content
// ============================================
function DashboardContent({ user }: { user: User }) {
  const { data: subscriptions } = useSubscriptions();
  const { data: configs } = useConfigs();
  const { data: invoices } = useInvoices();
  const { data: tickets } = useTickets();

  const activeSub = subscriptions?.find(s => s.status === 'ACTIVE');
  const pendingInvoices = invoices?.filter(i => i.status === 'PENDING').length || 0;
  const openTickets = tickets?.filter(t => t.status !== 'CLOSED').length || 0;
  const activeConfigs = configs?.filter(c => c.isActive).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">خوش آمدید! 👋</h1>
        <p className="text-slate-400">داشبورد مدیریت اشتراک</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          {
            label: 'اشتراک فعال',
            value: activeSub ? activeSub.plan.nameFa : 'ندارید',
            icon: Crown,
            bgClass: 'bg-cyan-500/20',
            iconClass: 'text-cyan-400',
          },
          {
            label: 'کانفیگ فعال',
            value: activeConfigs,
            icon: Download,
            bgClass: 'bg-blue-500/20',
            iconClass: 'text-blue-400',
          },
          {
            label: 'پرداخت در انتظار',
            value: pendingInvoices,
            icon: CreditCard,
            bgClass: 'bg-yellow-500/20',
            iconClass: 'text-yellow-400',
          },
          {
            label: 'تیکت باز',
            value: openTickets,
            icon: Ticket,
            bgClass: 'bg-purple-500/20',
            iconClass: 'text-purple-400',
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgClass}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Subscription */}
      {activeSub && (
        <Card className="bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border-cyan-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-cyan-400" />
              اشتراک فعال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xl font-bold">{activeSub.plan.nameFa}</p>
                <p className="text-slate-400">
                  انقضا: {format(new Date(activeSub.expiresAt), 'yyyy/MM/dd', { locale: faIR })}
                </p>
              </div>
              {activeSub.server && (
                <Badge className="bg-slate-800">
                  🇩🇪 {activeSub.server.location}
                </Badge>
              )}
            </div>
            {activeSub.trafficGB && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>مصرف ترافیک</span>
                  <span>{activeSub.usedGB.toFixed(1)} / {activeSub.trafficGB} گیگ</span>
                </div>
                <Progress value={(activeSub.usedGB / activeSub.trafficGB) * 100} className="h-2" />
              </div>
            )}
            {!activeSub.trafficGB && (
              <p className="text-cyan-400 text-sm">ترافیک نامحدود ♾️</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>دسترسی سریع</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
            <Crown className="h-4 w-4 ml-2" />
            خرید اشتراک
          </Button>
          <Button variant="outline" className="border-slate-700">
            <Download className="h-4 w-4 ml-2" />
            دریافت کانفیگ
          </Button>
          <Button variant="outline" className="border-slate-700">
            <MessageCircle className="h-4 w-4 ml-2" />
            تماس با پشتیبانی
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Configs Content
// ============================================
function ConfigsContent() {
  const { data: configs, isLoading } = useConfigs();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'کپی شد!', description: 'لینک کانفیگ کپی شد' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">کانفیگ‌های VPN</h1>
          <p className="text-slate-400">لینک‌های اتصال شما</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">در حال بارگذاری...</div>
      ) : configs && configs.length > 0 ? (
        <div className="space-y-4">
          {configs.map((config) => (
            <Card key={config.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="font-medium">{config.server.location}</p>
                      <p className="text-sm text-slate-400">{config.protocol.toUpperCase()}</p>
                    </div>
                  </div>
                  <Badge variant={config.isActive ? 'default' : 'secondary'} className={config.isActive ? 'bg-green-500/20 text-green-400' : ''}>
                    {config.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                
                {config.configUrl && (
                  <div className="bg-slate-800 p-3 rounded-lg">
                    <p className="text-xs text-slate-400 truncate" dir="ltr">{config.configUrl.substring(0, 60)}...</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="border-slate-700" onClick={() => config.configUrl && copyToClipboard(config.configUrl)}>
                    <Copy className="h-4 w-4 ml-1" />
                    کپی
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-700">
                    <QrCode className="h-4 w-4 ml-1" />
                    QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="py-12 text-center">
            <Download className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">هنوز کانفیگی ندارید</p>
            <p className="text-sm text-slate-500 mt-2">ابتدا یک اشتراک خریداری کنید</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============================================
// Subscriptions Content
// ============================================
function SubscriptionsContent() {
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: plans } = usePlans();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createInvoice = useMutation({
    mutationFn: (planId: string) => api.post('/api/v1/invoices', { planId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setShowPayment(false);
      toast({ title: 'فاکتور ایجاد شد', description: 'لطفاً پرداخت را تکمیل کنید' });
    },
    onError: (err) => {
      toast({
        title: 'خطا',
        description: err instanceof Error ? err.message : 'خطا در ایجاد فاکتور',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">اشتراک‌ها</h1>
          <p className="text-slate-400">مدیریت اشتراک‌های شما</p>
        </div>
      </div>

      {/* Current Subscriptions */}
      {subscriptions && subscriptions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle>اشتراک‌های شما</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="font-medium">{sub.plan.nameFa}</p>
                    <p className="text-sm text-slate-400">
                      انقضا: {format(new Date(sub.expiresAt), 'yyyy/MM/dd')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub.server && (
                      <Badge className="bg-slate-700">{sub.server.location}</Badge>
                    )}
                    <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'} className={sub.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : ''}>
                      {sub.status === 'ACTIVE' ? 'فعال' : sub.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle>خرید اشتراک جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {plans?.filter(p => !p.isTrial).map((plan) => (
              <Card key={plan.id} className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{plan.nameFa}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold mb-2">${plan.priceUsd}</p>
                  <ul className="space-y-1 text-sm text-slate-400 mb-4">
                    {plan.featuresFa && JSON.parse(plan.featuresFa).slice(0, 3).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-cyan-400" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
                    onClick={() => { setSelectedPlan(plan); setShowPayment(true); }}
                  >
                    انتخاب
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>تکمیل خرید</DialogTitle>
            <DialogDescription className="text-slate-400">
              پرداخت با ارز دیجیتال (USDT)
            </DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div className="text-center py-4 bg-slate-800/50 rounded-lg">
                <p className="text-3xl font-bold">${selectedPlan.priceUsd}</p>
                <p className="text-slate-400">{selectedPlan.nameFa}</p>
              </div>

              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400 text-sm">
                  آدرس کیف پول زیر را در شبکه TRC20 شارژ کنید
                </AlertDescription>
              </Alert>

              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">آدرس USDT (TRC20)</p>
                <p className="font-mono text-sm break-all" dir="ltr">TJx1234567890abcdefghijklmnop...</p>
                <Button variant="ghost" size="sm" className="mt-2 text-cyan-400" onClick={() => navigator.clipboard.writeText('TJx1234567890abcdefghijklmnop')}>
                  <Copy className="h-3 w-3 ml-1" />
                  کپی آدرس
                </Button>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                زمان باقی‌مانده: ۶۰ دقیقه
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600"
              onClick={() => selectedPlan && createInvoice.mutate(selectedPlan.id)}
              disabled={createInvoice.isPending}
            >
              {createInvoice.isPending ? 'در حال ایجاد...' : 'ایجاد فاکتور'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Invoices Content
// ============================================
function InvoicesContent() {
  const { data: invoices, isLoading } = useInvoices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">پرداخت‌ها</h1>
        <p className="text-slate-400">تاریخچه پرداخت‌های شما</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">در حال بارگذاری...</div>
          ) : invoices && invoices.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.plan.nameFa}</p>
                    <p className="text-sm text-slate-400">
                      {format(new Date(invoice.createdAt), 'yyyy/MM/dd HH:mm')}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">${invoice.amountUsd}</p>
                    <Badge variant={
                      invoice.status === 'PAID' ? 'default' :
                      invoice.status === 'PENDING' ? 'secondary' :
                      'destructive'
                    } className={invoice.status === 'PAID' ? 'bg-green-500/20 text-green-400' : ''}>
                      {invoice.status === 'PAID' ? 'پرداخت شده' :
                       invoice.status === 'PENDING' ? 'در انتظار' : invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز پرداختی ندارید</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Tickets Content
// ============================================
function TicketsContent() {
  const { data: tickets } = useTickets();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTicket = useMutation({
    mutationFn: (data: { subject: string; body: string }) => api.post('/api/v1/tickets', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      setShowNewTicket(false);
      setSubject('');
      setBody('');
      toast({ title: 'تیکت ارسال شد', description: 'به زودی پاسخ می‌دهیم' });
    },
    onError: (err) => {
      toast({
        title: 'خطا',
        description: err instanceof Error ? err.message : 'خطا در ارسال تیکت',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">پشتیبانی</h1>
          <p className="text-slate-400">تیکت‌های پشتیبانی</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600" onClick={() => setShowNewTicket(true)}>
          <Send className="h-4 w-4 ml-2" />
          تیکت جدید
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {tickets && tickets.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-slate-400">
                      {format(new Date(ticket.createdAt), 'yyyy/MM/dd')}
                    </p>
                  </div>
                  <Badge variant={
                    ticket.status === 'CLOSED' ? 'secondary' :
                    ticket.status === 'PENDING_SUPPORT' ? 'default' : 'outline'
                  } className={ticket.status === 'PENDING_SUPPORT' ? 'bg-yellow-500/20 text-yellow-400' : ''}>
                    {ticket.status === 'CLOSED' ? 'بسته شده' :
                     ticket.status === 'PENDING_SUPPORT' ? 'در انتظار پاسخ' : 'باز'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>تیکتی ندارید</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>تیکت جدید</DialogTitle>
            <DialogDescription className="text-slate-400">
              مشکل خود را شرح دهید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">موضوع</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="موضوع تیکت"
                className="bg-slate-800 border-slate-700"
              />
            </div>
            <div>
              <Label className="text-slate-300">پیام</Label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="مشکل خود را شرح دهید..."
                rows={5}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-600"
              onClick={() => createTicket.mutate({ subject, body })}
              disabled={createTicket.isPending || !subject || !body}
            >
              {createTicket.isPending ? 'در حال ارسال...' : 'ارسال تیکت'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Admin: Users Content
// ============================================
function AdminUsersContent() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<{ users: Array<User & { _count?: { subscriptions: number; tickets: number } }> }>('/api/v1/admin/users').then(r => r.users),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>
        <p className="text-slate-400">لیست کاربران سیستم</p>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">در حال بارگذاری...</div>
          ) : users && users.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="bg-gradient-to-br from-cyan-400 to-blue-600">
                      <AvatarFallback className="bg-transparent text-white">
                        {user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium" dir="ltr">{user.email}</p>
                      <p className="text-sm text-slate-400">
                        {user._count?.subscriptions || 0} اشتراک • {user._count?.tickets || 0} تیکت
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      user.role === 'ADMIN' ? 'default' :
                      user.role === 'SUPPORT' ? 'secondary' : 'outline'
                    } className={user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' : ''}>
                      {user.role === 'ADMIN' ? 'مدیر' : user.role === 'SUPPORT' ? 'پشتیبان' : 'کاربر'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">کاربری یافت نشد</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Admin: Servers Content
// ============================================
function AdminServersContent() {
  const { data: servers, isLoading } = useQuery({
    queryKey: ['admin', 'servers'],
    queryFn: () => api.get<{ servers: Server[] }>('/api/v1/admin/servers').then(r => r.servers),
  });

  const countryFlags: Record<string, string> = {
    DE: '🇩🇪',
    NL: '🇳🇱',
    FI: '🇫🇮',
    US: '🇺🇸',
    UK: '🇬🇧',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت سرورها</h1>
          <p className="text-slate-400">وضعیت سرورهای VPN</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Server className="h-4 w-4 ml-2" />
          افزودن سرور
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 p-12 text-center text-slate-400">در حال بارگذاری...</div>
        ) : servers && servers.length > 0 ? (
          servers.map((server) => (
            <Card key={server.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{countryFlags[server.countryCode] || '🌐'}</span>
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-sm text-slate-400">{server.location}</p>
                    </div>
                  </div>
                  <Badge variant={server.status === 'ONLINE' ? 'default' : 'destructive'} className={server.status === 'ONLINE' ? 'bg-green-500/20 text-green-400' : ''}>
                    {server.status === 'ONLINE' ? 'آنلاین' : 'آفلاین'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">مصرف CPU</span>
                    <span>{server.loadPercent}%</span>
                  </div>
                  <Progress value={server.loadPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 p-12 text-center text-slate-400">
            سروری یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Admin: Plans Content
// ============================================
function AdminPlansContent() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin', 'plans'],
    queryFn: () => api.get<{ plans: Plan[] }>('/api/v1/admin/plans').then(r => r.plans),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت پلن‌ها</h1>
          <p className="text-slate-400">تنظیم پلن‌های اشتراک</p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-600">
          <Settings className="h-4 w-4 ml-2" />
          افزودن پلن
        </Button>
      </div>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">در حال بارگذاری...</div>
          ) : plans && plans.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {plans.map((plan) => (
                <div key={plan.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{plan.nameFa} ({plan.name})</p>
                    <p className="text-sm text-slate-400">
                      ${plan.priceUsd} • {plan.durationDays} روز • {plan.trafficGB ? `${plan.trafficGB} گیگ` : 'نامحدود'}
                    </p>
                  </div>
                  <Badge variant={plan.isActive ? 'default' : 'secondary'} className={plan.isActive ? 'bg-green-500/20 text-green-400' : ''}>
                    {plan.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">پلنی یافت نشد</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Main Page Component
// ============================================
export default function Page() {
  const { data: user, isLoading, refetch, error } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await api.post('/api/v1/auth/logout');
    queryClient.clear();
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <p className="text-slate-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user || error) {
    return <LandingPage onLogin={() => refetch()} />;
  }

  return (
    <DashboardLayout
      user={user}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    />
  );
}
