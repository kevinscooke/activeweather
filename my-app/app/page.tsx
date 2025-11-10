import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-6 py-12 text-center text-slate-100">
      <h1 className="text-4xl font-bold sm:text-5xl">Active Fly Fishing</h1>
      <p className="mt-4 max-w-xl text-lg text-slate-300">
        Discover expert tips, gear guides, and destination spotlights tailored for anglers who never stop exploring.
      </p>
      <Link
        href="/weather"
        className="mt-8 rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-emerald-400"
      >
        Proceed to the next page
      </Link>
    </main>
  );
}
