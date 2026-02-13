import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';

const BUCKET = 'marketing-assets';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { searchParams } = new URL(request.url);
    const contentPieceId = searchParams.get('content_piece_id');
    const assetType = searchParams.get('asset_type');
    const approved = searchParams.get('approved');
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search')?.toLowerCase().trim();
    const tags = searchParams.getAll('tags[]');

    let query = (supabase as any)
      .from('marketing_assets')
      .select(`
        *,
        content_piece:marketing_content_pieces(id, code, title, project_id, content_type)
      `)
      .eq('tenant_id', membership.tenant_id)
      .order('created_at', { ascending: false });

    if (contentPieceId) query = query.eq('content_piece_id', contentPieceId);
    if (assetType) query = query.eq('asset_type', assetType);
    if (approved === 'true') query = query.eq('is_approved', true);
    if (approved === 'false') query = query.eq('is_approved', false);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let items = (data ?? []) as any[];
    if (tags.length > 0) {
      items = items.filter((item) => {
        const currentTags = item.tags ?? [];
        return tags.every((tag) => currentTags.includes(tag));
      });
    }
    if (projectId) {
      items = items.filter((item) => item.content_piece?.project_id === projectId);
    }
    if (search) {
      items = items.filter((item) =>
        [item.file_name ?? '', item.caption_text ?? '', item.notes ?? '', item.content_piece?.title ?? '']
          .join(' ')
          .toLowerCase()
          .includes(search)
      );
    }

    const withSigned = await Promise.all(
      items.map(async (item) => {
        if (!item.storage_path) return { ...item, download_url: null };
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(item.storage_path, 3600);
        return { ...item, download_url: signed?.signedUrl ?? null };
      })
    );

    return NextResponse.json({ data: withSigned });
  } catch (error) {
    console.error('Error listing assets:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
