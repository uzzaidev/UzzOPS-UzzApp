export type TenantMembership = {
  tenant_id: string;
  role: 'admin' | 'member' | 'viewer';
};

export type TenantResolutionCode =
  | 'NO_ACTIVE_MEMBERSHIP'
  | 'TENANT_NOT_ALLOWED'
  | 'TENANT_CONTEXT_REQUIRED';

export type TenantResolutionResult =
  | { membership: TenantMembership; code: null }
  | { membership: null; code: TenantResolutionCode };

export function resolveMembershipContext(
  memberships: TenantMembership[],
  requestedTenantId?: string | null
): TenantResolutionResult {
  if (!memberships.length) {
    return { membership: null, code: 'NO_ACTIVE_MEMBERSHIP' };
  }

  if (requestedTenantId) {
    const membership = memberships.find((m) => m.tenant_id === requestedTenantId) ?? null;
    if (!membership) {
      return { membership: null, code: 'TENANT_NOT_ALLOWED' };
    }
    return { membership, code: null };
  }

  if (memberships.length > 1) {
    return { membership: null, code: 'TENANT_CONTEXT_REQUIRED' };
  }

  return { membership: memberships[0], code: null };
}
