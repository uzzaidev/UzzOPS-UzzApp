import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

type FeedbackPayload = {
  title: string;
  description: string | null;
  type: 'bug' | 'sugestao' | 'elogio' | 'outro';
  priority: 'critica' | 'alta' | 'media' | 'baixa';
  page_url: string | null;
  page_title: string | null;
  metadata: Record<string, unknown>;
};

function normalizeFeedbackPayload(raw: unknown): { data?: FeedbackPayload; error?: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Payload must be an object' };
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === 'string' ? obj.title.trim() : '';
  if (!title) return { error: 'title is required' };

  const allowedType = new Set(['bug', 'sugestao', 'elogio', 'outro']);
  const typeValue = typeof obj.type === 'string' ? obj.type : 'sugestao';
  const type = (allowedType.has(typeValue) ? typeValue : 'sugestao') as FeedbackPayload['type'];

  const allowedPriority = new Set(['critica', 'alta', 'media', 'baixa']);
  const priorityValue = typeof obj.priority === 'string' ? obj.priority : 'media';
  const priority = (allowedPriority.has(priorityValue) ? priorityValue : 'media') as FeedbackPayload['priority'];

  const description = typeof obj.description === 'string' ? obj.description.trim() : null;
  const page_url = typeof obj.page_url === 'string' ? obj.page_url.trim() : null;
  const page_title = typeof obj.page_title === 'string' ? obj.page_title.trim() : null;
  const metadata =
    obj.metadata && typeof obj.metadata === 'object' && !Array.isArray(obj.metadata)
      ? (obj.metadata as Record<string, unknown>)
      : {};

  return {
    data: {
      title,
      description: description || null,
      type,
      priority,
      page_url: page_url || null,
      page_title: page_title || null,
      metadata,
    },
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError) return authError;

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('tenant_id', project.tenant_id)
      .eq('project_id', project.id)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id')
      .eq('id', id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { user, error: authError } = await requireTenant(supabase, { tenantId: project.tenant_id });
    if (authError || !user) return authError;

    const formData = await request.formData();
    const rawData = formData.get('data');
    if (typeof rawData !== 'string') {
      return NextResponse.json({ error: 'Invalid form payload' }, { status: 400 });
    }

    let parsedRaw: unknown;
    try {
      parsedRaw = JSON.parse(rawData);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON in data field' }, { status: 400 });
    }

    const normalized = normalizeFeedbackPayload(parsedRaw);
    if (!normalized.data) {
      return NextResponse.json({ error: normalized.error ?? 'Invalid payload' }, { status: 400 });
    }

    const feedbackId =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const payload = normalized.data;
    let screenshotPath: string | null = null;
    let screenshotUrl: string | null = null;

    const image = formData.get('image');
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
      }
      const ext = image.type.includes('jpeg') ? 'jpg' : image.type.includes('webp') ? 'webp' : 'png';
      screenshotPath = `${project.tenant_id}/${project.id}/${feedbackId}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('feedback-screenshots')
        .upload(screenshotPath, image, {
          contentType: image.type || 'image/png',
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 });
      }

      const { data: signed, error: signedError } = await supabase.storage
        .from('feedback-screenshots')
        .createSignedUrl(screenshotPath, 60 * 60 * 24 * 365);

      if (signedError) {
        return NextResponse.json({ error: signedError.message }, { status: 400 });
      }
      screenshotUrl = signed?.signedUrl ?? null;
    }

    const { data, error } = await supabase
      .from('user_feedback')
      .insert({
        id: feedbackId,
        tenant_id: project.tenant_id,
        project_id: project.id,
        user_id: user.id,
        user_email: user.email ?? null,
        user_name: (user.user_metadata?.name as string | undefined) ?? user.email ?? null,
        title: payload.title,
        description: payload.description ?? null,
        type: payload.type,
        priority: payload.priority,
        screenshot_url: screenshotUrl,
        screenshot_path: screenshotPath,
        page_url: payload.page_url ?? null,
        page_title: payload.page_title ?? null,
        metadata: payload.metadata ?? {},
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[feedback POST] unexpected error', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
