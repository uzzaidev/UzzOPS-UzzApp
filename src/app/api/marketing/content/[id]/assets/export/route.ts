import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

function safeName(input: string) {
  return input.replace(/[^\w.-]+/g, '_');
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'content id obrigatorio' }, { status: 400 });
    }

    const supabase = await createClient();
    const { membership, error: authError } = await requireTenant(supabase);
    if (authError || !membership) return authError;

    const { data: contentPiece, error: contentError } = await (supabase as any)
      .from('marketing_content_pieces')
      .select('id, code, title')
      .eq('tenant_id', membership.tenant_id)
      .eq('id', id)
      .maybeSingle();

    if (contentError) {
      return NextResponse.json({ error: contentError.message }, { status: 500 });
    }
    if (!contentPiece) {
      return NextResponse.json({ error: 'conteudo nao encontrado' }, { status: 404 });
    }

    const { data: assets, error: assetsError } = await (supabase as any)
      .from('marketing_assets')
      .select('id, file_name, storage_path, caption_text, caption_channel, asset_type')
      .eq('tenant_id', membership.tenant_id)
      .eq('content_piece_id', id)
      .order('created_at', { ascending: true });

    if (assetsError) {
      return NextResponse.json({ error: assetsError.message }, { status: 500 });
    }

    const zip = new JSZip();
    const folderName = safeName(`${contentPiece.code ?? 'MKT'}_${contentPiece.title ?? 'conteudo'}`);
    const root = zip.folder(folderName) ?? zip;

    const items = (assets ?? []) as any[];
    for (const asset of items) {
      const baseName = safeName(asset.file_name ?? `${asset.id}`);

      if (asset.storage_path) {
        const { data: signed, error: signedError } = await supabase.storage
          .from('marketing-assets')
          .createSignedUrl(asset.storage_path, 300);

        if (!signedError && signed?.signedUrl) {
          const response = await fetch(signed.signedUrl);
          if (response.ok) {
            const buffer = await response.arrayBuffer();
            root.file(baseName, buffer);
            continue;
          }
        }
      }

      if (asset.caption_text) {
        const txtName = baseName.endsWith('.txt') ? baseName : `${baseName}.txt`;
        root.file(txtName, asset.caption_text);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    const body = new Uint8Array(zipBuffer);
    const fileName = `${folderName}_assets.zip`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting marketing assets zip:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
