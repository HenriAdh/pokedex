"use client";

import { POKEMON_TYPES, type PokemonType } from "@/types";
import { getTypeColor, capitalize } from "@/lib/utils";

interface TypeFilterProps {
  selected: PokemonType | "";
  onChange: (type: PokemonType | "") => void;
}

export function TypeFilter({ selected, onChange }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("")}
        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          selected === ""
            ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
        }`}
      >
        All
      </button>
      {POKEMON_TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type)}
          style={{ backgroundColor: getTypeColor(type) }}
          className={`rounded-full px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:scale-105 ${
            selected === type
              ? "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-950"
              : "opacity-70 hover:opacity-100"
          }`}
        >
          {capitalize(type)}
        </button>
      ))}
    </div>
  );
}
