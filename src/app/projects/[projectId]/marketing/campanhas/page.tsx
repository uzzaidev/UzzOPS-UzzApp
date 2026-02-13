import { MarketingCampaignsContent } from '@/components/marketing/marketing-campaigns-content';

export default async function MarketingCampaignsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <MarketingCampaignsContent projectId={projectId} />;
}
