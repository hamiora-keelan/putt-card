export type Player = {
  id: string;
  name: string;
};

export type ScoreState = {
  players: Player[];
  scores: {
    [holeIndex: number]: {
      [playerId: string]: number | undefined;
    };
  };
  createdAt: string;
};

const STORAGE_PREFIX = "minicard:";

const storageKey = (courseSlug: string) => `${STORAGE_PREFIX}${courseSlug}`;

const getStorage = () => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export function storageAvailable() {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const probeKey = `${STORAGE_PREFIX}__probe`;
    storage.setItem(probeKey, "1");
    storage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function loadState(courseSlug: string): ScoreState | null {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(storageKey(courseSlug));
    if (!raw) return null;
    return JSON.parse(raw) as ScoreState;
  } catch (err) {
    console.warn("Failed to load score state", err);
    return null;
  }
}

export function saveState(courseSlug: string, state: ScoreState) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey(courseSlug), JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save score state", err);
  }
}

export function clearState(courseSlug: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(storageKey(courseSlug));
  } catch (err) {
    console.warn("Failed to clear score state", err);
  }
}

export function createInitialState(players: Player[], holes: number): ScoreState {
  const scores: ScoreState["scores"] = {};
  for (let i = 0; i < holes; i += 1) {
    scores[i] = {};
  }
  return {
    players,
    scores,
    createdAt: new Date().toISOString()
  };
}
