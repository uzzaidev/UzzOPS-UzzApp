'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpdateFeature } from '@/hooks/useFeatures';

interface Props {
  featureId: string;
  isMvp: boolean;
  onToggle?: (newValue: boolean) => void;
}

export function MvpToggle({ featureId, isMvp, onToggle }: Props) {
  const [optimistic, setOptimistic] = useState(isMvp);
  const updateFeature = useUpdateFeature();

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = !optimistic;
    setOptimistic(newValue);
    try {
      await updateFeature.mutateAsync({ id: featureId, data: { is_mvp: newValue } });
      onToggle?.(newValue);
    } catch {
      setOptimistic(!newValue);
    }
  };

  return (
    <button
      onClick={handleToggle}
      title={optimistic ? 'Remover flag MVP' : 'Marcar como MVP'}
      className={cn(
        'rounded p-1 transition-colors',
        optimistic
          ? 'text-yellow-500 hover:text-yellow-600'
          : 'text-gray-300 hover:text-yellow-400'
      )}
    >
      <Star className={cn('h-4 w-4', optimistic && 'fill-current')} />
    </button>
  );
}
