import { createAiState, type AnalyzeDeps } from './analyze';
const state = createAiState();
export function serverDeps(): AnalyzeDeps {
  return { state, key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL,
    dailyLimit: process.env.AI_DAILY_LIMIT === undefined ? 300 : Number(process.env.AI_DAILY_LIMIT),
    log: (entry) => console.info(JSON.stringify(entry)) };
}
