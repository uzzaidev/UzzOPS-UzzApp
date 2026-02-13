'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EyeOff } from 'lucide-react';
import { useStealthMode } from '@/lib/stealth-mode';

export function StealthModeToggle() {
  const { isEnabled, toggle } = useStealthMode();

  return (
    <div className="flex items-center gap-2">
      {isEnabled && (
        <Badge variant="secondary" className="gap-1 bg-orange-100 text-orange-700 border-orange-200">
          <EyeOff className="h-3 w-3" />
          Stealth ON
        </Badge>
      )}
      <div className="flex items-center gap-2">
        <Switch
          id="stealth-mode"
          checked={isEnabled}
          onCheckedChange={toggle}
        />
        <Label htmlFor="stealth-mode" className="cursor-pointer text-sm">
          Stealth Mode
        </Label>
      </div>
    </div>
  );
}
