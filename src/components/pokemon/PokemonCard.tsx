import Link from "next/link";
import type { PokemonListItem } from "@/types";
import { formatPokemonId, capitalize } from "@/lib/utils";

interface PokemonCardProps {
  pokemon: PokemonListItem;
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="mb-3 flex items-center justify-center">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="size-24 object-contain transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
        {formatPokemonId(pokemon.id)}
      </p>
      <p className="text-sm font-semibold text-zinc-900 capitalize dark:text-white">
        {capitalize(pokemon.name)}
      </p>
    </Link>
  );
}
