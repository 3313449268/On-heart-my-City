import { useState, useEffect } from 'react';
import {
  Search,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Heart,
} from 'lucide-react';
import { userApi } from '@/lib/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const [userList, setUserList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const users = await userApi.getAll();
      setUserList(users);
    } catch (err) {
      console.error('获取用户列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = userList.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const toggleUserStatus = async (id: string) => {
    if (loading) return;
    try {
      setLoading(true);
      await userApi.toggleStatus(id);
      await fetchUsers();
    } catch (err) {
      console.error('切换用户状态失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户名或手机号..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">用户</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">手机号</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">收藏数</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">注册时间</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">状态</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium text-slate-800">{user.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      <span className="text-slate-600">{user.favorites.length}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.createdAt}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                        user.isDisabled
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-emerald-50 text-emerald-700'
                      )}
                    >
                      {user.isDisabled ? '已禁用' : '正常'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleUserStatus(user.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                        user.isDisabled
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-rose-600 hover:bg-rose-50'
                      )}
                    >
                      {user.isDisabled ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          启用
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4" />
                          禁用
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              共 {filteredUsers.length} 条记录，第 {currentPage} / {totalPages} 页
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {getPageNumbers().map((page, index) =>
                page === 'ellipsis' ? (
                  <div
                    key={`ellipsis-${index}`}
                    className="flex items-center justify-center w-9 h-9 text-slate-400"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                      currentPage === page
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    )}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
