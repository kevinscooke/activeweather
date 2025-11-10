import type { Metadata } from "next";
import Link from "next/link";
import Header from "./components/header";

export const metadata: Metadata = {
  title: "Real-Time Trout Conditions for North Carolina | Active Fly Fishing",
  description: "Live flows, water temps, wind, and 7–90 day trends—plus access notes and seasonal hatches for every major trout stream.",
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900">
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center text-slate-100 sm:py-16">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Real-Time Trout Conditions for North Carolina
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300 sm:text-xl">
              Live flows, water temps, wind, and 7–90 day trends—plus access notes and seasonal hatches for every major trout stream.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/ararat-river-weather-river-gauge"
              className="inline-block rounded-full bg-emerald-500 px-8 py-4 text-base font-semibold text-slate-900 transition hover:bg-emerald-400 sm:text-lg"
            >
              View NC Rivers
            </Link>
            <Link
              href="#"
              className="inline-block rounded-full border-2 border-emerald-500 bg-transparent px-8 py-4 text-base font-semibold text-emerald-500 transition hover:bg-emerald-500/10 sm:text-lg"
            >
              Set Flow/Temp Alerts
            </Link>
            <Link
              href="#"
              className="inline-block rounded-full border-2 border-emerald-500 bg-transparent px-8 py-4 text-base font-semibold text-emerald-500 transition hover:bg-emerald-500/10 sm:text-lg"
            >
              Learn How to Read Gauges
            </Link>
          </div>

          {/* Fly Fishing North Carolina Content Section */}
          <section className="mt-16 rounded-3xl bg-white/10 px-5 py-6 backdrop-blur-sm sm:px-8 sm:py-10">
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              <h2 className="text-2xl font-semibold text-slate-100 sm:text-3xl">
                Fly Fishing North Carolina
              </h2>
              <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                North Carolina&apos;s blue lines offer year-round opportunities for fly
                anglers chasing wild trout, while tailwaters like the Nantahala and
                Tuckasegee deliver reliable flows even after summer thunderstorms. Use
                the real-time weather and river insights above to plan your next drift,
                choose the right flies for changing hatches, and stay safe when water
                rises fast in the mountains. Whether you&apos;re hiking into remote
                headwaters or stalking a stocked stretch after work, these conditions
                help you decide when to wade, what gear to pack, and where the bite will
                be hottest across the Tar Heel State.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-400 sm:text-base">
            <p className="max-w-2xl">
              From floating on the Watauga to wading Big Snowbird creek, we aim to give you the information you are looking for fast.
            </p>
            <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
              <span>Developed by Search &amp; Be Found.</span>
              <a
                href="https://searchandbefound.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-400 transition hover:text-emerald-300"
              >
                What software can we build for you?
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
