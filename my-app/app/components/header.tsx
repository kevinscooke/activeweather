"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import locations, { type WeatherLocation } from "./weather/locations";

const LOCATION_PATH_SUFFIX = "-weather-river-gauge";

const riverGageSiteByLocation: Partial<
  Record<(typeof locations)[number]["id"], string>
> = {
  "ararat-river": "02113850",
  "wilson-creek": "02140510",
  "davidson-river": "03441000",
  "elk-creek": "02111180",
  "jacobs-fork": "02143040",
  "nantahala-river": "03505550",
  "reddies-river": "02111500",
  "south-fork-new-river": "03161000",
  "tuckasegee-river": "03508050",
  "watauga-river": "03479000",
  "west-fork-pigeon-river": "0345577330",
};

const FlowGlyph = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 28 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M1 9c2-3 4-3 6 0s4 3 6 0 4-3 6 0 4 3 6 0"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getLocationFromPathname = (pathname: string | null | undefined) => {
  if (!pathname) return undefined;

  const [firstSegment] = pathname.split("/").filter(Boolean);
  if (!firstSegment || !firstSegment.endsWith(LOCATION_PATH_SUFFIX)) {
    return undefined;
  }

  const locationId = firstSegment.slice(
    0,
    firstSegment.length - LOCATION_PATH_SUFFIX.length,
  );

  return locations.find((location) => location.id === locationId);
};

const buildLocationPathname = (locationId: WeatherLocation["id"]) =>
  `/${locationId}${LOCATION_PATH_SUFFIX}`;

interface HeaderProps {
  selectedLocation?: WeatherLocation | null;
}

export default function Header({ selectedLocation: propSelectedLocation }: HeaderProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const locationFromPath = useMemo(
    () => getLocationFromPathname(pathname),
    [pathname],
  );
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation | null>(
    () => propSelectedLocation ?? locationFromPath ?? null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (propSelectedLocation) {
      setSelectedLocation(propSelectedLocation);
    } else if (locationFromPath) {
      setSelectedLocation(locationFromPath);
    }
  }, [propSelectedLocation, locationFromPath]);

  const filteredLocations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return locations;
    return locations.filter((location) =>
      `${location.name} ${location.region}`.toLowerCase().includes(query),
    );
  }, [searchTerm]);

  const groupedLocations = useMemo(() => {
    const groups = new Map<string, typeof locations>();

    for (const location of filteredLocations) {
      const letter = location.name.charAt(0)?.toUpperCase() ?? "#";
      const bucket = groups.get(letter);
      if (bucket) {
        bucket.push(location);
      } else {
        groups.set(letter, [location]);
      }
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, items]) => ({
        letter,
        items: items.slice().sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredLocations]);

  const resultsCount = filteredLocations.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setSearchTerm("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMenuOpen) {
      const id = window.setTimeout(() => {
        desktopSearchRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      const id = window.setTimeout(() => {
        mobileSearchRef.current?.focus();
      }, 50);
      return () => window.clearTimeout(id);
    }
  }, [isMobileMenuOpen]);

  const handleLocationSelect = useCallback(
    (locationId: string) => {
      const location = locations.find((loc) => loc.id === locationId);
      if (!location) return;

      setSelectedLocation(location);
      setIsMenuOpen(false);
      setIsMobileMenuOpen(false);
      setSearchTerm("");

      const nextPathname = buildLocationPathname(locationId);
      router.push(nextPathname);
    },
    [router],
  );

  const handleDesktopToggle = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
      setSearchTerm("");
    } else {
      setSearchTerm("");
      setIsMenuOpen(true);
    }
  };

  const handleMobileOpen = () => {
    setSearchTerm("");
    setIsMobileMenuOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
    setIsMobileMenuOpen(false);
    setSearchTerm("");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-semibold text-slate-100 transition hover:text-slate-300 sm:text-2xl"
        >
          Active Fly Fishing
        </Link>
        <div className="flex items-center gap-3">
          <p className="hidden text-xs font-medium text-slate-400 sm:block sm:text-sm">Powered by:</p>
          <div className="relative hidden h-10 w-32 sm:block sm:h-12 sm:w-40">
            <Image
              src="https://ik.imagekit.io/gfi2amo6o/Jesse-Brown-s-Logo-White-e1730748119626.png"
              alt="Jesse Brown's Charlotte, NC"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        {selectedLocation ? (
          <>
            <div className="hidden items-center gap-3 sm:flex">
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={handleDesktopToggle}
                  aria-haspopup="listbox"
                  aria-expanded={isMenuOpen}
                  className="flex items-center gap-3 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-white/60 backdrop-blur transition hover:text-slate-900"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 00.293.707l1.5 1.5a1 1 0 001.414-1.414L11 8.586V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-left leading-tight">
                    <span className="block text-xs uppercase tracking-wide text-slate-400">
                      {selectedLocation.name}
                    </span>
                    <span className="block text-sm font-semibold text-slate-700">
                      {selectedLocation.region}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-slate-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {isMenuOpen ? (
                  <div className="absolute right-0 top-full z-20 mt-3 w-md rounded-3xl bg-white/98 p-4 text-sm text-slate-600 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                          Select Location
                        </p>
                        <p className="text-xs text-slate-400">
                          {resultsCount} {resultsCount === 1 ? "option" : "options"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleMenuClose}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Close location menu"
                      >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                          <path
                            fillRule="evenodd"
                            d="M10 8.586l4.243-4.243a1 1 0 111.414 1.414L11.414 10l4.243 4.243a1 1 0 01-1.414 1.414L10 11.414l-4.243 4.243a1 1 0 01-1.414-1.414L8.586 10 4.343 5.757a1 1 0 011.414-1.414L10 8.586z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-3">
                      <label htmlFor="desktop-location-search" className="sr-only">
                        Search locations
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                            <path
                              fillRule="evenodd"
                              d="M12.9 14.32a7 7 0 111.414-1.414l3.147 3.146a1 1 0 01-1.414 1.415L12.9 14.32zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <input
                          ref={desktopSearchRef}
                          id="desktop-location-search"
                          type="search"
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search rivers or counties"
                          className="w-full rounded-2xl border border-slate-200 bg-white/90 px-9 py-2 text-sm text-slate-600 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        />
                      </div>
                    </div>

                    <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                      {groupedLocations.length ? (
                        groupedLocations.map((group) => (
                          <div key={group.letter} className="space-y-2">
                            <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                              {group.letter}
                            </p>
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                              {group.items.map((location) => {
                                const isSelected = location.id === selectedLocation?.id;
                                const hasGauge = Boolean(
                                  riverGageSiteByLocation[location.id],
                                );
                                return (
                                  <button
                                    key={location.id}
                                    type="button"
                                    onClick={() => handleLocationSelect(location.id)}
                                    className={`flex w-full flex-col gap-2 rounded-2xl border px-3 py-3 text-left transition ${
                                      isSelected
                                        ? "border-sky-200 bg-sky-50/80 text-slate-900 shadow-sm"
                                        : "border-transparent bg-white/85 text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="flex flex-col gap-1">
                                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                        {location.name}
                                        {hasGauge ? (
                                          <FlowGlyph className="h-3.5 w-6 text-sky-400" />
                                        ) : null}
                                      </span>
                                      <span className="text-xs text-slate-400">
                                        {location.region}
                                      </span>
                                    </span>
                                    {isSelected ? (
                                      <span className="inline-flex items-center gap-1 self-start rounded-full bg-sky-100/80 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-sky-600">
                                        <svg
                                          viewBox="0 0 20 20"
                                          fill="currentColor"
                                          className="h-3 w-3"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.704 5.29a1 1 0 010 1.415l-7.07 7.07a1 1 0 01-1.415 0l-3.536-3.536a1 1 0 011.415-1.414L8.934 11.95l6.363-6.364a1 1 0 011.407-.296z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Selected
                                      </span>
                                    ) : null}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                          No locations match "{searchTerm}".
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-1 sm:hidden">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Select Location
              </span>
              <button
                type="button"
                onClick={handleMobileOpen}
                className="flex w-full items-center justify-between rounded-2xl bg-white/85 px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm ring-1 ring-white/60 backdrop-blur transition focus:outline-none focus:ring-2 focus:ring-sky-300"
                aria-haspopup="dialog"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-slate-400">
                    {selectedLocation.region}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    {selectedLocation.name}
                  </span>
                </span>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {isMobileMenuOpen ? (
              <>
                <div
                  className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
                  onClick={handleMenuClose}
                  aria-hidden="true"
                />
                <div className="fixed inset-0 z-50 flex flex-col bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Select Location
                      </p>
                      <p className="text-sm text-slate-500">
                        {resultsCount} {resultsCount === 1 ? "option" : "options"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleMenuClose}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Close location picker"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.243-4.243a1 1 0 111.414 1.414L11.414 10l4.243 4.243a1 1 0 01-1.414 1.414L10 11.414l-4.243 4.243a1 1 0 01-1.414-1.414L8.586 10 4.343 5.757a1 1 0 011.414-1.414L10 8.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="px-4 py-3">
                    <label htmlFor="mobile-location-search" className="sr-only">
                      Search locations
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path
                            fillRule="evenodd"
                            d="M12.9 14.32a7 7 0 111.414-1.414l3.147 3.146a1 1 0 01-1.414 1.415L12.9 14.32zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <input
                        ref={mobileSearchRef}
                        id="mobile-location-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search rivers or counties"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm text-slate-600 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-6">
                    {groupedLocations.length ? (
                      groupedLocations.map((group) => (
                        <div key={group.letter} className="space-y-2 py-2">
                          <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            {group.letter}
                          </p>
                          <div className="flex flex-col gap-2">
                            {group.items.map((location) => {
                              const isSelected = location.id === selectedLocation?.id;
                              const hasGauge = Boolean(
                                riverGageSiteByLocation[location.id],
                              );
                              return (
                                <button
                                  key={location.id}
                                  type="button"
                                  onClick={() => handleLocationSelect(location.id)}
                                  className={`flex flex-col gap-2 rounded-2xl border px-3 py-3 text-left text-sm transition ${
                                    isSelected
                                      ? "border-sky-200 bg-sky-50/80 text-slate-900 shadow-sm"
                                      : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex flex-col gap-1">
                                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                      {location.name}
                                      {hasGauge ? (
                                        <FlowGlyph className="h-3.5 w-6 text-sky-400" />
                                      ) : null}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {location.region}
                                    </span>
                                  </span>
                                  {isSelected ? (
                                    <span className="inline-flex items-center gap-1 self-start rounded-full bg-sky-100/80 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-sky-600">
                                      <svg
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="h-3 w-3"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.704 5.29a1 1 0 010 1.415l-7.07 7.07a1 1 0 01-1.415 0l-3.536-3.536a1 1 0 011.415-1.414L8.934 11.95l6.363-6.364a1 1 0 011.407-.296z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Selected
                                    </span>
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                        No locations match "{searchTerm}".
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : (
          <div className="hidden items-center gap-3 sm:flex">
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={handleDesktopToggle}
                aria-haspopup="listbox"
                aria-expanded={isMenuOpen}
                className="flex items-center gap-3 rounded-full bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-white/60 backdrop-blur transition hover:text-slate-900"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2a1 1 0 00.293.707l1.5 1.5a1 1 0 001.414-1.414L11 8.586V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-slate-700">
                  Select Location
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-slate-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.108l3.71-3.877a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 top-full z-20 mt-3 w-md rounded-3xl bg-white/98 p-4 text-sm text-slate-600 shadow-2xl ring-1 ring-slate-100 backdrop-blur">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Select Location
                      </p>
                      <p className="text-xs text-slate-400">
                        {resultsCount} {resultsCount === 1 ? "option" : "options"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleMenuClose}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label="Close location menu"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                        <path
                          fillRule="evenodd"
                          d="M10 8.586l4.243-4.243a1 1 0 111.414 1.414L11.414 10l4.243 4.243a1 1 0 01-1.414 1.414L10 11.414l-4.243 4.243a1 1 0 01-1.414-1.414L8.586 10 4.343 5.757a1 1 0 011.414-1.414L10 8.586z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mt-3">
                    <label htmlFor="desktop-location-search" className="sr-only">
                      Search locations
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-300">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                          <path
                            fillRule="evenodd"
                            d="M12.9 14.32a7 7 0 111.414-1.414l3.147 3.146a1 1 0 01-1.414 1.415L12.9 14.32zM14 9a5 5 0 11-10 0 5 5 0 0110 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <input
                        ref={desktopSearchRef}
                        id="desktop-location-search"
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search rivers or counties"
                        className="w-full rounded-2xl border border-slate-200 bg-white/90 px-9 py-2 text-sm text-slate-600 shadow-inner focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
                      />
                    </div>
                  </div>

                  <div className="mt-4 max-h-80 space-y-4 overflow-y-auto pr-1">
                    {groupedLocations.length ? (
                      groupedLocations.map((group) => (
                        <div key={group.letter} className="space-y-2">
                          <p className="px-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-400">
                            {group.letter}
                          </p>
                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                            {group.items.map((location) => {
                              const hasGauge = Boolean(
                                riverGageSiteByLocation[location.id],
                              );
                              return (
                                <button
                                  key={location.id}
                                  type="button"
                                  onClick={() => handleLocationSelect(location.id)}
                                  className="flex w-full flex-col gap-2 rounded-2xl border border-transparent bg-white/85 px-3 py-3 text-left text-slate-600 transition hover:border-slate-200 hover:bg-slate-50"
                                >
                                  <span className="flex flex-col gap-1">
                                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                                      {location.name}
                                      {hasGauge ? (
                                        <FlowGlyph className="h-3.5 w-6 text-sky-400" />
                                      ) : null}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {location.region}
                                    </span>
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-500">
                        No locations match "{searchTerm}".
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

