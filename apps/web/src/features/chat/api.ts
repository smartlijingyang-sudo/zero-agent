const API_BASE = process.env["NEXT_PUBLIC_API_URL"] ?? "http://10.36.6.252:13000";

export async function createSession(): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  return res.json() as Promise<{ id: string }>;
}

export async function sendMessage(
  sessionId: string,
  content: string,
): Promise<void> {
  await fetch(`${API_BASE}/api/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}

export function subscribeToStream(
  sessionId: string,
  onEvent: (data: string, eventType: string) => void,
): EventSource {
  const es = new EventSource(`${API_BASE}/api/sessions/${sessionId}/stream`);

  const eventTypes = [
    "agent.protocol.token_delta",
    "agent.protocol.tool_call_started",
    "agent.protocol.tool_call_completed",
    "agent.protocol.step_started",
    "agent.protocol.step_completed",
    "agent.protocol.approval_requested",
    "agent.protocol.approval_resolved",
  ];

  for (const type of eventTypes) {
    es.addEventListener(type, (e) => {
      onEvent((e as MessageEvent).data, type);
    });
  }

  return es;
}
