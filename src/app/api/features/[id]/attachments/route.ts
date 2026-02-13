import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const BUCKET = 'feature-assets';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['text/plain', 'text/markdown', 'application/pdf']);

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function assertFeatureAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  featureId: string,
  tenantId: string
) {
  const { data, error } = await supabase
    .from('features')
    .select('id')
    .eq('id', featureId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !data) return false;
  return true;
}

async function resolveFeatureTenantId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  featureId: string
) {
  const { data } = await supabase
    .from('features')
    .select('tenant_id')
    .eq('id', featureId)
    .single();

  return data?.tenant_id ?? null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const tenantId = await resolveFeatureTenantId(supabase, id);
  const { membership, error: authError } = await requireTenant(supabase, { tenantId });
  if (authError) return authError;

  const allowed = await assertFeatureAccess(supabase, id, membership!.tenant_id);
  if (!allowed) {
    return NextResponse.json({ error: 'Feature nao encontrada' }, { status: 404 });
  }

  const { data, error } = await supabase
    .from('feature_attachments')
    .select('*')
    .eq('feature_id', id)
    .eq('tenant_id', membership!.tenant_id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Erro ao listar anexos' }, { status: 500 });
  }

  const withUrls = await Promise.all(
    (data ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(row.file_path, 3600);
      return { ...row, download_url: signed?.signedUrl ?? null };
    })
  );

  return NextResponse.json({ data: withUrls });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const tenantId = await resolveFeatureTenantId(supabase, id);
  const { user, membership, error: authError } = await requireTenant(supabase, { tenantId });
  if (authError) return authError;

  const allowed = await assertFeatureAccess(supabase, id, membership!.tenant_id);
  if (!allowed) {
    return NextResponse.json({ error: 'Feature nao encontrada' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo obrigatorio' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo nao permitido. Use .md/.txt/.pdf' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'Arquivo excede 10MB' }, { status: 400 });
  }

  const safeName = sanitizeFileName(file.name);
  const path = `tenant-${membership!.tenant_id}/feature-${id}/${Date.now()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: `Falha no upload: ${uploadError.message}` }, { status: 500 });
  }

  const { data: inserted, error: dbError } = await supabase
    .from('feature_attachments')
    .insert({
      tenant_id: membership!.tenant_id,
      feature_id: id,
      file_name: file.name,
      file_path: path,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: user!.id,
    })
    .select('*')
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
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const tenantId = await resolveFeatureTenantId(supabase, id);
  const { membership, error: authError } = await requireTenant(supabase, { tenantId });
  if (authError) return authError;

  const attachmentId = new URL(request.url).searchParams.get('attachmentId');
  if (!attachmentId) {
    return NextResponse.json({ error: 'attachmentId obrigatorio' }, { status: 400 });
  }

  const allowed = await assertFeatureAccess(supabase, id, membership!.tenant_id);
  if (!allowed) {
    return NextResponse.json({ error: 'Feature nao encontrada' }, { status: 404 });
  }

  const { data: attachment, error: fetchError } = await supabase
    .from('feature_attachments')
    .select('*')
    .eq('id', attachmentId)
    .eq('feature_id', id)
    .eq('tenant_id', membership!.tenant_id)
    .single();

  if (fetchError || !attachment) {
    return NextResponse.json({ error: 'Anexo nao encontrado' }, { status: 404 });
  }

  const { error: removeStorageError } = await supabase.storage.from(BUCKET).remove([attachment.file_path]);
  if (removeStorageError) {
    return NextResponse.json({ error: `Falha ao remover arquivo: ${removeStorageError.message}` }, { status: 500 });
  }

  const { error: deleteError } = await supabase.from('feature_attachments').delete().eq('id', attachmentId);
  if (deleteError) {
    return NextResponse.json({ error: `Falha ao remover metadata: ${deleteError.message}` }, { status: 500 });
  }

  return NextResponse.json({ message: 'Anexo removido com sucesso' });
}
