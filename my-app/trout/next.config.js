/** @type {import('next').NextConfig} */
const nextConfig = {
  // Base path for hosting at /trout/ on activeflyfishing.com
  basePath: '/trout',
  
  // Prevent indexing by search engines
  robots: {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  },
}

module.exports = nextConfig

