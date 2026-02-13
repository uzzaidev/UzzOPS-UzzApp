import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const updateContentSchema = z
  .object({
    project_id: z.string().uuid().nullable().optional(),
    campaign_id: z.string().uuid().nullable().optional(),
    title: z.string().trim().min(1).max(200).optional(),
    topic: z.string().trim().max(120).nullable().optional(),
    content_type: z.enum(['reels', 'feed', 'carrossel', 'stories', 'artigo', 'video']).optional(),
    objective: z.string().trim().max(120).nullable().optional(),
    brief: z.string().nullable().optional(),
    caption_base: z.string().nullable().optional(),
    hashtags: z.array(z.string()).optional(),
    cta: z.string().trim().max(200).nullable().optional(),
    status: z.enum(['idea', 'briefing', 'production', 'review', 'approved', 'done', 'archived']).optional(),
    responsible_id: z.string().uuid().nullable().optional(),
    due_date: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .strict();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { data, error } = await (supabase as any)
      .from('marketing_content_pieces')
      .select('*, project:projects(id, name, code)')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Conteudo nao encontrado' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching marketing content:', error);
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
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const body = await request.json();
    const parsed = updateContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('marketing_content_pieces')
      .update(parsed.data)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .select('*, project:projects(id, name, code)')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating marketing content:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { error } = await (supabase as any)
      .from('marketing_content_pieces')
      .delete()
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting marketing content:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
