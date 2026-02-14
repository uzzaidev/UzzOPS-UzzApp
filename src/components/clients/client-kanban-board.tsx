'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { funnelLabel } from '@/lib/crm/labels';
import type { UzzappClient } from '@/types';
import { ClientCard } from '@/components/clients/client-card';

const COLUMNS: Array<{ key: string; label: string }> = [
  { key: 'lead-novo', label: funnelLabel('lead-novo') },
  { key: 'qualificado', label: funnelLabel('qualificado') },
  { key: 'proposta', label: funnelLabel('proposta') },
  { key: 'negociacao', label: funnelLabel('negociacao') },
  { key: 'fechado', label: funnelLabel('fechado') },
  { key: 'stand-by', label: funnelLabel('stand-by') },
];

type StageKey = (typeof COLUMNS)[number]['key'];
type Grouped = Record<StageKey, UzzappClient[]>;

function isStageKey(value: string): value is StageKey {
  return COLUMNS.some((c) => c.key === value);
}

function buildGrouped(clients: UzzappClient[]): Grouped {
  const grouped = {
    'lead-novo': [],
    qualificado: [],
    proposta: [],
    negociacao: [],
    fechado: [],
    'stand-by': [],
  } as Grouped;

  for (const client of clients) {
    const stage = String(client.funnel_stage ?? 'lead-novo');
    if (isStageKey(stage)) grouped[stage].push(client);
    else grouped['lead-novo'].push(client);
  }

  return grouped;
}

export function ClientKanbanBoard({
  clients,
  projectId,
  onStageChange,
}: {
  clients: UzzappClient[];
  projectId: string;
  onStageChange?: (clientId: string, stage: string) => Promise<boolean> | boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [grouped, setGrouped] = useState<Grouped>(() => buildGrouped(clients));

  useEffect(() => {
    setGrouped(buildGrouped(clients));
  }, [clients]);

  const activeClient = useMemo(() => {
    if (!activeId) return null;
    for (const stage of COLUMNS) {
      const found = grouped[stage.key].find((c) => c.id === activeId);
      if (found) return found;
    }
    return null;
  }, [activeId, grouped]);

  const findStageById = (clientId: string): StageKey | null => {
    for (const col of COLUMNS) {
      if (grouped[col.key].some((c) => c.id === clientId)) return col.key;
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeClientId = String(active.id);
    const overId = String(over.id);
    const fromStage = findStageById(activeClientId);
    if (!fromStage) return;

    let toStage: StageKey | null = null;
    if (isStageKey(overId)) {
      toStage = overId;
    } else {
      toStage = findStageById(overId);
    }
    if (!toStage) return;

    if (fromStage === toStage) {
      const items = grouped[fromStage];
      const oldIndex = items.findIndex((i) => i.id === activeClientId);
      const newIndex = isStageKey(overId)
        ? items.length - 1
        : items.findIndex((i) => i.id === overId);
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return;
      setGrouped((prev) => ({
        ...prev,
        [fromStage]: arrayMove(prev[fromStage], oldIndex, newIndex),
      }));
      return;
    }

    const previous = grouped;
    const fromItems = [...grouped[fromStage]];
    const sourceIndex = fromItems.findIndex((i) => i.id === activeClientId);
    if (sourceIndex < 0) return;
    const [moved] = fromItems.splice(sourceIndex, 1);

    const toItems = [...grouped[toStage]];
    const overIndex = isStageKey(overId) ? -1 : toItems.findIndex((i) => i.id === overId);
    if (overIndex >= 0) toItems.splice(overIndex, 0, moved);
    else toItems.push(moved);

    setGrouped((prev) => ({
      ...prev,
      [fromStage]: fromItems,
      [toStage!]: toItems.map((item) => (
        item.id === moved.id ? { ...item, funnel_stage: toStage } : item
      )),
    }));

    if (onStageChange) {
      const ok = await onStageChange(moved.id, toStage);
      if (!ok) setGrouped(previous);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid auto-cols-[minmax(240px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = grouped[col.key] ?? [];
          return (
            <KanbanColumn key={col.key} id={col.key} label={col.label} count={items.length}>
              <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                {items.length === 0 ? (
                  <div className="rounded border border-dashed bg-white p-3 text-xs text-slate-400">Sem clientes</div>
                ) : (
                  items.map((client) => (
                    <SortableClientCard key={client.id} client={client} projectId={projectId} />
                  ))
                )}
              </SortableContext>
            </KanbanColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeClient ? (
          <div className="w-[220px] opacity-95">
            <ClientCard client={activeClient} projectId={projectId} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  id,
  label,
  count,
  children,
}: {
  id: string;
  label: string;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-[220px] rounded-lg border p-2 transition ${
        isOver ? 'border-uzzai-primary bg-blue-50/40' : 'border-slate-200 bg-slate-50'
      }`}
    >
      <div className="mb-2 flex items-center justify-between rounded-md bg-white px-2 py-1">
        <p className="text-xs font-semibold text-slate-700">{label}</p>
        <span className="rounded border px-1.5 py-0.5 text-[11px] text-slate-600">{count}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function SortableClientCard({
  client,
  projectId,
}: {
  client: UzzappClient;
  projectId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-70' : undefined}
      {...attributes}
      {...listeners}
    >
      <ClientCard client={client} projectId={projectId} />
    </div>
  );
}
