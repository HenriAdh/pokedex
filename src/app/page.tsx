"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getPokemonList, getPokemonByType, PAGE_LIMIT } from "@/services";
import type { PokemonListItem, PokemonType } from "@/types";
import { useDebounce } from "@/lib/hooks";
import { PokemonCard, PokemonGrid } from "@/components/pokemon";
import { SearchBar, TypeFilter, Pagination, SkeletonCard } from "@/components/ui";

const ALL_LIMIT = 2000;

export default function HomePage() {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [typePokemon, setTypePokemon] = useState<PokemonListItem[] | null>(null);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<PokemonType | "">("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeLoading, setTypeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      try {
        const result = await getPokemonList(ALL_LIMIT, 0);
        setAllPokemon(result.pokemon);
      } catch {
        setError("Failed to load Pokémon.");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => {
    if (!selectedType) return;

    async function fetchByType() {
      setTypeLoading(true);
      setError(null);
      try {
        const result = await getPokemonByType(selectedType);
        setTypePokemon(result);
      } catch {
        setError(`Failed to load ${selectedType} type Pokémon.`);
      } finally {
        setTypeLoading(false);
      }
    }
    fetchByType();
  }, [selectedType]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleTypeChange = useCallback((type: PokemonType | "") => {
    setSelectedType(type);
    setTypePokemon(null);
    setPage(1);
  }, []);

  const filteredPokemon = useMemo(() => {
    const list = selectedType ? (typePokemon ?? []) : allPokemon;
    if (!debouncedSearch) return list;
    const query = debouncedSearch.toLowerCase();
    return list.filter((p) => p.name.includes(query));
  }, [selectedType, typePokemon, allPokemon, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / PAGE_LIMIT));
  const safePage = Math.min(page, totalPages);

  const displayedPokemon = useMemo(() => {
    const start = (safePage - 1) * PAGE_LIMIT;
    return filteredPokemon.slice(start, start + PAGE_LIMIT);
  }, [filteredPokemon, safePage]);

  const isLoading = loading || typeLoading;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 space-y-4">
        <SearchBar value={search} onChange={handleSearchChange} />
        <TypeFilter selected={selectedType} onChange={handleTypeChange} />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <PokemonGrid>
          {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </PokemonGrid>
      ) : displayedPokemon.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium text-zinc-900 dark:text-white">
            No Pokémon found
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Try a different search term or type filter.
          </p>
        </div>
      ) : (
        <>
          <PokemonGrid>
            {displayedPokemon.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </PokemonGrid>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
