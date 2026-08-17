import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useUserStore } from '@/store/useUserStore';

const navItems = [
  { name: '首页', path: '/' },
  { name: '智能匹配', path: '/match' },
  { name: '城市大全', path: '/cities' },
  { name: '城市对比', path: '/compare' },
  { name: '分享社区', path: '/community' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isLoggedIn, currentUser, logout } = useUserStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass-effect shadow-sm border-b border-slate-200/50',
       
      )}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-serif-sc text-2xl font-bold gradient-text">
              如意城市
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium transition-colors duration-200',
                  isActive(item.path)
                    ? 'text-emerald-600'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {item.name}
                <span
                  className={cn(
                    'absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300',
                    isActive(item.path) ? 'w-1/2' : 'w-0 group-hover:w-1/2'
                  )}
                />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索城市..."
                className="pl-10 pr-4 py-2 w-48 rounded-full bg-slate-100 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white transition-all duration-200"
              />
            </div>

            {isLoggedIn && currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors duration-200"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-500 transition-transform duration-200',
                      isDropdownOpen && 'rotate-180'
                    )}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 animate-fade-in">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-800">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{currentUser.phone}</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/profile');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      个人中心
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:from-emerald-600 hover:to-teal-600 hover:shadow-md transition-all duration-200"
                >
                  注册
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-600" />
            ) : (
              <Menu className="w-6 h-6 text-slate-600" />
            )}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive(item.path)
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              {isLoggedIn && currentUser ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {currentUser.username}
                      </p>
                      <p className="text-xs text-slate-500">{currentUser.phone}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 py-2.5 text-center text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all"
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
