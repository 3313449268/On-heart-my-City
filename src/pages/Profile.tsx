import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { User, Heart, Clock, Star, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/profile', label: '个人信息', icon: User },
  { path: '/profile/favorites', label: '我的收藏', icon: Heart },
  { path: '/profile/history', label: '历史记录', icon: Clock },
  { path: '/profile/reviews', label: '我的评价', icon: Star },
];

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoggedIn, logout } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-slate-50 pt-[64px] lg:pt-[80px]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <div className="card p-6 sticky top-8">
              <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-slate-100">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.username}
                  className="w-20 h-20 rounded-full border-4 border-emerald-100 mb-3"
                />
                <h3 className="font-serif-sc text-lg font-bold text-slate-800">
                  {currentUser.username}
                </h3>
                <p className="text-sm text-slate-500">{currentUser.phone}</p>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === '/profile'
                      ? location.pathname === '/profile'
                      : location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                        isActive
                          ? 'bg-emerald-50 text-emerald-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5" />
                <span>退出登录</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
