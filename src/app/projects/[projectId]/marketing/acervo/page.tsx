import { MarketingAssetsContent } from '@/components/marketing/marketing-assets-content';

export default async function MarketingAssetsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <MarketingAssetsContent projectId={projectId} />;
}
