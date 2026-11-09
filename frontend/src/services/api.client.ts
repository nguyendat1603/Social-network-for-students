import { API_CONFIG } from '../config/api.config';

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  meta: Record<string, unknown> | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = localStorage.getItem('mxh_hssv_access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(
      payload.error?.message || `Yêu cầu thất bại (${response.status})`
    );
  }

  return payload.data;
}
