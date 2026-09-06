import { Capacitor, CapacitorHttp } from '@capacitor/core';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim() || 'https://willy-kilo-takip.onrender.com';

export async function apiJson(path: string, init: RequestInit = {}): Promise<{ status: number; data: any }> {
  const url = `${API_BASE_URL}${path}`;
  if (Capacitor.isNativePlatform()) {
    const headers = { Accept: 'application/json', ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...(init.headers || {}) } as Record<string, string>;
    const response = await CapacitorHttp.request({
      url,
      method: init.method || 'GET',
      headers,
      data: typeof init.body === 'string' ? JSON.parse(init.body) : init.body,
      connectTimeout: 20000,
      readTimeout: 60000,
    });
    return { status: response.status, data: response.data };
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { throw new Error(`Sunucudan JSON yerine geçersiz yanıt geldi (HTTP ${response.status}).`); }
  return { status: response.status, data };
}
