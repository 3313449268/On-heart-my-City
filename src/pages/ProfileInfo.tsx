import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useUIStore } from '@/store/useUIStore';
import Button from '@/components/ui/Button';

const avatarSeeds = ['felix', 'avery', 'luna', 'max', 'milo', 'lola', 'buddy', 'charlie', 'daisy', 'bella'];

export default function ProfileInfo() {
  const navigate = useNavigate();
  const { currentUser, isLoggedIn, updateProfile, logout } = useUserStore();
  const { showToast } = useUIStore();

  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    if (currentUser) {
      setUsername(currentUser.username);
      setPhone(currentUser.phone);
      setAvatar(currentUser.avatar);
    }
  }, [currentUser, isLoggedIn, navigate]);

  const handleChangeAvatar = () => {
    const randomSeed = avatarSeeds[Math.floor(Math.random() * avatarSeeds.length)] + Date.now();
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setAvatar(newAvatar);
  };

  const handleSave = () => {
    if (!username.trim()) {
      showToast('用户名不能为空', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('手机号不能为空', 'error');
      return;
    }

    updateProfile({ username: username.trim(), phone: phone.trim(), avatar });
    showToast('保存成功', 'success');
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!currentUser) return null;

  return (
    <div className="card p-8">
      <h1 className="section-title mb-8">个人信息</h1>

      <div className="max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={avatar}
              alt="头像"
              className="w-28 h-28 rounded-full border-4 border-emerald-100"
            />
            <button
              onClick={handleChangeAvatar}
              className="absolute bottom-0 right-0 p-2.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-500">点击相机图标更换头像</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">用户名</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            placeholder="请输入用户名"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
            placeholder="请输入手机号"
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button onClick={handleSave} className="w-full">
            <Save className="w-5 h-5" />
            保存修改
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-rose-300 text-rose-500 hover:bg-rose-50 hover:border-rose-400"
          >
            <LogOut className="w-5 h-5" />
            退出登录
          </Button>
        </div>
      </div>
    </div>
  );
}
