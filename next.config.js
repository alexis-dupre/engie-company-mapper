/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  experimental: {
    serverActions: false,
  },
  // Désactiver l'optimisation Edge pour Netlify
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
