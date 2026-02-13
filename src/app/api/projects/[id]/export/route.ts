import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const [projectRes, velocityRes, featuresRes] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('sprint_velocity').select('*').eq('project_id', id).order('start_date', { ascending: true }),
      supabase.from('features').select('id, code, name, status, priority, story_points, version, is_mvp, is_spike, category').eq('project_id', id),
    ]);

    if (projectRes.error || !projectRes.data) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projectRes.data;
    const velocity = velocityRes.data ?? [];
    const features = featuresRes.data ?? [];

    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
      },
      velocity,
      features,
      generated_at: new Date().toISOString(),
    };

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Velocity
      const velocityRows = velocity.map((v) => ({
        Sprint: v.sprint_name,
        'Start Date': v.start_date,
        'End Date': v.end_date,
        Velocity: v.velocity,
        'Total Points': v.total_committed_points,
        'Completion %': v.completion_rate,
        'Features Done': v.features_done,
        'Carry Over': v.carry_over_count,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(velocityRows), 'Velocity');

      // Sheet 2: Features
      const featureRows = features.map((f) => ({
        Code: f.code,
        Name: f.name,
        Status: f.status,
        Priority: f.priority,
        Points: f.story_points,
        Version: f.version,
        MVP: f.is_mvp ? 'Yes' : 'No',
        Spike: f.is_spike ? 'Yes' : 'No',
        Category: f.category,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(featureRows), 'Features');

      // Sheet 3: Spikes
      const spikes = features.filter((f) => f.is_spike);
      if (spikes.length > 0) {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(spikes.map((s) => ({
          Code: s.code,
          Name: s.name,
          Status: s.status,
        }))), 'Spikes');
      }

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${project.name}-report.xlsx"`,
        },
      });
    }

    // Default: JSON
    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
