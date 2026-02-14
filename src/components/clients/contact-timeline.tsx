'use client';

import { Badge } from '@/components/ui/badge';

function asText(v: unknown) {
  if (v == null) return '-';
  const s = String(v).trim();
  return s || '-';
}

function formatDate(v: unknown) {
  const s = asText(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

export function ContactTimeline({
  contacts,
  selectedId,
  onSelect,
}: {
  contacts: Array<Record<string, unknown>>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (contacts.length === 0) {
    return <p className="text-sm text-gray-500 mt-3">Nenhuma ata encontrada para este cliente.</p>;
  }

  return (
    <div className="mt-3 space-y-3">
      {contacts.map((contact, index) => {
        const id = String(contact.id ?? '');
        const active = id === String(selectedId ?? '');
        const isLast = index === contacts.length - 1;
        return (
          <div key={id} className="relative pl-5">
            <span className={`absolute left-0 top-4 h-2 w-2 rounded-full ${active ? 'bg-uzzai-primary' : 'bg-slate-300'}`} />
            {!isLast ? <span className="absolute left-[3px] top-6 h-[calc(100%-6px)] w-px bg-slate-200" /> : null}
            <button
              type="button"
              onClick={() => onSelect(id)}
              className={`w-full rounded-md border p-3 text-left transition ${
                active ? 'border-uzzai-primary bg-uzzai-primary/5' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{asText(contact.contact_subtype)}</p>
                <Badge variant="outline">{asText(contact.status)}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDate(contact.data_contato)}</p>
              <p className="mt-1 text-xs text-gray-500">
                Seq {asText(contact.interaction_sequence)} | {asText(contact.estagio_funil)} |{' '}
                {contact.probabilidade_fechamento == null ? '-' : `${contact.probabilidade_fechamento}%`}
              </p>
            </button>
          </div>
        );
      })}
    </div>
  );
}

