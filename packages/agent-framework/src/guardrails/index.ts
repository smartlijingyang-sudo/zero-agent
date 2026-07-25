export interface GuardrailResult {
  tripwireTriggered: boolean;
  reason?: string;
}

export interface Guardrail {
  name: string;
  checkInput?(input: unknown): Promise<GuardrailResult>;
  checkOutput?(output: unknown): Promise<GuardrailResult>;
}
