"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
        />
      </svg>
      <input
        type="search"
        placeholder="Search Pokémon..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white py-2 pr-4 pl-10 text-sm placeholder-zinc-400 transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder-zinc-500 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
      />
    </div>
  );
}
