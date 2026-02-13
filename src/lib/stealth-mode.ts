'use client';

import { useState, useEffect } from 'react';

export function useStealthMode() {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('stealth-mode');
    setIsEnabled(stored === 'true');
  }, []);

  const toggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    sessionStorage.setItem('stealth-mode', String(newValue));
  };

  return { isEnabled, toggle };
}

export function obfuscateText(
  text: string,
  type: 'feature' | 'client' | 'money',
  index: number = 0
): string {
  if (type === 'feature') return `Feature ${String.fromCharCode(65 + (index % 26))}`;
  if (type === 'client') return `Client ${index + 1}`;
  if (type === 'money') return '$ XXX';
  return text;
}
