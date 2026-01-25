/**
 * Fighter Database Module
 * Defines the base roster for the No_Gas_Slaps™ loop state.
 */

const FIGHTER_DATABASE = [
  {
    id: 'nova-flux',
    name: 'Nova Flux',
    role: 'Host',
    tagline: 'Energy Catalyst',
    level: 1,
    xp: 0,
    stats: {
      power: 8,
      defense: 6,
      speed: 7,
      stamina: 9
    }
  },
  {
    id: 'dj-mythos',
    name: 'DJ Mythos',
    role: 'Support',
    tagline: 'Sound Surgeon',
    level: 1,
    xp: 0,
    stats: {
      power: 5,
      defense: 7,
      speed: 8,
      stamina: 8
    }
  },
  {
    id: 'captain-fringe',
    name: 'Captain Fringe',
    role: 'Challenger',
    tagline: 'Glitch Broker',
    level: 1,
    xp: 0,
    stats: {
      power: 7,
      defense: 5,
      speed: 6,
      stamina: 7
    }
  },
  {
    id: 'solstice-hex',
    name: 'Solstice Hex',
    role: 'Strategist',
    tagline: 'Quantum Tactician',
    level: 1,
    xp: 0,
    stats: {
      power: 6,
      defense: 8,
      speed: 5,
      stamina: 7
    }
  },
  {
    id: 'ember-vale',
    name: 'Ember Vale',
    role: 'Vanguard',
    tagline: 'Forge Keeper',
    level: 1,
    xp: 0,
    stats: {
      power: 9,
      defense: 6,
      speed: 5,
      stamina: 6
    }
  },
  {
    id: 'atlas-prism',
    name: 'Atlas Prism',
    role: 'Analyst',
    tagline: 'Signal Cartographer',
    level: 1,
    xp: 0,
    stats: {
      power: 6,
      defense: 7,
      speed: 6,
      stamina: 8
    }
  }
];

const cloneValue = (value) => JSON.parse(JSON.stringify(value));

export function getFighterDatabase() {
  return cloneValue(FIGHTER_DATABASE);
}

export function normalizeFighterRoster(roster) {
  const baseRoster = getFighterDatabase();

  if (!Array.isArray(roster)) {
    return baseRoster;
  }

  const rosterById = new Map(
    roster
      .filter((fighter) => fighter && typeof fighter === 'object' && fighter.id)
      .map((fighter) => [fighter.id, fighter])
  );

  return baseRoster.map((fighter) => {
    const saved = rosterById.get(fighter.id);
    if (!saved) {
      return fighter;
    }

    const mergedStats =
      saved.stats && typeof saved.stats === 'object'
        ? { ...fighter.stats, ...saved.stats }
        : fighter.stats;

    return {
      ...fighter,
      ...saved,
      stats: mergedStats
    };
  });
}
