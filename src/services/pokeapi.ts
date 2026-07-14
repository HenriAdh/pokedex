import type {
  PokemonListItem,
  PokemonDetail,
  Stat,
  Ability,
  EvolutionChain,
  EvolutionStage,
} from "@/types";

const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

export const PAGE_LIMIT = 20;
export const CACHE_REVALIDATE = 3600;

interface PokemonAPIResult {
  name: string;
  url: string;
}

interface PokemonListAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonAPIResult[];
}

interface PokemonTypeAPI {
  slot: number;
  type: { name: string; url: string };
}

interface PokemonStatAPI {
  base_stat: number;
  effort: number;
  stat: { name: string; url: string };
}

interface PokemonAbilityAPI {
  ability: { name: string; url: string };
  is_hidden: boolean;
  slot: number;
}

interface PokemonSpritesAPI {
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

interface PokemonCriesAPI {
  latest: string;
  legacy: string;
}

interface PokemonAPIResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeAPI[];
  stats: PokemonStatAPI[];
  abilities: PokemonAbilityAPI[];
  sprites: PokemonSpritesAPI;
  cries: PokemonCriesAPI;
}

interface PokemonSpeciesAPIResponse {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  evolution_chain: {
    url: string;
  };
}

interface EvolutionDetailAPI {
  min_level: number | null;
  item: { name: string; url: string } | null;
  trigger: { name: string; url: string };
}

interface ChainLinkAPI {
  species: { name: string; url: string };
  evolves_to: ChainLinkAPI[];
  evolution_details: EvolutionDetailAPI[];
}

interface EvolutionChainAPIResponse {
  id: number;
  chain: ChainLinkAPI;
}

interface TypeAPIResponse {
  pokemon: Array<{
    pokemon: PokemonAPIResult;
    slot: number;
  }>;
}

function getIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return Number(parts[parts.length - 1]);
}

function buildSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function mapPokemonListResult(result: PokemonAPIResult): PokemonListItem {
  const id = getIdFromUrl(result.url);
  return {
    id,
    name: result.name,
    sprite: buildSpriteUrl(id),
  };
}

function mapPokemonDetail(
  data: PokemonAPIResponse,
  description: string,
  evolutionChainId: number | null,
): PokemonDetail {
  return {
    id: data.id,
    name: data.name,
    height: data.height,
    weight: data.weight,
    types: data.types.map((t) => t.type.name as PokemonDetail["types"][number]),
    stats: data.stats.map(
      (s): Stat => ({
        name: s.stat.name as Stat["name"],
        base: s.base_stat,
      }),
    ),
    abilities: data.abilities.map(
      (a): Ability => ({
        name: a.ability.name,
        isHidden: a.is_hidden,
      }),
    ),
    sprites: data.sprites,
    cries: data.cries,
    description,
    evolutionChainId,
  };
}

function traverseEvolutionChain(
  link: ChainLinkAPI,
): EvolutionStage[] {
  const stages: EvolutionStage[] = [];

  function walk(node: ChainLinkAPI, parentCondition: string | null): void {
    const id = getIdFromUrl(node.species.url);
    const detail = node.evolution_details[0];
    let condition: string | null = parentCondition;

    if (detail) {
      if (detail.min_level !== null) {
        condition = `Level ${detail.min_level}`;
      } else if (detail.item) {
        condition = `Use ${detail.item.name.replace(/-/g, " ")}`;
      } else if (detail.trigger) {
        condition = detail.trigger.name.replace(/-/g, " ");
      }
    }

    stages.push({ id, name: node.species.name, condition });

    for (const child of node.evolves_to) {
      walk(child, null);
    }
  }

  walk(link, null);
  return stages;
}

async function pokeapiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${POKEAPI_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    next: { revalidate: CACHE_REVALIDATE },
  });

  if (!res.ok) {
    throw new Error(`PokeAPI request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export async function getPokemonList(
  limit: number = PAGE_LIMIT,
  offset: number = 0,
): Promise<{ pokemon: PokemonListItem[]; count: number }> {
  const data = await pokeapiFetch<PokemonListAPIResponse>(
    `/pokemon?limit=${limit}&offset=${offset}`,
  );

  return {
    pokemon: data.results.map(mapPokemonListResult),
    count: data.count,
  };
}

export async function getPokemonByNameOrId(
  name: string | number,
): Promise<PokemonDetail> {
  const data = await pokeapiFetch<PokemonAPIResponse>(`/pokemon/${name}`);

  const speciesData = await getPokemonSpecies(data.id);

  return mapPokemonDetail(data, speciesData.description, speciesData.evolutionChainId);
}

export async function getPokemonSpecies(
  id: number,
): Promise<{ description: string; evolutionChainId: number | null }> {
  const data = await pokeapiFetch<PokemonSpeciesAPIResponse>(
    `/pokemon-species/${id}`,
  );

  const entry = data.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );

  const description = entry
    ? entry.flavor_text.replace(/[\n\f]/g, " ")
    : "";

  let evolutionChainId: number | null = null;
  if (data.evolution_chain?.url) {
    evolutionChainId = getIdFromUrl(data.evolution_chain.url);
  }

  return { description, evolutionChainId };
}

export async function getEvolutionChain(
  id: number,
): Promise<EvolutionChain> {
  const data = await pokeapiFetch<EvolutionChainAPIResponse>(
    `/evolution-chain/${id}`,
  );

  return {
    stages: traverseEvolutionChain(data.chain),
  };
}

export async function getPokemonByType(
  type: string,
): Promise<PokemonListItem[]> {
  const data = await pokeapiFetch<TypeAPIResponse>(`/type/${type}`);

  return data.pokemon.map((entry) => ({
    id: getIdFromUrl(entry.pokemon.url),
    name: entry.pokemon.name,
    sprite: buildSpriteUrl(getIdFromUrl(entry.pokemon.url)),
  }));
}
