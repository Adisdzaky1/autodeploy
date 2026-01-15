/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vercel.com', 'avatars.githubusercontent.com'],
  },
  env: {
    VERCEL_TOKEN: process.env.VERCEL_TOKEN,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  }
}

module.exports = nextConfig