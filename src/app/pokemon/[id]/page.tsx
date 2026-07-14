"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { getPokemonByNameOrId, getEvolutionChain } from "@/services";
import type { PokemonDetail, EvolutionChain, Stat } from "@/types";
import { useFavorites } from "@/lib/hooks";
import { formatPokemonId, capitalize, getTypeColor } from "@/lib/utils";

interface PokemonPageProps {
  params: Promise<{ id: string }>;
}

const STAT_COLORS: Record<string, string> = {
  hp: "bg-green-500",
  attack: "bg-red-500",
  defense: "bg-orange-500",
  "special-attack": "bg-blue-500",
  "special-defense": "bg-teal-500",
  speed: "bg-purple-500",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

function StatBar({ stat }: { stat: Stat }) {
  const maxStat = 255;
  const percentage = Math.min((stat.base / maxStat) * 100, 100);
  const color = STAT_COLORS[stat.name] ?? "bg-zinc-400";

  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-right text-sm font-medium text-zinc-600 dark:text-zinc-400">
        {STAT_LABELS[stat.name] ?? stat.name}
      </span>
      <span className="w-8 text-right text-sm font-semibold text-zinc-900 dark:text-white">
        {stat.base}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const bgColor = getTypeColor(type);
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase"
      style={{ backgroundColor: bgColor }}
    >
      {type}
    </span>
  );
}

function EvolutionSection({
  evolution,
  currentId,
}: {
  evolution: EvolutionChain | null;
  currentId: number;
}) {
  if (!evolution || evolution.stages.length <= 1) {
    return (
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        This Pokémon does not evolve.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {evolution.stages.map((stage, index) => (
        <div key={stage.id} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {stage.condition ?? "→"}
            </span>
          )}
          <Link
            href={`/pokemon/${stage.id}`}
            className={`flex flex-col items-center rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              stage.id === currentId
                ? "ring-2 ring-zinc-400 dark:ring-zinc-500"
                : ""
            }`}
          >
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.id}.png`}
              alt={stage.name}
              className="size-16 object-contain"
            />
            <span className="mt-1 text-xs text-zinc-700 capitalize dark:text-zinc-300">
              {capitalize(stage.name)}
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function PokemonPage({ params }: PokemonPageProps) {
  const { id } = use(params);
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [evolution, setEvolution] = useState<EvolutionChain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shiny, setShiny] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const detail = await getPokemonByNameOrId(id);
        setPokemon(detail);

        if (detail.evolutionChainId) {
          const evoChain = await getEvolutionChain(detail.evolutionChainId);
          setEvolution(evoChain);
        }
      } catch {
        setError("Pokémon not found.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-col items-center gap-4">
            <div className="size-48 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white">
          {error ?? "Pokémon not found"}
        </h1>
        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
          The Pokémon you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to Pokédex
        </Link>
      </div>
    );
  }

  const defaultSprite =
    pokemon.sprites.front_default
    ?? pokemon.sprites.other?.["official-artwork"]?.front_default
    ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  const sprite = shiny
    ? (pokemon.sprites.front_shiny ?? defaultSprite)
    : defaultSprite;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="size-4"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
            clipRule="evenodd"
          />
        </svg>
        Back
      </Link>

      <div className="flex flex-col items-center text-center">
        <p className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
          {formatPokemonId(pokemon.id)}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-zinc-900 capitalize dark:text-white">
          {capitalize(pokemon.name)}
        </h1>

        <div className="relative mt-4">
          <img
            src={sprite}
            alt={`${pokemon.name} sprite`}
            className="size-48 object-contain"
          />
          {pokemon.sprites.front_shiny && (
            <button
              type="button"
              onClick={() => setShiny((s) => !s)}
              className="absolute top-0 -right-2 rounded-full bg-zinc-100 p-1.5 text-xs font-medium text-zinc-600 shadow-sm transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              aria-label={shiny ? "Show normal sprite" : "Show shiny sprite"}
            >
              {shiny ? "★" : "☆"}
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {pokemon.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => toggleFavorite(pokemon.id)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          aria-label={
            isFavorite(pokemon.id) ? "Remove from favorites" : "Add to favorites"
          }
        >
          {isFavorite(pokemon.id) ? "★" : "☆"}
          <span className="text-zinc-700 dark:text-zinc-300">
            {isFavorite(pokemon.id) ? "Favorited" : "Favorite"}
          </span>
        </button>

        {pokemon.description && (
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {pokemon.description}
          </p>
        )}
      </div>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
            Stats
          </h2>
          <div className="space-y-2">
            {pokemon.stats.map((stat) => (
              <StatBar key={stat.name} stat={stat} />
            ))}
          </div>
        </section>

        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
              Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Height
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {(pokemon.height / 10).toFixed(1)} m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Weight
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {(pokemon.weight / 10).toFixed(1)} kg
                </span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
              Abilities
            </h2>
            <ul className="space-y-1">
              {pokemon.abilities.map((ability) => (
                <li
                  key={ability.name}
                  className="text-sm text-zinc-700 capitalize dark:text-zinc-300"
                >
                  {capitalize(ability.name.replace(/-/g, " "))}
                  {ability.isHidden && (
                    <span className="ml-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                      (hidden)
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-white">
          Evolution Chain
        </h2>
        <EvolutionSection evolution={evolution} currentId={pokemon.id} />
      </section>
    </div>
  );
}
