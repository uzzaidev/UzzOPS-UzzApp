import { MarketingContentDetail } from '@/components/marketing/marketing-content-detail';

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  return <MarketingContentDetail projectId={projectId} contentId={id} />;
}
