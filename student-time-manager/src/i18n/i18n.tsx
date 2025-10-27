import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type Lang = 'en' | 'vi';
type Dict = Record<string, string>;

const translations: Record<Lang, Dict> = {
  en: {
    'app.title': 'Student Time Manager',
    'nav.focus': 'Focus',
    'nav.calendar': 'Calendar',
    'nav.analytics': 'Analytics',
    'nav.coach': 'Coach',

    'form.title': 'Title',
    'form.description': 'Description',
    'form.estimate': 'Estimate (minutes)',
    'form.due': 'Due at',
    'form.priority': 'Priority',
    'form.add': 'Add Task',
    'form.save': 'Save Changes',

    'list.search': 'Search...',
    'list.openOnly': 'Open only',
    'list.edit': 'Edit',
    'list.done': 'Done',
    'list.reopen': 'Reopen',
    'list.delete': 'Delete',
    'list.addGCal': 'Add to GCal',
    'list.updateGCal': 'Update GCal',
    'list.autoSchedule': 'Auto-schedule',

    'calendar.title': 'Calendar',
    'calendar.sync': 'Sync Calendar',

    'analytics.title': 'Analytics',
    'analytics.avgRatio': 'Average actual/estimate ratio',
    'analytics.total': 'Total focused minutes',

    'coach.title': 'AI Coach',
    'coach.prioritize': 'Suggest priorities',
    'coach.dailyPlan': 'Today plan',
    'coach.quickAdd.label': 'Quick-add from text (e.g. "Review Math in 45m by 2025-09-11 21:00 !high")',

    'loading.loading': 'Loading...'
  },
  vi: {
    'app.title': 'Trợ Lý Quản Lý Thời Gian',
    'nav.focus': 'Tập trung',
    'nav.calendar': 'Lịch',
    'nav.analytics': 'Phân tích',
    'nav.coach': 'Huấn luyện',

    'form.title': 'Tiêu đề',
    'form.description': 'Mô tả',
    'form.estimate': 'Ước tính (phút)',
    'form.due': 'Hạn',
    'form.priority': 'Độ ưu tiên',
    'form.add': 'Thêm nhiệm vụ',
    'form.save': 'Lưu thay đổi',

    'list.search': 'Tìm kiếm...',
    'list.openOnly': 'Chỉ mục mở',
    'list.edit': 'Sửa',
    'list.done': 'Xong',
    'list.reopen': 'Mở lại',
    'list.delete': 'Xóa',
    'list.addGCal': 'Thêm vào GCal',
    'list.updateGCal': 'Cập nhật GCal',
    'list.autoSchedule': 'Tự xếp lịch',

    'calendar.title': 'Lịch',
    'calendar.sync': 'Đồng bộ lịch',

    'analytics.title': 'Phân tích',
    'analytics.avgRatio': 'Tỉ lệ thực tế/ước tính trung bình',
    'analytics.total': 'Tổng phút tập trung',

    'coach.title': 'AI Coach',
    'coach.prioritize': 'Đề xuất ưu tiên',
    'coach.dailyPlan': 'Kế hoạch hôm nay',
    'coach.quickAdd.label': 'Thêm nhanh từ câu lệnh (ví dụ: "Ôn Toán in 45m by 2025-09-11 21:00 !high")',

    'loading.loading': 'Đang tải...'
  }
};

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('vi');
  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key: string) => translations[lang][key] ?? key
  }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('I18nProvider missing');
  return ctx;
}

