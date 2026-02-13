'use client';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const escaped = name.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getActiveTenantId(): string | null {
  const fromCookie = readCookie('active_tenant_id') ?? readCookie('tenant_id');
  if (fromCookie) return fromCookie;

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem('active_tenant_id');
    if (fromStorage) return fromStorage;
  }

  return null;
}

export function setActiveTenantContext(tenantId: string) {
  if (!tenantId || typeof document === 'undefined') return;
  document.cookie = `active_tenant_id=${encodeURIComponent(tenantId)}; path=/; samesite=lax`;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('active_tenant_id', tenantId);
  }
}

export async function tenantFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers ?? {});
  const tenantId = getActiveTenantId();
  if (tenantId && !headers.has('x-tenant-id') && !headers.has('x-active-tenant-id')) {
    headers.set('x-tenant-id', tenantId);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? 'include',
  });
}
