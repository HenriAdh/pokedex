import type { PokemonType } from "@/types";
import { getTypeColor, capitalize } from "@/lib/utils";

interface TypeBadgeProps {
  type: PokemonType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white shadow-sm"
      style={{ backgroundColor: getTypeColor(type) }}
    >
      {capitalize(type)}
    </span>
  );
}
