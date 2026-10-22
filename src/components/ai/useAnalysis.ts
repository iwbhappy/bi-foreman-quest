import { useCallback, useEffect, useState } from 'react';
import { aiAvailable, demoAnalysis, readAnalysis, requestAnalysis } from '../../lib/aiClient';
import type { AnalyzeResponse } from '../../lib/aiTypes';
import type { ResultRecord } from '../../lib/types';

type Status = 'checking' | 'hidden' | 'idle' | 'loading' | 'ready' | 'error';
interface State { status: Status; response?: AnalyzeResponse; demo?: boolean; error?: string }
export function useAnalysis(record: ResultRecord, automatic: boolean) {
  const [state, setState] = useState<State>(() => {
    const demo = demoAnalysis(record.id);
    return demo ? { status: 'ready', response: demo, demo: true } : { status: 'checking' };
  });
  const prepare = useCallback(async (force = false) => {
    setState({ status: 'loading' });
    try {
      if (!await aiAvailable()) { setState({ status: 'hidden' }); return; }
      const response = await requestAnalysis(record, force);
      setState({ status: 'ready', response });
    } catch (error) {
      setState({ status: 'error', error: error instanceof Error ? error.message : undefined });
    }
  }, [record]);
  useEffect(() => {
    let active = true;
    const demo = demoAnalysis(record.id);
    if (demo) { setState({ status: 'ready', response: demo, demo: true }); return; }
    void (async () => {
      try {
        if (!await aiAvailable()) { if (active) setState({ status: 'hidden' }); return; }
        const cached = readAnalysis(record.id);
        if (cached) { if (active) setState({ status: 'ready', response: cached }); return; }
        if (!automatic) { if (active) setState({ status: 'idle' }); return; }
        if (active) setState({ status: 'loading' });
        const response = await requestAnalysis(record);
        if (active) setState({ status: 'ready', response });
      } catch (error) {
        if (active) setState({ status: 'error', error: error instanceof Error ? error.message : undefined });
      }
    })();
    return () => { active = false; };
  }, [record, automatic]);
  return { ...state, prepare };
}
