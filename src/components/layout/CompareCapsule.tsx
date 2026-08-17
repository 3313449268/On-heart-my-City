import { GitCompare } from 'lucide-react';
import { useCompareStore } from '@/store/useCompareStore';

export default function CompareCapsule() {
  const { compareList, toggleDrawer } = useCompareStore();

  if (compareList.length < 2) {
    return null;
  }

  return (
    <button
      onClick={toggleDrawer}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-300"
    >
      <GitCompare className="w-5 h-5" />
      <span className="font-medium text-sm">
        已选 {compareList.length}/5
      </span>
    </button>
  );
}
