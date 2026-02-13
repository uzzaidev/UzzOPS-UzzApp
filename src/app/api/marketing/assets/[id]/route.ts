import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const BUCKET = 'marketing-assets';

const updateAssetSchema = z
  .object({
    content_piece_id: z.string().uuid().nullable().optional(),
    asset_type: z
      .enum(['image', 'video', 'carousel_slide', 'caption', 'copy', 'audio', 'reference', 'document'])
      .optional(),
    sort_order: z.number().int().optional(),
    caption_channel: z.enum(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']).nullable().optional(),
    caption_text: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    notes: z.string().nullable().optional(),
    is_approved: z.boolean().optional(),
    public_url: z.string().url().nullable().optional(),
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
      .from('marketing_assets')
      .select(`
        *,
        content_piece:marketing_content_pieces(id, code, title, project_id, content_type)
      `)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Asset nao encontrado' }, { status: 404 });
    }

    if (!data.storage_path) return NextResponse.json({ data: { ...data, download_url: null } });

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(data.storage_path, 3600);
    return NextResponse.json({ data: { ...data, download_url: signed?.signedUrl ?? null } });
  } catch (error) {
    console.error('Error fetching marketing asset:', error);
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
    const parsed = updateAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await (supabase as any)
      .from('marketing_assets')
      .update(parsed.data)
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .select(`
        *,
        content_piece:marketing_content_pieces(id, code, title, project_id, content_type)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data.storage_path) return NextResponse.json({ data: { ...data, download_url: null } });

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(data.storage_path, 3600);
    return NextResponse.json({ data: { ...data, download_url: signed?.signedUrl ?? null } });
  } catch (error) {
    console.error('Error updating marketing asset:', error);
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

    const { data: asset, error: fetchError } = await (supabase as any)
      .from('marketing_assets')
      .select('id, storage_path')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .single();

    if (fetchError || !asset) {
      return NextResponse.json({ error: 'Asset nao encontrado' }, { status: 404 });
    }

    if (asset.storage_path) {
      const { error: removeStorageError } = await supabase.storage.from(BUCKET).remove([asset.storage_path]);
      if (removeStorageError) {
        return NextResponse.json({ error: removeStorageError.message }, { status: 500 });
      }
    }

    const { error } = await (supabase as any)
      .from('marketing_assets')
      .delete()
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting marketing asset:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
