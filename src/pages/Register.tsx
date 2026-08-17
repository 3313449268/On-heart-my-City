import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

export default function Register() {
  const navigate = useNavigate();
  const register = useUserStore((state) => state.register);
  const showToast = useUIStore((state) => state.showToast);

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    agreed?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!username) {
      newErrors.username = '请输入用户名';
    } else if (username.length < 2 || username.length > 20) {
      newErrors.username = '用户名长度需在2-20字符之间';
    }

    if (!phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      newErrors.phone = '请输入正确的手机号格式';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6 || password.length > 20) {
      newErrors.password = '密码长度需在6-20字符之间';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (!agreed) {
      newErrors.agreed = '请阅读并同意用户协议';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    setTimeout(() => {
      const success = register(username, phone, password);

      if (success) {
        showToast('注册成功，欢迎加入如意城市！', 'success');
        navigate('/', { replace: true });
      } else {
        showToast('该手机号已被注册', 'error');
      }

      setLoading(false);
    }, 800);
  };

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strengthColors = [
    'bg-slate-200',
    'bg-red-400',
    'bg-orange-400',
    'bg-yellow-400',
    'bg-emerald-500',
  ];

  const strengthLabels = ['', '弱', '一般', '良好', '强'];
  const strengthTextColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600'];
  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden"
      style={{
          backgroundImage: `url('/login_1.png')`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
      }}>
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-cyan-200/20 rounded-full blur-3xl" />



      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl ">
                <img
                  src="/logo.png" 
                  alt="如意城市logo"
                  className="w-full h-full object-contain scale-125"
                />
              </div>
              <h1 className="font-serif-sc text-3xl font-bold text-slate-800 mb-2">
                创建账号
              </h1>
              <p className="text-slate-500">
                加入如意城市，找到你的理想家园
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) {
                        setErrors((prev) => ({ ...prev, username: undefined }));
                      }
                    }}
                    placeholder="请输入用户名"
                    className={cn(
                      'input pl-12',
                      errors.username && 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
                    )}
                  />
                  {username.length >= 2 && username.length <= 20 && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.username && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

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
                  {/^1[3-9]\d{9}$/.test(phone) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
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
                    placeholder="请设置密码（6-20位）"
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
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-1.5 flex-1 rounded-full transition-colors',
                            level <= strength ? strengthColors[strength] : 'bg-slate-200'
                          )}
                        />
                      ))}
                    </div>
                    <p className={cn('mt-1 text-xs', strengthTextColors[strength])}>
                      密码强度：{strengthLabels[strength]}
                    </p>
                  </div>
                )}
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  确认密码
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                      }
                    }}
                    placeholder="请再次输入密码"
                    className={cn(
                      'input pl-12 pr-12',
                      errors.confirmPassword && 'border-red-500 focus:ring-red-500/30 focus:border-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                  {confirmPassword && password === confirmPassword && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => {
                      setAgreed(e.target.checked);
                      if (errors.agreed) {
                        setErrors((prev) => ({ ...prev, agreed: undefined }));
                      }
                    }}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed">
                    我已阅读并同意
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 mx-0.5">
                      《用户协议》
                    </a>
                    和
                    <a href="#" className="text-emerald-600 hover:text-emerald-700 mx-0.5">
                      《隐私政策》
                    </a>
                  </span>
                </label>
                {errors.agreed && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.agreed}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    注册中...
                  </>
                ) : (
                  '注 册'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                已有账号？
                <Link
                  to="/login"
                  className="text-emerald-600 hover:text-emerald-700 font-medium ml-1"
                >
                  立即登录
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
