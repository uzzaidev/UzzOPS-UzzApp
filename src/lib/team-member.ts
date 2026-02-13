import { createClient } from '@/lib/supabase/server';

type AuthUserLite = {
  id: string;
  email?: string | null;
};

type MembershipLite = {
  tenant_id: string;
  role: 'admin' | 'member' | 'viewer';
};

type ResolvedMember = {
  id: string;
  source: 'by_user_id' | 'by_email' | 'created';
};

function normalizeEmail(email?: string | null) {
  return (email ?? '').trim().toLowerCase();
}

function fallbackNameFromEmail(email?: string | null) {
  const normalized = normalizeEmail(email);
  if (!normalized) return 'Membro';
  return normalized.split('@')[0] || 'Membro';
}

export async function resolveOrProvisionTeamMember(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: AuthUserLite,
  membership: MembershipLite
): Promise<ResolvedMember | null> {
  const normalizedUserEmail = normalizeEmail(user.email);

  const { data: byUserId } = await supabase
    .from('team_members')
    .select('id, user_id, email, status, is_active')
    .eq('user_id', user.id)
    .eq('tenant_id', membership.tenant_id)
    .limit(1)
    .maybeSingle();

  if (byUserId) {
    const normalizedMemberEmail = normalizeEmail(byUserId.email);
    const emailLooksConsistent =
      !normalizedUserEmail || normalizedMemberEmail === normalizedUserEmail;

    if (emailLooksConsistent) {
      if (byUserId.status !== 'active' || !byUserId.is_active) {
        await supabase
          .from('team_members')
          .update({
            status: 'active',
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', byUserId.id)
          .eq('tenant_id', membership.tenant_id);
      }

      return { id: byUserId.id, source: 'by_user_id' };
    }
  }

  if (normalizedUserEmail) {
    const { data: byEmail } = await supabase
      .from('team_members')
      .select('id, user_id, status, is_active')
      .ilike('email', normalizedUserEmail)
      .eq('tenant_id', membership.tenant_id)
      .limit(1)
      .maybeSingle();

    if (byEmail) {
      if (byEmail.user_id && byEmail.user_id !== user.id) {
        return null;
      }

      await supabase
        .from('team_members')
        .update({
          user_id: user.id,
          status: 'active',
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', byEmail.id)
        .eq('tenant_id', membership.tenant_id);

      return { id: byEmail.id, source: 'by_email' };
    }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const memberName =
    (profile?.full_name ?? '').trim() || fallbackNameFromEmail(user.email);

  const { data: created, error } = await supabase
    .from('team_members')
    .insert({
      tenant_id: membership.tenant_id,
      name: memberName,
      email: normalizedUserEmail || `${user.id}@local.invalid`,
      user_id: user.id,
      role: 'Membro',
      permission_level: membership.role === 'admin' ? 'admin' : 'member',
      status: 'active',
      is_active: true,
      allocation_percent: 100,
    })
    .select('id')
    .single();

  if (error || !created) {
    return null;
  }

  return { id: created.id, source: 'created' };
}
