import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant, requireAdmin } from '@/lib/tenant';
import { z } from 'zod';

const updateRiskSchema = z.object({
  title: z.string().trim().min(1).optional(),
  description: z.string().nullable().optional(),
  gut_g: z.number().int().min(1).max(5).optional(),
  gut_u: z.number().int().min(1).max(5).optional(),
  gut_t: z.number().int().min(1).max(5).optional(),
  status: z.enum(['identified', 'analyzing', 'mitigated', 'accepted', 'resolved']).optional(),
  mitigation_plan: z.string().nullable().optional(),
  owner_id: z.string().uuid().nullable().optional(),
}).strict();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;
    const { data: risk, error } = await supabase
      .from('risks')
      .select(`
        *,
        project:projects(id, code, name),
        owner:team_members(id, name, email, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching risk:', error);
      return NextResponse.json({ error: 'Risco não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data: risk });
  } catch (error) {
    console.error('Error fetching risk:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;
    const body = await request.json();
    const parsed = updateRiskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: risk, error } = await supabase
      .from('risks')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating risk:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Código do risco já existe' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: risk });
  } catch (error) {
    console.error('Error updating risk:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireAdmin(supabase);
    if (authError) return authError;
    const { error } = await supabase.from('risks').delete().eq('id', id);

    if (error) {
      console.error('Error deleting risk:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Risco deletado com sucesso' });
  } catch (error) {
    console.error('Error deleting risk:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
