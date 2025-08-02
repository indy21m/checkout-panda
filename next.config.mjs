/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Strict React mode for better development experience
  reactStrictMode: true,
  // Optimize CSS for production
  experimental: {
    optimizeCss: true,
  },
}

export default nextConfig
