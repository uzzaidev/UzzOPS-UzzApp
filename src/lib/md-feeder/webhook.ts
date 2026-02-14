type ImportWebhookPayload = {
  import_id: string;
  parse_status: string;
  items_created: number;
  items_updated: number;
  items_skipped: number;
  items_failed: number;
  project_id: string | null;
  tenant_id: string;
  source: string;
  completed_at: string;
};

export async function sendMdFeederWebhook(payload: ImportWebhookPayload) {
  const url = process.env.MD_FEEDER_WEBHOOK_URL;
  if (!url) return { sent: false as const, reason: 'missing_url' as const };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-MD-Feeder-Event': 'import.completed',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    return {
      sent: response.ok,
      status: response.status,
    };
  } catch {
    return { sent: false as const, reason: 'network_error' as const };
  } finally {
    clearTimeout(timeout);
  }
}
