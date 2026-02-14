import { MarketingImportHistoryContent } from './marketing-import-history-content';

export default async function ProjectImportHistoryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <MarketingImportHistoryContent projectId={projectId} />;
}

