import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const updatePublicationSchema = z
  .object({
    channel: z.enum(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']).optional(),
    scheduled_date: z.string().optional(),
    scheduled_time: z.string().nullable().optional(),
    status: z.enum(['idea', 'draft', 'scheduled', 'published', 'cancelled']).optional(),
    published_at: z.string().nullable().optional(),
    external_url: z.string().url().nullable().optional(),
    caption_override: z.string().nullable().optional(),
    metrics_reach: z.number().int().nullable().optional(),
    metrics_engagement: z.number().int().nullable().optional(),
    metrics_clicks: z.number().int().nullable().optional(),
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
      .from('marketing_publications')
      .select(`
        *,
        content_piece:marketing_content_pieces(
          id, code, title, content_type, project_id, status, caption_base
        )
      `)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Publicacao nao encontrada' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching publication:', error);
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
    const parsed = updatePublicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = { ...parsed.data } as any;
    if (payload.status === 'published' && !payload.published_at) {
      payload.published_at = new Date().toISOString();
    }

    const { data, error } = await (supabase as any)
      .from('marketing_publications')
      .update(payload)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating publication:', error);
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
      .from('marketing_publications')
      .delete()
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting publication:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

