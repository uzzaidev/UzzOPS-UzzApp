'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useUpdateFeature } from '@/hooks/useFeatures';
import type { INVESTChecklist, Feature } from '@/types';

interface Props {
  feature: Feature;
  readOnly?: boolean;
}

const INVEST_ITEMS: {
  key: keyof INVESTChecklist;
  letter: string;
  label: string;
  description: string;
  autoComputed?: boolean;
}[] = [
  {
    key: 'independent',
    letter: 'I',
    label: 'ndependent',
    description: 'Não depende de múltiplas outras histórias para ser entregue',
  },
  {
    key: 'negotiable',
    letter: 'N',
    label: 'egotiable',
    description: 'A implementação é flexível, não é um contrato rígido',
  },
  {
    key: 'valuable',
    letter: 'V',
    label: 'aluable',
    description: 'Entrega valor real ao usuário ou ao negócio',
  },
  {
    key: 'estimable',
    letter: 'E',
    label: 'stimable',
    description: 'O time consegue estimar o esforço necessário',
  },
  {
    key: 'small',
    letter: 'S',
    label: 'mall',
    description: '≤ 13 story points — cabe em um sprint',
    autoComputed: true,
  },
  {
    key: 'testable',
    letter: 'T',
    label: 'estable',
    description: 'Tem critérios de aceitação claros e verificáveis',
    autoComputed: true,
  },
];

export function INVESTValidator({ feature, readOnly = false }: Props) {
  const updateFeature = useUpdateFeature();

  const computeInitial = (): INVESTChecklist => {
    const saved = feature.invest_checklist as INVESTChecklist | null | undefined;
    return {
      independent: saved?.independent ?? null,
      negotiable: saved?.negotiable ?? null,
      valuable: saved?.valuable ?? null,
      estimable: saved?.estimable ?? null,
      small: (feature.story_points ?? 0) <= 13 && feature.story_points !== null,
      testable: !!feature.acceptance_criteria,
    };
  };

  const [checklist, setChecklist] = useState<INVESTChecklist>(computeInitial);

  // Re-compute auto fields when feature changes
  useEffect(() => {
    setChecklist((prev) => ({
      ...prev,
      small: (feature.story_points ?? 0) <= 13 && feature.story_points !== null,
      testable: !!feature.acceptance_criteria,
    }));
  }, [feature.story_points, feature.acceptance_criteria]);

  const score = Object.values(checklist).filter((v) => v === true).length;
  const criticalPassed = checklist.small === true && checklist.testable === true;
  const passed = score >= 5 && criticalPassed;

  const handleChange = async (key: keyof INVESTChecklist, value: boolean) => {
    if (readOnly) return;
    const newChecklist = { ...checklist, [key]: value };
    setChecklist(newChecklist);
    await updateFeature.mutateAsync({
      id: feature.id,
      data: { invest_checklist: newChecklist as Record<string, boolean | null> },
    });
  };

  const scoreColor =
    score >= 5 && criticalPassed
      ? 'bg-green-100 text-green-700 border-green-300'
      : score >= 4
        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
        : 'bg-red-100 text-red-700 border-red-300';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Validação INVEST</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={scoreColor}>
              {score}/6
            </Badge>
            {passed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </div>
        </div>
        {!passed && (
          <p className="text-xs text-muted-foreground mt-1">
            {!criticalPassed
              ? 'S (Small) e T (Testable) são obrigatórios para entrar no sprint.'
              : 'Feature precisa de pelo menos 5/6 para entrar no sprint.'}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {INVEST_ITEMS.map((item) => {
            const value = checklist[item.key];
            const isDisabled = readOnly || item.autoComputed;

            return (
              <div key={item.key} className="flex items-start gap-3">
                <Checkbox
                  id={`invest-${item.key}`}
                  checked={value === true}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => handleChange(item.key, !!checked)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`invest-${item.key}`}
                  className={`leading-tight cursor-pointer ${isDisabled ? 'cursor-default' : ''}`}
                >
                  <span className="font-bold text-uzzai-primary">{item.letter}</span>
                  {item.label}
                  {item.autoComputed && (
                    <span className="ml-1.5 text-xs text-muted-foreground">(auto)</span>
                  )}
                  <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {item.description}
                  </p>
                  {item.key === 'small' && !checklist.small && feature.story_points && (
                    <p className="text-xs font-medium text-red-500">
                      Atual: {feature.story_points} pts (máx. 13)
                    </p>
                  )}
                  {item.key === 'testable' && !checklist.testable && (
                    <p className="text-xs font-medium text-amber-600">
                      Adicione critérios de aceitação
                    </p>
                  )}
                </Label>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
