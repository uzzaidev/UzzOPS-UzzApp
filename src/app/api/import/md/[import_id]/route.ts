import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ import_id: string }> }
) {
  try {
    const { import_id: importId } = await params;
    const supabase = await createClient();

    const { data: importRow } = await supabase
      .from('md_feeder_imports')
      .select('*')
      .eq('id', importId)
      .single();

    const tenantId = (importRow as any)?.tenant_id ?? null;
    const { membership, error: authError } = await requireTenant(supabase, { tenantId });
    if (authError || !membership) return authError;

    if (!importRow) {
      return NextResponse.json({ error: 'Import nao encontrado.' }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabase
      .from('md_feeder_import_items')
      .select('*')
      .eq('import_id', importId)
      .order('item_index', { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        import: importRow,
        items: items ?? [],
      },
    });
  } catch (error) {
    console.error('Error fetching md feeder import detail:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
