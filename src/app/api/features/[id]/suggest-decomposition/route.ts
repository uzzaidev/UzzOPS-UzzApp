import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { DecompositionSuggestion } from '@/types';
import { requireTenant } from '@/lib/tenant';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: epicId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const { data: epic, error } = await supabase
      .from('features')
      .select('*')
      .eq('id', epicId)
      .single();

    if (error || !epic) {
      return NextResponse.json({ error: 'Feature não encontrada' }, { status: 404 });
    }

    const suggestions: DecompositionSuggestion[] = [];
    const pts = epic.story_points ?? 0;
    const name: string = epic.name ?? 'Feature';
    const desc: string = epic.description ?? '';

    // Estratégia 1: Por persona (detecta palavras-chave)
    if (/usuário|user|admin|cliente|customer|guest/i.test(desc)) {
      suggestions.push({
        strategy: 'by_persona',
        label: 'Decompor por Persona/Papel',
        stories: [
          {
            name: `${name} — Usuário Final`,
            description: `Perspectiva do usuário final: ${desc}`,
            story_points: Math.ceil(pts / 3),
            acceptance_criteria: 'Usuário consegue realizar a ação sem erros',
          },
          {
            name: `${name} — Administrador`,
            description: `Perspectiva do admin: gerenciar e configurar`,
            story_points: Math.ceil(pts / 3),
            acceptance_criteria: 'Admin consegue gerenciar as configurações',
          },
        ],
      });
    }

    // Estratégia 2: Por camada técnica (épicos grandes)
    if (pts > 8) {
      suggestions.push({
        strategy: 'by_layer',
        label: 'Decompor por Camada Técnica',
        stories: [
          {
            name: `${name} — API/Backend`,
            description: 'Implementação do backend, endpoints e regras de negócio',
            story_points: Math.ceil(pts * 0.4),
            acceptance_criteria: 'API funcionando com testes automatizados',
          },
          {
            name: `${name} — UI/Frontend`,
            description: 'Implementação da interface e componentes React',
            story_points: Math.ceil(pts * 0.4),
            acceptance_criteria: 'Interface responsiva e funcional',
          },
          {
            name: `${name} — Integração & Testes`,
            description: 'Integração E2E e testes de aceitação',
            story_points: Math.ceil(pts * 0.2),
            acceptance_criteria: 'Fluxo completo testado e aprovado pelo PO',
          },
        ],
      });
    }

    // Estratégia 3: Por cenário/fluxo
    suggestions.push({
      strategy: 'by_scenario',
      label: 'Decompor por Cenário de Uso',
      stories: [
        {
          name: `${name} — Happy Path`,
          description: 'Fluxo principal sem erros ou exceções',
          story_points: Math.ceil(pts * 0.5),
          acceptance_criteria: 'Fluxo principal funciona corretamente',
        },
        {
          name: `${name} — Tratamento de Erros`,
          description: 'Validações, mensagens de erro e casos excepcionais',
          story_points: Math.ceil(pts * 0.3),
          acceptance_criteria: 'Todos os casos de erro tratados com feedback claro',
        },
        {
          name: `${name} — Edge Cases`,
          description: 'Casos limítrofes e situações especiais',
          story_points: Math.ceil(pts * 0.2),
          acceptance_criteria: 'Edge cases identificados e tratados',
        },
      ],
    });

    // Estratégia 4: Por critérios de aceitação (se tiver acceptance_criteria)
    if (epic.acceptance_criteria && epic.acceptance_criteria.length > 50) {
      suggestions.push({
        strategy: 'by_criteria',
        label: 'Decompor por Critério de Aceitação',
        stories: [
          {
            name: `${name} — Parte 1`,
            description: `Primeiro critério: ${epic.acceptance_criteria.substring(0, 100)}`,
            story_points: Math.ceil(pts / 2),
          },
          {
            name: `${name} — Parte 2`,
            description: 'Demais critérios de aceitação',
            story_points: Math.floor(pts / 2),
          },
        ],
      });
    }

    return NextResponse.json({ data: suggestions });
  } catch (error) {
    console.error('Error suggesting decomposition:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
