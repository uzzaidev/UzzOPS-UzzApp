'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DailyLogModal } from './daily-log-modal';
import { DailyLogsTimeline } from './daily-logs-timeline';

interface Props {
  projectId: string;
}

export function DailyPageContent({ projectId }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Daily
        </Button>
      </div>

      <DailyLogsTimeline projectId={projectId} />

      <DailyLogModal
        projectId={projectId}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
