import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const BUCKET = 'marketing-assets';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/wav',
  'text/plain',
  'text/markdown',
  'application/pdf',
]);
const ASSET_TYPES = new Set([
  'image',
  'video',
  'carousel_slide',
  'caption',
  'copy',
  'audio',
  'reference',
  'document',
]);
const CHANNELS = new Set(['instagram', 'linkedin', 'site', 'tiktok', 'youtube', 'whatsapp']);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function parseTags(input: string | null) {
  if (!input) return [];
  return input
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { user, membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership || !user) return authError;

    const formData = await request.formData();
    const file = formData.get('file');
    const contentPieceIdRaw = formData.get('content_piece_id');
    const assetTypeRaw = String(formData.get('asset_type') ?? '');
    const captionChannelRaw = formData.get('caption_channel');
    const captionTextRaw = formData.get('caption_text');
    const notesRaw = formData.get('notes');
    const tagsRaw = formData.get('tags');
    const sortOrderRaw = formData.get('sort_order');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo obrigatorio' }, { status: 400 });
    }
    if (!ASSET_TYPES.has(assetTypeRaw)) {
      return NextResponse.json({ error: 'asset_type invalido' }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Arquivo excede 50MB' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Tipo de arquivo nao permitido' }, { status: 400 });
    }

    const contentPieceId =
      typeof contentPieceIdRaw === 'string' && contentPieceIdRaw.trim().length > 0
        ? contentPieceIdRaw.trim()
        : null;

    if (contentPieceId) {
      const { data: piece, error: pieceError } = await (supabase as any)
        .from('marketing_content_pieces')
        .select('id')
        .eq('tenant_id', membership.tenant_id)
        .eq('id', contentPieceId)
        .single();

      if (pieceError || !piece) {
        return NextResponse.json({ error: 'content_piece_id invalido' }, { status: 400 });
      }
    }

    const captionChannel =
      typeof captionChannelRaw === 'string' && captionChannelRaw.trim().length > 0
        ? captionChannelRaw.trim()
        : null;
    if (captionChannel && !CHANNELS.has(captionChannel)) {
      return NextResponse.json({ error: 'caption_channel invalido' }, { status: 400 });
    }

    const assetId = crypto.randomUUID();
    const safeName = sanitizeFileName(file.name);
    const folder = contentPieceId ?? 'global';
    const path = `tenant-${membership.tenant_id}/${folder}/${assetId}_${safeName}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) {
      return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 });
    }

    const tags = parseTags(typeof tagsRaw === 'string' ? tagsRaw : null);
    const sortOrder =
      typeof sortOrderRaw === 'string' && sortOrderRaw.trim().length > 0
        ? Number(sortOrderRaw)
        : 0;

    const { data: inserted, error: dbError } = await (supabase as any)
      .from('marketing_assets')
      .insert({
        id: assetId,
        tenant_id: membership.tenant_id,
        content_piece_id: contentPieceId,
        asset_type: assetTypeRaw,
        file_name: file.name,
        storage_path: path,
        mime_type: file.type,
        file_size_bytes: file.size,
        sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        caption_channel: captionChannel,
        caption_text: typeof captionTextRaw === 'string' ? captionTextRaw : null,
        tags,
        notes: typeof notesRaw === 'string' ? notesRaw : null,
        uploaded_by: user.id,
      })
      .select(`
        *,
        content_piece:marketing_content_pieces(id, code, title, project_id, content_type)
      `)
      .single();

    if (dbError) {
      await supabase.storage.from(BUCKET).remove([path]);
      return NextResponse.json({ error: `Falha ao salvar metadata: ${dbError.message}` }, { status: 500 });
    }

    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);

    return NextResponse.json(
      { data: { ...inserted, download_url: signed?.signedUrl ?? null } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading marketing asset:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
