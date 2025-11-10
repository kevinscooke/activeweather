export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-100">404</h1>
          <h2 className="text-2xl font-semibold text-slate-300">
            Page Not Found
          </h2>
        </div>
        <p className="text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="/"
            className="inline-block rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-emerald-400"
          >
            Go Home
          </a>
          <a
            href="/ararat-river-weather-river-gauge"
            className="inline-block rounded-full border-2 border-emerald-500 bg-transparent px-6 py-3 text-base font-semibold text-emerald-500 transition hover:bg-emerald-500/10"
          >
            View Weather Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}


