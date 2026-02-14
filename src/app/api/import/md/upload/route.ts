import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import {
  parseMdFeederDocument,
  validatePhase1Items,
  type Phase1ValidatedItem,
} from '@/lib/md-feeder/parser';

function buildPreview(items: Phase1ValidatedItem[], parseErrors: string[]) {
  const counters = {
    items_total: items.length,
    items_valid: items.filter((i) => i.validationStatus === 'valid').length,
    items_update: items.filter((i) => i.action === 'update').length,
    items_observation: items.filter((i) => i.action === 'add_observation').length,
    items_skip: items.filter((i) => i.action === 'skip').length,
    items_invalid: items.filter((i) => i.validationStatus === 'invalid').length,
  };

  return {
    ...counters,
    items: items.map((i) => ({
      index: i.itemIndex,
      item_type: i.itemType,
      validation_status: i.validationStatus,
      action: i.action,
      entity_code: i.entityCode,
      summary: i.summary,
      raw_data: i.rawData,
      validation_errors: i.validationErrors,
    })),
    errors: parseErrors,
  };
}

function normalizeItemTypeForDb(itemType: string) {
  return String(itemType || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

function withGlobalParseErrors(items: Phase1ValidatedItem[], parseErrors: string[]) {
  if (parseErrors.length === 0) return items;
  return items.map((item) => ({
    ...item,
    validationStatus: 'invalid' as const,
    action: null,
    validationErrors: [...item.validationErrors, ...parseErrors],
  }));
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get('file');
    const projectIdInput = String(formData.get('project_id') ?? '').trim();
    const projectId = projectIdInput || null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo .md obrigatorio.' }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith('.md')) {
      return NextResponse.json({ error: 'Apenas arquivos .md sao aceitos.' }, { status: 400 });
    }
    if (file.size > 500 * 1024) {
      return NextResponse.json({ error: 'Arquivo excede 500KB.' }, { status: 400 });
    }

    let scopedTenantId: string | null = null;
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('tenant_id')
        .eq('id', projectId)
        .single();
      scopedTenantId = project?.tenant_id ?? null;
    }

    const { user, membership, error: authError } = await requireTenant(supabase, {
      tenantId: scopedTenantId,
    });
    if (authError || !membership) return authError;

    const content = await file.text();
    const parsed = parseMdFeederDocument(content);

    const codeCandidates = parsed.items
      .flatMap((item) => [
        String(item.rawData.code ?? '').trim().toUpperCase(),
        String(item.rawData.feature_code ?? '').trim().toUpperCase(),
        String(item.rawData.depends_on_code ?? '').trim().toUpperCase(),
      ])
      .filter(Boolean);

    const uniqueCodes = [...new Set(codeCandidates)];
    let existingRows: Array<{ id: string; code: string; status: string | null }> = [];
    if (uniqueCodes.length > 0) {
      const { data } = await supabase
        .from('features')
        .select('id, code, status')
        .eq('tenant_id', membership.tenant_id)
        .in('code', uniqueCodes);
      existingRows = (data ?? []) as Array<{ id: string; code: string; status: string | null }>;
    }

    const existingByCode = new Map(
      existingRows.map((r) => [String(r.code).toUpperCase(), { id: r.id, status: r.status }])
    );
    const riskIds = parsed.items
      .filter((item) => item.itemType === 'risk')
      .map((item) => String(item.rawData.public_id ?? '').trim().toUpperCase())
      .filter(Boolean);
    let existingRiskRows: Array<{ public_id: string }> = [];
    if (riskIds.length > 0) {
      const { data } = await supabase
        .from('risks')
        .select('public_id')
        .eq('tenant_id', membership.tenant_id)
        .in('public_id', [...new Set(riskIds)]);
      existingRiskRows = (data ?? []) as Array<{ public_id: string }>;
    }

    const campaignNames = parsed.items
      .filter((item) => item.itemType === 'marketing_campaign')
      .map((item) => String(item.rawData.name ?? '').trim().toLowerCase())
      .filter(Boolean);
    let existingCampaignRows: Array<{ name: string }> = [];
    if (campaignNames.length > 0) {
      const { data } = await supabase
        .from('marketing_campaigns')
        .select('name')
        .eq('tenant_id', membership.tenant_id);
      existingCampaignRows = (data ?? []) as Array<{ name: string }>;
    }

    const hasTeamMemberItems = parsed.items.some((item) => item.itemType === 'team_member');
    const hasClientItems = parsed.items.some((item) => item.itemType === 'uzzapp_client');

    let existingTeamRows: Array<{ name: string; email: string | null }> = [];
    if (hasTeamMemberItems) {
      const { data } = await supabase
        .from('team_members')
        .select('name,email')
        .eq('tenant_id', membership.tenant_id);
      existingTeamRows = (data ?? []) as Array<{ name: string; email: string | null }>;
    }

    let existingClientRows: Array<{ email: string | null; phone: string | null }> = [];
    if (hasClientItems) {
      const { data } = await supabase
        .from('uzzapp_clients')
        .select('email,phone')
        .eq('tenant_id', membership.tenant_id);
      existingClientRows = (data ?? []) as Array<{ email: string | null; phone: string | null }>;
    }

    const sprintCodeCandidates = parsed.items
      .filter((item) => item.itemType === 'sprint_update' || item.itemType === 'sprint')
      .map((item) => String(item.rawData.sprint_code ?? '').trim().toUpperCase())
      .concat(
        parsed.items
          .filter((item) => item.itemType === 'sprint')
          .map((item) => String(item.rawData.code ?? '').trim().toUpperCase())
      )
      .filter(Boolean);
    let existingSprintRows: Array<{ code: string }> = [];
    if (sprintCodeCandidates.length > 0 && projectId) {
      const { data } = await supabase
        .from('sprints')
        .select('code')
        .eq('tenant_id', membership.tenant_id)
        .eq('project_id', projectId)
        .in('code', [...new Set(sprintCodeCandidates)]);
      existingSprintRows = (data ?? []) as Array<{ code: string }>;
    }

    const incomingSprintCodes = new Set(
      parsed.items
        .filter((item) => item.itemType === 'sprint')
        .map((item) => String(item.rawData.code ?? '').trim().toUpperCase())
        .filter(Boolean)
    );

    const baseValidated = validatePhase1Items(parsed.items, {
      existingByCode,
      existingRisksByPublicId: new Set(existingRiskRows.map((r) => String(r.public_id).toUpperCase())),
      existingCampaignsByName: new Set(existingCampaignRows.map((r) => String(r.name).toLowerCase())),
      existingSprintsByCode: new Set(existingSprintRows.map((r) => String(r.code).toUpperCase())),
      incomingSprintsByCode: incomingSprintCodes,
      existingTeamMemberEmails: new Set(
        existingTeamRows
          .map((r) => String(r.email ?? '').trim().toLowerCase())
          .filter(Boolean)
      ),
      existingTeamMemberNames: new Set(
        existingTeamRows
          .map((r) => String(r.name ?? '').trim().toLowerCase())
          .filter(Boolean)
      ),
      existingClientEmails: new Set(
        existingClientRows
          .map((r) => String(r.email ?? '').trim().toLowerCase())
          .filter(Boolean)
      ),
      existingClientPhones: new Set(
        existingClientRows
          .map((r) => String(r.phone ?? '').trim())
          .filter(Boolean)
      ),
    });
    const validated = withGlobalParseErrors(baseValidated, parsed.errors);

    const actorName =
      user?.user_metadata?.name ??
      user?.email?.split('@')[0] ??
      'Usuario';

    const { data: createdImport, error: importError } = await supabase
      .from('md_feeder_imports')
      .insert({
        tenant_id: membership.tenant_id,
        project_id: projectId,
        sprint_context: String(parsed.frontmatter.sprint ?? '') || null,
        original_filename: file.name,
        file_content: content,
        parse_status: parsed.errors.length > 0 ? 'failed' : 'parsed',
        items_total: validated.length,
        parse_errors: parsed.errors,
        parsed_at: new Date().toISOString(),
        created_by: user?.id ?? null,
        created_by_name: actorName,
      })
      .select('id')
      .single();

    if (importError || !createdImport) {
      return NextResponse.json({ error: importError?.message ?? 'Falha ao criar import.' }, { status: 500 });
    }

    const itemRows = validated.map((item) => {
      const normalizedItemType = normalizeItemTypeForDb(item.itemType);
      return {
      tenant_id: membership.tenant_id,
      import_id: createdImport.id,
      item_index: item.itemIndex,
      item_type: normalizedItemType,
      raw_data: item.rawData,
      validation_status: item.validationStatus,
      validation_errors: item.validationErrors,
      action: item.action,
      entity_code: item.entityCode,
      conflict_reason: item.validationErrors.join('; ') || null,
      entity_type:
        normalizedItemType === 'feature' || normalizedItemType === 'bug' || normalizedItemType === 'bug_resolution'
          ? 'feature'
          : normalizedItemType,
    };
    });

    if (itemRows.length > 0) {
      const { error: itemsError } = await supabase.from('md_feeder_import_items').insert(itemRows);
      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      import_id: createdImport.id,
      parse_status: parsed.errors.length > 0 ? 'failed' : 'parsed',
      preview: buildPreview(validated, parsed.errors),
    });
  } catch (error) {
    console.error('Error parsing md feeder upload:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
