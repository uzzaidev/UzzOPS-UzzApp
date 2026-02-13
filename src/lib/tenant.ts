import { SupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { resolveMembershipContext } from './tenant-context';

export type Membership = {
  tenant_id: string;
  role: 'admin' | 'member' | 'viewer';
};

async function resolveRequestedTenantId() {
  try {
    const headerStore = await headers();
    const fromHeader =
      headerStore.get('x-tenant-id') ?? headerStore.get('x-active-tenant-id');
    if (fromHeader) return fromHeader;
  } catch {
    // no-op
  }

  try {
    const cookieStore = await cookies();
    const fromCookie =
      cookieStore.get('active_tenant_id')?.value ??
      cookieStore.get('tenant_id')?.value;
    if (fromCookie) return fromCookie;
  } catch {
    // no-op
  }

  return null;
}

async function listActiveMemberships(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from('company_members')
    .select('tenant_id, role')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('joined_at', { ascending: true })
    .order('created_at', { ascending: true });

  return (data as Membership[] | null) ?? [];
}

export async function requireAuth(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user, error: null };
}

export async function requireTenant(
  supabase: SupabaseClient,
  options?: { tenantId?: string | null }
) {
  const { user, error: authError } = await requireAuth(supabase);
  if (authError || !user) {
    return { user: null, membership: null, error: authError };
  }

  const requestedTenantId = options?.tenantId ?? (await resolveRequestedTenantId());
  const memberships = await listActiveMemberships(supabase, user.id);
  const resolution = resolveMembershipContext(memberships, requestedTenantId);

  if (!resolution.membership) {
    if (resolution.code === 'TENANT_CONTEXT_REQUIRED') {
      return {
        user,
        membership: null,
        error: NextResponse.json(
          {
            error: 'Tenant context required',
            code: 'TENANT_CONTEXT_REQUIRED',
            message:
              'Defina o tenant ativo via header x-tenant-id ou cookie active_tenant_id.',
          },
          { status: 409 }
        ),
      };
    }

    if (resolution.code === 'TENANT_NOT_ALLOWED') {
      return {
        user,
        membership: null,
        error: NextResponse.json(
          { error: 'Forbidden: tenant not allowed for this user' },
          { status: 403 }
        ),
      };
    }

    return {
      user,
      membership: null,
      error: NextResponse.json(
        { error: 'Forbidden: no active company membership' },
        { status: 403 }
      ),
    };
  }

  return { user, membership: resolution.membership, error: null };
}

export async function requireAdmin(
  supabase: SupabaseClient,
  options?: { tenantId?: string | null }
) {
  const { user, membership, error } = await requireTenant(supabase, options);
  if (error || !membership) return { user, membership: null, error };

  if (membership.role !== 'admin') {
    return {
      user,
      membership: null,
      error: NextResponse.json(
        { error: 'Forbidden: admin role required' },
        { status: 403 }
      ),
    };
  }

  return { user, membership, error: null };
}
