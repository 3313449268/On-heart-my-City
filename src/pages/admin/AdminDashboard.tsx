import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Building2,
  Users,
  MessageSquare,
  Megaphone,
  FileText,
  ArrowUpRight,
  Plus,
  Search,
  Clock,
  UserPlus,
  Star,
  Bell,
} from 'lucide-react';
import { adminApi, cityApi } from '@/lib/api';
import { City } from '@/types';
import { cn } from '@/lib/utils';

const recentActivities = [
  { id: '1', type: 'user', title: '新用户注册', desc: '用户「张三」完成注册', time: '10分钟前' },
  { id: '2', type: 'review', title: '新评价待审核', desc: '用户对「杭州」提交了评价', time: '25分钟前' },
  { id: '3', type: 'city', title: '城市数据更新', desc: '更新了「成都」的房价数据', time: '1小时前' },
  { id: '4', type: 'announcement', title: '公告已发布', desc: '「系统维护通知」已上线', time: '2小时前' },
  { id: '5', type: 'user', title: '用户禁用', desc: '用户「违规用户」已被禁用', time: '3小时前' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [cityCount, setCityCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [pendingNoteCount, setPendingNoteCount] = useState(0);
  const [cityData, setCityData] = useState<City[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stats, cities] = await Promise.all([
          adminApi.getDashboard(),
          cityApi.getAll(),
        ]);
        setCityCount(stats.cityCount);
        setUserCount(stats.userCount);
        setReviewCount(stats.reviewCount);
        setAnnouncementCount(stats.announcementCount);
        setNoteCount(stats.noteCount || 0);
        setPendingNoteCount(stats.pendingNoteCount || 0);
        setCityData(cities);
      } catch (error) {
        console.error('加载仪表盘数据失败:', error);
      }
    };
    fetchData();
  }, []);

  const scoreDistribution = () => {
    const ranges = [
      { name: '9.0+', min: 9, count: 0 },
      { name: '8.5-9.0', min: 8.5, max: 9, count: 0 },
      { name: '8.0-8.5', min: 8, max: 8.5, count: 0 },
      { name: '7.5-8.0', min: 7.5, max: 8, count: 0 },
      { name: '7.0-7.5', min: 7, max: 7.5, count: 0 },
      { name: '<7.0', max: 7, count: 0 },
    ];

    cityData.forEach((city: { overallScore: number }) => {
      for (const range of ranges) {
        if (range.max === undefined && city.overallScore >= range.min) {
          range.count++;
          break;
        }
        if (range.min === undefined && city.overallScore < range.max) {
          range.count++;
          break;
        }
        if (range.min !== undefined && range.max !== undefined) {
          if (city.overallScore >= range.min && city.overallScore < range.max) {
            range.count++;
            break;
          }
        }
      }
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: ranges.map((r) => r.name),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b' },
        splitLine: { lineStyle: { color: '#f1f5f9' } },
      },
      series: [
        {
          type: 'bar',
          data: ranges.map((r) => r.count),
          itemStyle: {
            borderRadius: [8, 8, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#10b981' },
                { offset: 1, color: '#14b8a6' },
              ],
            },
          },
          barWidth: '50%',
        },
      ],
    };
  };

  const statCards = [
    {
      label: '城市总数',
      value: cityCount,
      icon: Building2,
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      change: '+2',
      action: () => navigate('/admin/cities'),
    },
    {
      label: '用户总数',
      value: userCount,
      icon: Users,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+5',
      action: () => navigate('/admin/users'),
    },
    {
      label: '笔记总数',
      value: noteCount,
      icon: FileText,
      color: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      change: pendingNoteCount > 0 ? `${pendingNoteCount} 待审` : '已审核',
      action: () => navigate('/admin/notes'),
    },
    {
      label: '评价总数',
      value: reviewCount,
      icon: MessageSquare,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      change: '+12',
      action: () => navigate('/admin/reviews'),
    },
    {
      label: '公告数量',
      value: announcementCount,
      icon: Megaphone,
      color: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      change: '+1',
      action: () => navigate('/admin/announcements'),
    },
  ];

  const quickActions = [
    { label: '新增城市', icon: Plus, color: 'from-emerald-500 to-teal-500', action: () => navigate('/admin/cities') },
    { label: '笔记管理', icon: FileText, color: 'from-violet-500 to-purple-500', action: () => navigate('/admin/notes') },
    { label: '用户管理', icon: Users, color: 'from-blue-500 to-indigo-500', action: () => navigate('/admin/users') },
    { label: '评价审核', icon: Search, color: 'from-amber-500 to-orange-500', action: () => navigate('/admin/reviews') },
    { label: '发布公告', icon: Bell, color: 'from-rose-500 to-pink-500', action: () => navigate('/admin/announcements') },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <UserPlus className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'city':
        return <Building2 className="w-5 h-5" />;
      case 'announcement':
        return <Megaphone className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-50 text-blue-600';
      case 'review':
        return 'bg-amber-50 text-amber-600';
      case 'city':
        return 'bg-emerald-50 text-emerald-600';
      case 'announcement':
        return 'bg-rose-50 text-rose-600';
      default:
        return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              onClick={card.action}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-500 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">{card.value}</p>
                  <div className="flex items-center gap-1 mt-2 text-emerald-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">{card.change}</span>
                    <span className="text-slate-400 text-sm">本周</span>
                  </div>
                </div>
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-200',
                    card.color
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">城市宜居分数分布</h3>
              <p className="text-slate-500 text-sm mt-1">各分数段城市数量统计</p>
            </div>
          </div>
          <ReactECharts option={scoreDistribution()} style={{ height: '300px' }} />
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br group-hover:scale-110 transition-transform duration-200',
                      action.color
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">最近活动</h3>
            <p className="text-slate-500 text-sm mt-1">系统最新动态记录</p>
          </div>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  getActivityColor(activity.type)
                )}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800">{activity.title}</p>
                <p className="text-sm text-slate-500 truncate">{activity.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-sm flex-shrink-0">
                <Clock className="w-4 h-4" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
