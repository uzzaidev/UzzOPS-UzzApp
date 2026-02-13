import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(20).optional(),
  description: z.string().trim().max(500).optional().nullable(),
}).strict();

function normalizeProjectCode(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20);
}

function generateProjectCode(name: string) {
  const base = normalizeProjectCode(name).slice(0, 12) || 'PRJ';
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return `${base}-${suffix}`.slice(0, 20);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { data, error } = await supabase
      .from('projects')
      .select('id, code, name, status, tenant_id')
      .eq('tenant_id', membership.tenant_id)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const code = payload.code
      ? normalizeProjectCode(payload.code)
      : generateProjectCode(payload.name);

    if (!code) {
      return NextResponse.json({ error: 'Codigo de projeto invalido' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        tenant_id: membership.tenant_id,
        code,
        name: payload.name,
        description: payload.description ?? null,
        status: 'active',
        progress: 0,
        budget_spent: 0,
      })
      .select('id, code, name')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
