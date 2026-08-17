import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Database } from 'lucide-react';

const quickLinks = [
  { name: '首页', path: '/' },
  { name: '智能匹配', path: '/match' },
  { name: '城市大全', path: '/cities' },
  { name: '城市对比', path: '/compare' },
];

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <div>
            <h3 className="font-serif-sc text-xl font-bold gradient-text mb-4">
              如意城市
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              如意城市致力于为您提供最全面、最专业的城市宜居性分析。
              通过多维度数据对比和智能匹配算法，帮助您找到最适合自己的理想城市，
              让每一次迁居都成为人生的美好起点。
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">快速链接</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-slate-600 text-sm hover:text-emerald-600 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-800 mb-4">联系方式</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-slate-600 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>河北农业大学（渤海校区）渤海路1号</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <Mail className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>3313449268@qq.com</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600 text-sm">
                <Phone className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>130-2086-8109</span>
              </li>
              <li className="flex items-start gap-2 text-slate-600 text-sm pt-2 border-t border-slate-200 mt-2">
                <Database className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>数据来源：国家统计局、各地市政府公开数据</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2027 如意城市 版权所有
            </p>
            <p className="text-slate-500 text-sm">
              京ICP备12345678号-1
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
