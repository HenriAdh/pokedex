"use client";

import { usePokemonCry } from "@/lib/hooks";
import { capitalize } from "@/lib/utils";

interface SoundButtonProps {
  url: string | null;
  pokemonName: string;
}

export function SoundButton({ url, pokemonName }: SoundButtonProps) {
  const { isPlaying, isLoading, error, toggle } = usePokemonCry({ url });

  if (!url) return null;

  const name = capitalize(pokemonName);

  const label = isPlaying
    ? "Parar som"
    : error
      ? "Som indisponível"
      : `Ouvir som do ${name}`;

  const statusMessage = isPlaying
    ? `Tocando som do ${name}`
    : error
      ? `Som indisponível para ${name}`
      : "";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isLoading}
      aria-pressed={isPlaying}
      aria-label={label}
      title={label}
      className="relative inline-flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
    >
      <span className="sr-only" role="status" aria-live="polite">
        {statusMessage}
      </span>
      {isLoading ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-5 animate-pulse"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5L6 9H2v6h4l5 4V5z"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5L6 9H2v6h4l5 4V5z"
          />
          {isPlaying && (
            <>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.54 8.46a5 5 0 010 7.07"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.07 4.93a10 10 0 010 14.14"
              />
            </>
          )}
          {error && !isPlaying && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 6L6 18M6 6l12 12"
            />
          )}
        </svg>
      )}
    </button>
  );
}
