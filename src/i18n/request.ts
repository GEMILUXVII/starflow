import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['zh', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'zh';

// 静态导入所有翻译文件
import zh from '../../messages/zh.json';
import en from '../../messages/en.json';

const messages = {
  zh,
  en,
};

export default getRequestConfig(async () => {
  // 从 cookie 中读取语言设置
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value as Locale) || defaultLocale;

  return {
    locale,
    messages: messages[locale],
  };
});
