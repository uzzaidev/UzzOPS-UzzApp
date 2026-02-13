import { resolveMembershipContext } from './tenant-context';

describe('resolveMembershipContext', () => {
  const membershipA = { tenant_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', role: 'admin' as const };
  const membershipB = { tenant_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', role: 'member' as const };

  it('returns NO_ACTIVE_MEMBERSHIP when user has no active memberships', () => {
    const result = resolveMembershipContext([], null);
    expect(result).toEqual({ membership: null, code: 'NO_ACTIVE_MEMBERSHIP' });
  });

  it('returns membership when there is exactly one active membership and no requested tenant', () => {
    const result = resolveMembershipContext([membershipA], null);
    expect(result).toEqual({ membership: membershipA, code: null });
  });

  it('returns TENANT_CONTEXT_REQUIRED when user has multiple memberships and no context', () => {
    const result = resolveMembershipContext([membershipA, membershipB], null);
    expect(result).toEqual({ membership: null, code: 'TENANT_CONTEXT_REQUIRED' });
  });

  it('returns membership when requested tenant is allowed', () => {
    const result = resolveMembershipContext([membershipA, membershipB], membershipB.tenant_id);
    expect(result).toEqual({ membership: membershipB, code: null });
  });

  it('returns TENANT_NOT_ALLOWED when requested tenant does not belong to user', () => {
    const result = resolveMembershipContext([membershipA], membershipB.tenant_id);
    expect(result).toEqual({ membership: null, code: 'TENANT_NOT_ALLOWED' });
  });
});
