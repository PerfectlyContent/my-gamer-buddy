import { BASE_SYSTEM_PROMPT, NO_GAME_SELECTED_PROMPT } from './base';
import { FORTNITE_PROMPT } from './fortnite';
import { COD_PROMPT } from './cod';
import { GTA_PROMPT } from './gta';
import { VALORANT_PROMPT } from './valorant';
import { MINECRAFT_PROMPT } from './minecraft';
import { APEX_PROMPT } from './apex';
import { ELDEN_RING_PROMPT } from './eldenring';
import { LOL_PROMPT } from './lol';
import { ZELDA_PROMPT } from './zelda';
import { RAINBOW_SIX_PROMPT } from './rainbow-six';
import { RDR2_PROMPT } from './rdr2';

const gamePrompts: Record<string, string> = {
  fortnite: FORTNITE_PROMPT,
  cod: COD_PROMPT,
  gta: GTA_PROMPT,
  valorant: VALORANT_PROMPT,
  minecraft: MINECRAFT_PROMPT,
  apex: APEX_PROMPT,
  'elden-ring': ELDEN_RING_PROMPT,
  lol: LOL_PROMPT,
  zelda: ZELDA_PROMPT,
  'rainbow-six': RAINBOW_SIX_PROMPT,
  rdr2: RDR2_PROMPT,
};

export function getSystemPrompt(gameSlug?: string): string {
  const gameSpecific = gameSlug ? gamePrompts[gameSlug] : null;
  const contextPrompt = gameSpecific || NO_GAME_SELECTED_PROMPT;
  return `${BASE_SYSTEM_PROMPT}\n\n${contextPrompt}`;
}

export { gamePrompts };
