import { MessageSquare } from 'lucide-react';
import { ProjectFeedbackContent } from '@/components/feedback/project-feedback-content';

export default async function ProjectFeedbackPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
          <MessageSquare className="h-5 w-5 text-indigo-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedbacks</h1>
          <p className="text-sm text-gray-500">
            Central de feedbacks enviados pelos usuarios do projeto.
          </p>
        </div>
      </div>
      <ProjectFeedbackContent projectId={projectId} />
    </div>
  );
}
