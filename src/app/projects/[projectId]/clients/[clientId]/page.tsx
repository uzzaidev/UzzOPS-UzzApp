import { ClientDetailsContent } from '@/components/clients/client-details-content';

export default async function ClientDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string; clientId: string }>;
}) {
  const { projectId, clientId } = await params;
  return <ClientDetailsContent projectId={projectId} clientId={clientId} />;
}

