import locations from "./locations";

const siteUrl = "https://searchandbefound.com/";
const description =
  "Live weather, river flows, and hatch insights for fly fishing North Carolina. Plan every angling session with real-time forecasts tailored to trout streams statewide.";

export default function Head() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "North Carolina Fly Fishing Weather Dashboard",
    description,
    keywords: [
      "fly fishing",
      "north carolina trout",
      "river flow data",
      "angler weather",
      "fishing conditions",
    ],
    url: siteUrl,
    isAccessibleForFree: true,
    creator: {
      "@type": "Organization",
      name: "Search & Be Found",
      url: "https://searchandbefound.com",
    },
    provider: {
      "@type": "Organization",
      name: "Search & Be Found",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl,
    },
    spatialCoverage: locations.map((location) => ({
      "@type": "Place",
      name: location.name,
      description: location.description,
      address: {
        "@type": "PostalAddress",
        addressRegion: location.region,
        addressCountry: "USA",
      },
    })),
    audience: {
      "@type": "PeopleAudience",
      name: "Fly anglers and fishing guides",
      geographicArea: {
        "@type": "AdministrativeArea",
        name: "North Carolina",
      },
    },
  };

  return (
    <>
      <title>
        North Carolina Fly Fishing Weather Dashboard | Search &amp; Be Found
      </title>
      <meta name="description" content={description} />
      <meta
        name="keywords"
        content="fly fishing north carolina, trout stream weather, nc river flow, fishing forecast, angler planning"
      />
      <link rel="canonical" href={siteUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Search &amp; Be Found" />
      <meta property="og:title" content="North Carolina Fly Fishing Weather Dashboard" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={siteUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="North Carolina Fly Fishing Weather Dashboard" />
      <meta name="twitter:description" content={description} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}

