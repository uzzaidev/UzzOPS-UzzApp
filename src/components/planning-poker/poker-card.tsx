'use client';

import { cn } from '@/lib/utils';
import type { PokerCardValue } from '@/types';

interface Props {
  value: PokerCardValue;
  selected?: boolean;
  revealed?: boolean;
  voterName?: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SPECIAL_CARDS: PokerCardValue[] = ['∞', '?', '☕'];

export function PokerCard({
  value,
  selected = false,
  revealed = false,
  voterName,
  onClick,
  disabled = false,
  size = 'md',
}: Props) {
  const isSpecial = SPECIAL_CARDS.includes(value);

  const sizeClasses = {
    sm: 'h-14 w-10 text-base',
    md: 'h-20 w-14 text-2xl',
    lg: 'h-28 w-20 text-3xl',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        disabled={disabled}
        title={value === '∞' ? 'Bloqueador crítico' : value === '?' ? 'Precisa de Spike' : value === '☕' ? 'Pausa necessária' : `${value} pontos`}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 font-bold shadow-sm transition-all duration-200',
          sizeClasses[size],
          !disabled && 'cursor-pointer',
          selected
            ? 'scale-105 border-uzzai-primary bg-uzzai-primary/10 text-uzzai-primary shadow-md'
            : 'border-gray-300 bg-white text-gray-700 hover:border-uzzai-primary/60 hover:bg-uzzai-primary/5',
          isSpecial && !selected && 'border-yellow-300 bg-yellow-50 text-yellow-600',
          isSpecial && selected && 'border-yellow-500 bg-yellow-100 text-yellow-700',
          disabled && 'cursor-default opacity-70',
          revealed && 'border-uzzai-primary bg-uzzai-primary text-white'
        )}
      >
        {value}
      </button>
      {voterName && (
        <span className="max-w-[4rem] truncate text-center text-xs text-muted-foreground">
          {voterName}
        </span>
      )}
    </div>
  );
}
