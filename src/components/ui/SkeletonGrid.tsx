import { PAGE_LIMIT } from "@/services";
import { PokemonGrid } from "@/components/pokemon";
import { SkeletonCard } from "./SkeletonCard";

export function SkeletonGrid() {
  return (
    <PokemonGrid>
      {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </PokemonGrid>
  );
}
