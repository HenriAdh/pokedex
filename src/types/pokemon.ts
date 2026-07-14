export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type StatName =
  | "hp"
  | "attack"
  | "defense"
  | "special-attack"
  | "special-defense"
  | "speed";

export interface PokemonListItem {
  id: number;
  name: string;
  sprite: string;
}

export interface Sprites {
  front_default: string | null;
  front_shiny: string | null;
  back_default: string | null;
  back_shiny: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
    };
  };
}

export interface Stat {
  name: StatName;
  base: number;
}

export interface Ability {
  name: string;
  isHidden: boolean;
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonType[];
  stats: Stat[];
  abilities: Ability[];
  sprites: Sprites;
  description: string;
  evolutionChainId: number | null;
}

export interface EvolutionStage {
  id: number;
  name: string;
  condition: string | null;
}

export interface EvolutionChain {
  stages: EvolutionStage[];
}

export interface FavoritesState {
  ids: number[];
}
