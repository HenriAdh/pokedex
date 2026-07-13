interface PokemonPageProps {
  params: Promise<{ id: string }>;
}

export default async function PokemonPage({ params }: PokemonPageProps) {
  const { id } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold capitalize">#{id}</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Pokémon details will appear here.
      </p>
    </div>
  );
}
