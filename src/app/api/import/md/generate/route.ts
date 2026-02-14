import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requireTenant } from '@/lib/tenant';

const generateSchema = z.object({
  project_id: z.string().uuid(),
  transcription: z.string().min(20),
  author: z.string().optional(),
  source: z.string().optional(),
  sprint: z.string().optional(),
});

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim();
}

function extractCandidateLines(transcription: string) {
  return transcription
    .split('\n')
    .map(normalizeLine)
    .filter((line) => line.length >= 20)
    .slice(0, 50);
}

function classifyLine(line: string) {
  const lower = line.toLowerCase();
  if (/(bug|erro|falha|incidente|defeito)/.test(lower)) return 'bug';
  if (/(risco|risk|bloqueio crítico|dependência crítica)/.test(lower)) return 'risk';
  if (/(sprint|planejamento|planning|velocity)/.test(lower)) return 'planning_result';
  return 'feature';
}

function buildMarkdown(params: {
  projectCode: string;
  sprint?: string;
  author?: string;
  source?: string;
  lines: string[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const head = [
    '---',
    'template: uzzops-feeder',
    'template_version: "1.0"',
    'version: "1.0"',
    `project: "${params.projectCode}"`,
    `sprint: "${params.sprint || ''}"`,
    `date: "${today}"`,
    `author: "${params.author || 'MD Agent'}"`,
    `source: "${params.source || 'transcricao-gerada'}"`,
    '---',
    '',
  ];

  const blocks: string[] = [];
  for (const line of params.lines.slice(0, 8)) {
    const type = classifyLine(line);
    if (type === 'bug') {
      blocks.push(
        '## bug',
        `name: ${line.slice(0, 80)}`,
        'description: |',
        `  ${line}`,
        'category: Backend',
        'version: V1',
        'priority: P1',
        'status: backlog',
        ''
      );
      continue;
    }
    if (type === 'risk') {
      blocks.push(
        '## risk',
        `title: ${line.slice(0, 90)}`,
        `description: ${line}`,
        'gut_g: 3',
        'gut_u: 3',
        'gut_t: 3',
        'status: identified',
        ''
      );
      continue;
    }
    if (type === 'planning_result') {
      blocks.push(
        '## planning_result',
        'code: F-010',
        'story_points: 5',
        'business_value: 8',
        'work_effort: 5',
        ''
      );
      continue;
    }
    blocks.push(
      '## feature',
      `name: ${line.slice(0, 90)}`,
      'description: |',
      `  ${line}`,
      'category: Backend',
      'version: V1',
      'priority: P2',
      'status: backlog',
      ''
    );
  }

  if (blocks.length === 0) {
    blocks.push(
      '## feature',
      'name: Revisar transcricao e extrair itens',
      'description: |',
      '  Nao foi possivel extrair itens claros automaticamente.',
      'category: Produto',
      'version: V1',
      'priority: P2',
      'status: backlog',
      ''
    );
  }

  return [...head, ...blocks].join('\n');
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const parsed = generateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload invalido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: project } = await supabase
      .from('projects')
      .select('id, tenant_id, code')
      .eq('id', payload.project_id)
      .single();

    const { error: authError } = await requireTenant(supabase, { tenantId: project?.tenant_id ?? null });
    if (authError) return authError;
    if (!project) {
      return NextResponse.json({ error: 'Projeto nao encontrado.' }, { status: 404 });
    }

    const lines = extractCandidateLines(payload.transcription);
    const markdown = buildMarkdown({
      projectCode: (project as any).code ?? 'PROJECT',
      sprint: payload.sprint,
      author: payload.author,
      source: payload.source,
      lines,
    });

    return NextResponse.json({
      data: {
        markdown,
        extracted_items: Math.min(lines.length, 8),
      },
    });
  } catch (error) {
    console.error('Error generating md feeder markdown:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

