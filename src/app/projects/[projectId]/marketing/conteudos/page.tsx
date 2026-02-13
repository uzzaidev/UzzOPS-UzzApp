import { MarketingContentBoard } from '@/components/marketing/marketing-content-board';

export default async function MarketingContentPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <MarketingContentBoard projectId={projectId} />;
}
