/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'media-4.api-sports.io',
                port: '',
                pathname: '/football/teams/**'
            }
        ]
    }
}

module.exports = nextConfig
