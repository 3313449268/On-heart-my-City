import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { cityApi, uploadApi } from '@/lib/api';
import { City, cityLevelLabels, provinces, CityLevel } from '@/types';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

interface CityFormData {
  name: string;
  province: string;
  level: CityLevel;
  description: string;
  overallScore: number;
  housingPrice: number;
  averageSalary: number;
  priceLevel: number;
  educationScore: number;
  medicalScore: number;
  transportationScore: number;
  employmentScore: number;
  airQualityScore: number;
  greeningScore: number;
  lifePaceScore: number;
  climateScore: number;
  tags: string;
  isCoastal: boolean;
  hasMountains: boolean;
  isHistorical: boolean;
  image: string;
  bannerImage: string;
}

const emptyFormData: CityFormData = {
  name: '',
  province: '北京',
  level: 'second-tier',
  description: '',
  overallScore: 8.0,
  housingPrice: 20000,
  averageSalary: 8000,
  priceLevel: 6.0,
  educationScore: 7.0,
  medicalScore: 7.0,
  transportationScore: 7.0,
  employmentScore: 7.0,
  airQualityScore: 7.0,
  greeningScore: 7.0,
  lifePaceScore: 6.0,
  climateScore: 7.0,
  tags: '',
  isCoastal: false,
  hasMountains: false,
  isHistorical: false,
  image: 'https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&q=80',
  bannerImage: 'https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=1920&q=80',
};

export default function AdminCities() {
  const [cityList, setCityList] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState<CityFormData>(emptyFormData);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<'image' | 'bannerImage' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (field: 'image' | 'bannerImage', file: File) => {
    setUploadingField(field);
    try {
      const url = await uploadApi.uploadImage(file);
      handleInputChange(field, url);
    } catch (err) {
      alert(err instanceof Error ? err.message : '图片上传失败');
    } finally {
      setUploadingField(null);
    }
  };

  const fetchCities = async () => {
    try {
      const cities = await cityApi.getAll();
      setCityList(cities);
    } catch (err) {
      alert(err instanceof Error ? err.message : '加载城市列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const filteredCities = cityList.filter(
    (city) =>
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCities.length / PAGE_SIZE);
  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAdd = () => {
    setEditingCity(null);
    setFormData(emptyFormData);
    setShowModal(true);
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      province: city.province,
      level: city.level,
      description: city.description,
      overallScore: city.overallScore,
      housingPrice: city.housingPrice,
      averageSalary: city.averageSalary,
      priceLevel: city.priceLevel,
      educationScore: city.educationScore,
      medicalScore: city.medicalScore,
      transportationScore: city.transportationScore,
      employmentScore: city.employmentScore,
      airQualityScore: city.airQualityScore,
      greeningScore: city.greeningScore,
      lifePaceScore: city.lifePaceScore,
      climateScore: city.climateScore,
      tags: city.tags.join(', '),
      isCoastal: city.isCoastal,
      hasMountains: city.hasMountains,
      isHistorical: city.isHistorical,
      image: city.image,
      bannerImage: city.bannerImage,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('请输入城市名称');
      return;
    }

    const cityData: Omit<City, 'id'> = {
      name: formData.name,
      province: formData.province,
      level: formData.level,
      description: formData.description,
      overallScore: formData.overallScore,
      housingPrice: formData.housingPrice,
      averageSalary: formData.averageSalary,
      priceLevel: formData.priceLevel,
      educationScore: formData.educationScore,
      medicalScore: formData.medicalScore,
      transportationScore: formData.transportationScore,
      employmentScore: formData.employmentScore,
      airQualityScore: formData.airQualityScore,
      greeningScore: formData.greeningScore,
      lifePaceScore: formData.lifePaceScore,
      climateScore: formData.climateScore,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      isCoastal: formData.isCoastal,
      hasMountains: formData.hasMountains,
      isHistorical: formData.isHistorical,
      image: formData.image,
      bannerImage: formData.bannerImage,
    };

    try {
      if (editingCity) {
        await cityApi.update(editingCity.id, cityData);
      } else {
        await cityApi.create(cityData);
      }
      await fetchCities();
      setShowModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : '保存城市失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await cityApi.delete(id);
      await fetchCities();
      setDeleteConfirm(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除城市失败');
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

  const getLevelBadgeColor = (level: CityLevel) => {
    switch (level) {
      case 'first-tier':
        return 'bg-rose-50 text-rose-700';
      case 'new-first-tier':
        return 'bg-amber-50 text-amber-700';
      case 'second-tier':
        return 'bg-emerald-50 text-emerald-700';
      case 'third-fourth-tier':
        return 'bg-blue-50 text-blue-700';
    }
  };

  const handleInputChange = (field: keyof CityFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索城市名称或省份..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4" />
              批量导入
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              新增城市
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">城市名</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">省份</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">等级</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">综合得分</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedCities.map((city) => (
                <tr key={city.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-500">{city.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={city.image}
                        alt={city.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <span className="font-medium text-slate-800">{city.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{city.province}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                        getLevelBadgeColor(city.level)
                      )}
                    >
                      {cityLevelLabels[city.level]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">{city.overallScore.toFixed(1)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(city)}
                        className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(city.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCities.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
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
              共 {filteredCities.length} 条记录，第 {currentPage} / {totalPages} 页
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingCity ? '编辑城市' : '新增城市'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    城市名称 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">省份</label>
                  <select
                    value={formData.province}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    {provinces.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">城市等级</label>
                  <select
                    value={formData.level}
                    onChange={(e) => handleInputChange('level', e.target.value as CityLevel)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    {Object.entries(cityLevelLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">综合得分</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.overallScore}
                    onChange={(e) => handleInputChange('overallScore', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">城市描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* 城市封面图 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    城市封面图（卡片缩略图）
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt="封面图"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('image', file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingField === 'image'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {uploadingField === 'image' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingField === 'image' ? '上传中...' : '上传图片'}
                      </button>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) => handleInputChange('image', e.target.value)}
                        placeholder="或直接输入图片URL"
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* 城市横幅大图 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    城市横幅大图（详情页顶部图）
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                      {formData.bannerImage ? (
                        <img
                          src={formData.bannerImage}
                          alt="横幅图"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload('bannerImage', file);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={uploadingField === 'bannerImage'}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                      >
                        {uploadingField === 'bannerImage' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingField === 'bannerImage' ? '上传中...' : '上传图片'}
                      </button>
                      <input
                        type="text"
                        value={formData.bannerImage}
                        onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                        placeholder="或直接输入图片URL"
                        className="w-full mt-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">房价（元/㎡）</label>
                  <input
                    type="number"
                    value={formData.housingPrice}
                    onChange={(e) => handleInputChange('housingPrice', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">平均工资（元）</label>
                  <input
                    type="number"
                    value={formData.averageSalary}
                    onChange={(e) => handleInputChange('averageSalary', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">物价水平</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.priceLevel}
                    onChange={(e) => handleInputChange('priceLevel', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">标签（逗号分隔）</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="环境优, 就业好, 互联网"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-4">各项评分</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { key: 'educationScore', label: '教育资源' },
                      { key: 'medicalScore', label: '医疗资源' },
                      { key: 'transportationScore', label: '交通便利' },
                      { key: 'employmentScore', label: '就业机会' },
                      { key: 'airQualityScore', label: '空气质量' },
                      { key: 'greeningScore', label: '绿化环境' },
                      { key: 'lifePaceScore', label: '生活节奏' },
                      { key: 'climateScore', label: '气候条件' },
                    ].map((item) => (
                      <div key={item.key}>
                        <label className="block text-sm text-slate-600 mb-1">{item.label}</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={formData[item.key as keyof CityFormData] as number}
                          onChange={(e) =>
                            handleInputChange(item.key as keyof CityFormData, parseFloat(e.target.value) || 0)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-800 mb-4">城市特色</h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: 'isCoastal', label: '沿海城市' },
                      { key: 'hasMountains', label: '有山' },
                      { key: 'isHistorical', label: '历史名城' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[item.key as keyof CityFormData] as boolean}
                          onChange={(e) =>
                            handleInputChange(item.key as keyof CityFormData, e.target.checked)
                          }
                          className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
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
                {editingCity ? '保存修改' : '新增城市'}
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
              <p className="text-slate-500 mb-6">确定要删除这个城市吗？此操作不可撤销。</p>
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
