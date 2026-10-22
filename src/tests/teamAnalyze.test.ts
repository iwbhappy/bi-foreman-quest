import { expect, it, vi } from 'vitest';
import { handleTeamAnalyze } from '../../server/team-analyze';
import { createAiState } from '../../server/analyze';
import { buildDemoTeam, latestProfiles } from '../lib/team';
import { teamAnalysisInput } from '../lib/teamAi';
import demo from '../data/demoTeamAnalysis.json';
import { validTeamAnalysis } from '../lib/aiTypes';

it('checks team ranges, enum fields, names and the 30-member limit before sending any request', async () => {
  const input = teamAnalysisInput(latestProfiles(buildDemoTeam()));
  const fetcher = vi.fn<typeof fetch>();
  const deps = { state: createAiState(), key: 'unit-test-key', fetch: fetcher };
  const member = input.members[0];
  for (const body of [{ members: [] }, { members: Array(31).fill(member) },
    { members: [{ ...member, name: 'Do not send this name' }] },
    { members: [{ ...member, percents: { ...member.percents, critical: 101 } }] },
    { members: [{ ...member, position: 'injected instructions' }] },
    { members: [{ ...member, archetype: 'injected instructions' }] }]) {
    expect((await handleTeamAnalyze(body, deps)).status).toBe(400);
  }
  expect(fetcher).not.toHaveBeenCalled();
});
it('precomputes all demo analyses with the expected schema and no names in team payloads', async () => {
  const records = latestProfiles(buildDemoTeam());
  const input = teamAnalysisInput(records);
  for (const record of records) expect(JSON.stringify(input)).not.toContain(record.participant.name);
  expect('analysis' in demo && validTeamAnalysis(demo.analysis)).toBe(true);
  const fetcher = vi.fn<typeof fetch>(async () => Response.json({ choices: [
    { message: { content: JSON.stringify('analysis' in demo ? demo.analysis : {}) } },
  ] }));
  const deps = { state: createAiState(), key: 'unit-test-key', fetch: fetcher };
  expect((await handleTeamAnalyze(input, deps)).status).toBe(200);
  expect((await handleTeamAnalyze(input, deps)).status).toBe(200);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
