import { NextResponse } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

export async function POST(request: Request) {
  const { locale } = await request.json();

  // 验证语言是否有效
  if (!locales.includes(locale as Locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true, locale });

  // 设置 cookie，有效期 1 年
  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export async function GET() {
  return NextResponse.json({ locales, defaultLocale });
}
