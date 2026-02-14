import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';
import { executePhase1Import } from '@/lib/md-feeder/phase1-executor';
import type { Phase1ValidatedItem } from '@/lib/md-feeder/parser';
import { sendMdFeederWebhook } from '@/lib/md-feeder/webhook';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ import_id: string }> }
) {
  try {
    const { import_id: importId } = await params;
    const supabase = await createClient();

    const { data: importRow } = await supabase
      .from('md_feeder_imports')
      .select('id, tenant_id, project_id, original_filename, created_by_name')
      .eq('id', importId)
      .single();

    const tenantId = (importRow as any)?.tenant_id ?? null;
    const { user, membership, error: authError } = await requireTenant(supabase, { tenantId });
    if (authError || !membership) return authError;

    if (!importRow) {
      return NextResponse.json({ error: 'Import nao encontrado.' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const itemOverrides = (body?.item_overrides ?? {}) as Record<
      string,
      { action?: 'skip' | 'create' | 'update' | 'add_observation' }
    >;

    const { data: itemRows, error: itemsError } = await supabase
      .from('md_feeder_import_items')
      .select(
        'item_index,item_type,raw_data,validation_status,validation_errors,action,entity_code,conflict_reason'
      )
      .eq('import_id', importId)
      .order('item_index', { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    const phaseItems: Phase1ValidatedItem[] = (itemRows ?? []).map((row: any) => ({
      itemIndex: row.item_index,
      itemType: row.item_type,
      rawData: row.raw_data,
      validationStatus: row.validation_status,
      validationErrors: Array.isArray(row.validation_errors) ? row.validation_errors : [],
      action: row.action,
      entityCode: row.entity_code,
      summary: '',
    }));

    await supabase
      .from('md_feeder_imports')
      .update({
        parse_status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', importId);

    const actorName =
      user?.user_metadata?.name ??
      user?.email?.split('@')[0] ??
      (importRow as any).created_by_name ??
      'Usuario';

    const executed = await executePhase1Import(supabase, phaseItems, {
      tenantId: membership.tenant_id,
      projectId: (importRow as any).project_id,
      importId,
      sourceName: (importRow as any).original_filename ?? 'md-import',
      actorUserId: user?.id ?? null,
      actorName,
    }, itemOverrides);

    await supabase
      .from('md_feeder_imports')
      .update({
        parse_status: executed.counters.failed > 0 ? 'failed' : 'completed',
        items_created: executed.counters.created,
        items_updated: executed.counters.updated,
        items_skipped: executed.counters.skipped,
        items_failed: executed.counters.failed,
        completed_at: new Date().toISOString(),
      })
      .eq('id', importId);

    void sendMdFeederWebhook({
      import_id: importId,
      parse_status: executed.counters.failed > 0 ? 'failed' : 'completed',
      items_created: executed.counters.created,
      items_updated: executed.counters.updated,
      items_skipped: executed.counters.skipped,
      items_failed: executed.counters.failed,
      project_id: (importRow as any).project_id ?? null,
      tenant_id: membership.tenant_id,
      source: (importRow as any).original_filename ?? 'md-import',
      completed_at: new Date().toISOString(),
    });

    return NextResponse.json({
      import_id: importId,
      parse_status: executed.counters.failed > 0 ? 'failed' : 'completed',
      items_created: executed.counters.created,
      items_updated: executed.counters.updated,
      items_skipped: executed.counters.skipped,
      items_failed: executed.counters.failed,
      results: executed.results,
    });
  } catch (error) {
    console.error('Error confirming md feeder import:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
