import { BRAND } from "@/config/brand";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight">{BRAND.name}</h1>
      <p className="mt-4 text-zinc-600">{BRAND.tagline}</p>
    </main>
  );
}
