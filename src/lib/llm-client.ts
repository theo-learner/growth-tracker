/**
 * Unified LLM client
 *
 * 우선순위:
 *   1. LiteLLM proxy  (LITELLM_API_BASE 설정 시)
 *   2. Anthropic 직접 (ANTHROPIC_API_KEY 설정 시)
 *   3. null → 호출부에서 프리셋 fallback
 *
 * 환경변수:
 *   LITELLM_API_BASE  — 프록시 주소 (예: http://localhost:4000)
 *   LITELLM_API_KEY   — 프록시 API 키 (없으면 인증 생략)
 *   LLM_MODEL         — 모델 오버라이드 (없으면 defaultModel 사용)
 *   ANTHROPIC_API_KEY — Anthropic 직접 호출 키
 */
export async function callLLM(
  prompt: string,
  defaultModel: string,
  maxTokens = 1024,
): Promise<string | null> {
  const litellmBase = process.env.LITELLM_API_BASE;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.LLM_MODEL ?? defaultModel;

  if (litellmBase) {
    return callOpenAICompat(
      litellmBase,
      process.env.LITELLM_API_KEY ?? "",
      model,
      prompt,
      maxTokens,
    );
  }

  if (anthropicKey) {
    return callAnthropic(anthropicKey, model, prompt, maxTokens);
  }

  return null;
}

async function callOpenAICompat(
  base: string,
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const res = await fetch(`${base.replace(/\/$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.choices?.[0]?.message?.content as string) ?? null;
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
  maxTokens: number,
): Promise<string | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.content?.[0]?.text as string) ?? null;
}
