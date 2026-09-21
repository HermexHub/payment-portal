/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**'
      }
    ]
  },
  async rewrites() {
    const apiGatewayUrl =
      process.env.API_GATEWAY_URL || 'http://localhost:4000'
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiGatewayUrl}/api/v1/:path*`
      }
    ]
  }
}

export default nextConfig
