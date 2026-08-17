export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toLocaleString();
};

export const formatSalary = (salary: number): string => {
  return (salary / 1000).toFixed(1) + 'K';
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLevelLabel = (level: string): string => {
  const labels: Record<string, string> = {
    'first-tier': '一线城市',
    'new-first-tier': '新一线',
    'second-tier': '二线城市',
    'third-fourth-tier': '三四线',
  };
  return labels[level] || level;
};

export const getScoreColor = (score: number): string => {
  if (score >= 9) return 'text-emerald-600';
  if (score >= 8) return 'text-green-600';
  if (score >= 7) return 'text-yellow-600';
  if (score >= 6) return 'text-orange-600';
  return 'text-red-600';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 9) return 'bg-emerald-500';
  if (score >= 8) return 'bg-green-500';
  if (score >= 7) return 'bg-yellow-500';
  if (score >= 6) return 'bg-orange-500';
  return 'bg-red-500';
};
