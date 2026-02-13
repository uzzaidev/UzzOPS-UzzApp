import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { requireTenant } from '@/lib/tenant';
import { z } from 'zod';

const childStorySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().nullable().optional(),
  story_points: z.number().int().min(0).optional(),
  acceptance_criteria: z.string().nullable().optional(),
});

const decomposeSchema = z.object({
  strategy: z.string().trim().min(1),
  stories: z.array(childStorySchema).min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: epicId } = await params;
    const supabase = await createClient();
    const { error: authError } = await requireTenant(supabase);
    if (authError) return authError;

    const body = await request.json();
    const parsed = decomposeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const payload = parsed.data;

    const { data: epic, error: epicError } = await supabase
      .from('features')
      .select('*')
      .eq('id', epicId)
      .single();

    if (epicError || !epic) {
      return NextResponse.json({ error: 'Épico não encontrado' }, { status: 404 });
    }

    const createdStories = [];

    for (const story of payload.stories) {
      const { data: lastFeature } = await supabase
        .from('features')
        .select('code')
        .eq('project_id', epic.project_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastNum = lastFeature?.code
        ? parseInt(lastFeature.code.replace(/\D/g, ''), 10) || 0
        : 0;
      const newCode = `F-${String(lastNum + 1).padStart(3, '0')}`;

      const { data: newStory, error: storyError } = await supabase
        .from('features')
        .insert({
          project_id: epic.project_id,
          name: story.name.trim(),
          description: story.description ?? null,
          story_points: story.story_points ?? 3,
          acceptance_criteria: story.acceptance_criteria ?? null,
          priority: epic.priority,
          moscow: epic.moscow,
          version: epic.version,
          category: epic.category,
          status: 'backlog',
          code: newCode,
        })
        .select()
        .single();

      if (storyError) {
        console.error('Error creating child story:', storyError);
        continue;
      }

      await supabase.from('epic_decomposition').insert({
        epic_id: epicId,
        child_story_id: newStory.id,
        decomposition_strategy: payload.strategy,
      });

      createdStories.push(newStory);
    }

    await supabase
      .from('features')
      .update({ is_epic: true, decomposed_at: new Date().toISOString() })
      .eq('id', epicId);

    return NextResponse.json(
      { data: { epic: { ...epic, is_epic: true }, stories: createdStories } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error decomposing epic:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
