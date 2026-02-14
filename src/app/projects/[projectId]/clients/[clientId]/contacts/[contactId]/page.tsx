import { ContactDetailContent } from '@/components/clients/contact-detail-content';

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; clientId: string; contactId: string }>;
}) {
  const { projectId, clientId, contactId } = await params;
  return <ContactDetailContent projectId={projectId} clientId={clientId} contactId={contactId} />;
}

