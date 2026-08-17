import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  Megaphone,
  FileText,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/admin/cities', label: '城市管理', icon: Building2 },
  { path: '/admin/users', label: '用户管理', icon: Users },
  { path: '/admin/reviews', label: '评价审核', icon: MessageSquare },
  { path: '/admin/notes', label: '笔记管理', icon: FileText },
  { path: '/admin/announcements', label: '公告管理', icon: Megaphone },
];

const pageTitleMap: Record<string, string> = {
  '/admin/dashboard': '仪表盘',
  '/admin/cities': '城市管理',
  '/admin/users': '用户管理',
  '/admin/reviews': '评价审核',
  '/admin/notes': '笔记管理',
  '/admin/announcements': '公告管理',
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUsername, setAdminUsername] = useState('');

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isLoggedIn) {
      navigate('/admin/login');
      return;
    }
    const username = localStorage.getItem('adminUsername') || 'admin';
    setAdminUsername(username);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    navigate('/admin/login');
  };

  const currentTitle = pageTitleMap[location.pathname] || '管理后台';

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 transition-all duration-300 z-40',
          sidebarOpen ? 'w-64' : 'w-20'
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <h1 className="text-white font-bold text-lg whitespace-nowrap">如意后台</h1>
                <p className="text-slate-500 text-xs whitespace-nowrap">管理系统</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {sidebarOpen && (
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">退出登录</span>}
          </button>
        </div>
      </aside>

      <div
        className={cn(
          'transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">{currentTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">{adminUsername}</p>
                <p className="text-xs text-slate-400">管理员</p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
