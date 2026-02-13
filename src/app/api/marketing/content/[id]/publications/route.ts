import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const batchPublicationSchema = z.object({
  channels: z
    .array(z.enum(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']))
    .min(1),
  scheduled_date: z.string(),
  scheduled_time: z.string().nullable().optional(),
  status: z.enum(['idea', 'draft', 'scheduled', 'published', 'cancelled']).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership || !user) return authError;

    const body = await request.json();
    const parsed = batchPublicationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data: contentPiece, error: contentError } = await (supabase as any)
      .from('marketing_content_pieces')
      .select('id')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (contentError || !contentPiece) {
      return NextResponse.json({ error: 'Conteudo nao encontrado' }, { status: 404 });
    }

    const payload = parsed.data;
    const nowIso = new Date().toISOString();

    const rows = payload.channels.map((channel) => ({
      tenant_id: membership.tenant_id,
      content_piece_id: id,
      channel,
      scheduled_date: payload.scheduled_date,
      scheduled_time: payload.scheduled_time ?? null,
      status: payload.status ?? 'scheduled',
      published_at: payload.status === 'published' ? nowIso : null,
      created_by: user.id,
    }));

    const { data, error } = await (supabase as any)
      .from('marketing_publications')
      .insert(rows)
      .select('*');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch publications:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
