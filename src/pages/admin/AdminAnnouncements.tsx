import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Megaphone,
  Calendar,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { announcementApi } from '@/lib/api';
import { Announcement } from '@/types';
import { cn } from '@/lib/utils';

interface AnnouncementFormData {
  title: string;
  content: string;
  isActive: boolean;
}

const emptyFormData: AnnouncementFormData = {
  title: '',
  content: '',
  isActive: true,
};

export default function AdminAnnouncements() {
  const [announcementList, setAnnouncementList] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const refreshList = async () => {
    try {
      const list = await announcementApi.getAll();
      setAnnouncementList(list);
    } catch (err) {
      console.error('加载公告失败', err);
    }
  };

  useEffect(() => {
    refreshList();
  }, []);

  const handleAdd = () => {
    setEditingAnnouncement(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      alert('请输入公告标题');
      return;
    }
    if (!formData.content.trim()) {
      alert('请输入公告内容');
      return;
    }

    try {
      if (editingAnnouncement) {
        await announcementApi.update(editingAnnouncement.id, {
          title: formData.title,
          content: formData.content,
          isActive: formData.isActive,
        });
      } else {
        await announcementApi.create({
          title: formData.title,
          content: formData.content,
          isActive: formData.isActive,
        });
      }
      await refreshList();
      setShowModal(false);
    } catch (err) {
      console.error('保存公告失败', err);
      alert('保存公告失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await announcementApi.delete(id);
      await refreshList();
    } catch (err) {
      console.error('删除公告失败', err);
      alert('删除公告失败');
    }
    setDeleteConfirm(null);
  };

  const toggleActive = async (id: string) => {
    try {
      await announcementApi.toggleActive(id);
      await refreshList();
    } catch (err) {
      console.error('切换状态失败', err);
      alert('切换状态失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">公告管理</h3>
            <p className="text-slate-500 text-sm mt-1">共 {announcementList.length} 条公告</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            新增公告
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {announcementList.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    announcement.isActive
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-500'
                      : 'bg-slate-200'
                  )}
                >
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="font-bold text-slate-800">{announcement.title}</h4>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        announcement.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      )}
                    >
                      {announcement.isActive ? '已启用' : '已停用'}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-2 line-clamp-2">{announcement.content}</p>
                  <div className="flex items-center gap-1.5 mt-3 text-slate-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    {announcement.createdAt}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleActive(announcement.id)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    announcement.isActive
                      ? 'text-emerald-600 hover:bg-emerald-50'
                      : 'text-slate-400 hover:bg-slate-50'
                  )}
                  title={announcement.isActive ? '停用' : '启用'}
                >
                  {announcement.isActive ? (
                    <ToggleRight className="w-5 h-5" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(announcement.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {announcementList.length === 0 && (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">暂无公告</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingAnnouncement ? '编辑公告' : '新增公告'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  公告标题 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="请输入公告标题"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  公告内容 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="请输入公告内容"
                  rows={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-slate-700">状态</label>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={cn(
                    'relative w-12 h-6 rounded-full transition-colors',
                    formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
                      formData.isActive ? 'left-7' : 'left-1'
                    )}
                  />
                </button>
                <span className="text-sm text-slate-600">
                  {formData.isActive ? '启用' : '停用'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
              >
                {editingAnnouncement ? '保存修改' : '发布公告'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除</h3>
              <p className="text-slate-500 mb-6">确定要删除这条公告吗？此操作不可撤销。</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-5 py-2.5 rounded-xl bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
