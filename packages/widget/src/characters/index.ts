import { bear } from './bear.js';
import { cat } from './cat.js';
import { dog } from './dog.js';
import { ghost } from './ghost.js';
import { robot } from './robot.js';
import type { Character, CharacterOptions } from './types.js';

const registry = new Map<string, Character>([cat, dog, bear, robot, ghost].map((c) => [c.id, c]));

/** Add your own character. See ./types.ts for the class names the widget animates. */
export function registerCharacter(c: Character) {
  registry.set(c.id, c);
}

export function getCharacter(id: string | null): Character {
  return (id && registry.get(id)) || cat;
}

let seq = 0;
/**
 * Renders a character with ids made unique, so several characters (or several widgets)
 * on one page never borrow each other's gradients.
 */
export function renderCharacter(c: Character, o: CharacterOptions): string {
  const tag = `-${(++seq).toString(36)}`;
  return c.render(o)
    .replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${id}${tag}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${id}${tag})`);
}

export function listCharacters(): Character[] {
  return [...registry.values()];
}

export { bear, cat, dog, ghost, robot };
export type { Character, CharacterOptions } from './types.js';
