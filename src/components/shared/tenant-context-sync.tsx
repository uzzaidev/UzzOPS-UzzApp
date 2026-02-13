'use client';

import { useEffect } from 'react';
import { setActiveTenantContext } from '@/lib/api-client';

export function TenantContextSync({ tenantId }: { tenantId: string }) {
  useEffect(() => {
    setActiveTenantContext(tenantId);
  }, [tenantId]);

  return null;
}
