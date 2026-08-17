import { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Leaf,
  Github,
  Chrome,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useUserStore((state) => state.login);
  const showToast = useUIStore((state) => state.showToast);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});

  const from = (location.state as { from?: string })?.from || '/';

  const validateForm = () => {
    const newErrors: { phone?: string; password?: string } = {};

    if (!phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      newErrors.phone = '请输入正确的手机号格式';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      const success = login(phone, password);

      if (success) {
        showToast('登录成功，欢迎回来！', 'success');
        navigate(from, { replace: true });
      } else {
        showToast('登录失败，请重试', 'error');
      }

      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url('/login_1.png')`, 
        backgroundSize: 'cover',      
        backgroundPosition: 'center',   
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed' 
  }}  
    >
      
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />



      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl  ">
                
                <img
                  src="/logo.png"   
                  alt="如意城市logo"
                  className="w-full h-full object-contain scale-125"
                />
              </div>
              <h1 className="font-serif-sc text-3xl font-bold text-slate-800 mb-2">
                如意城市
              </h1>
              <p className="text-slate-500">
                智能匹配最适合你的宜居城市
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  手机号
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }));
                      }
                    }}
                    placeholder="请输入手机号"
                    className={cn(
                      'input pl-12',
                      errors.phone && 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
                    )}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  密码
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="请输入密码"
                    className={cn(
                      'input pl-12 pr-12',
                      errors.password && 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600">记住我</span>
                </label>
                <a
                  href="#"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  忘记密码？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '登 录'
                )}
              </button>
            </form>



            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4  text-slate-500">其他登录方式</span>
                </div>
              </div>

              <div className="mt-5 flex justify-center gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <Chrome className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <Github className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                还没有账号？
                <Link
                  to="/register"
                  className="text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                >
                  立即注册
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white">
          © 2027 如意城市 · 让城市选择更简单
        </p>
      </div>
    </div>
  );
}
