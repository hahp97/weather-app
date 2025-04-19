/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        hostname: "*",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  poweredByHeader: false,
  webpack(config) {
    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    });
    config.plugins = [new CaseSensitivePathsPlugin(), ...config.plugins];

    return config;
  },
  reactStrictMode: false,
};

export default nextConfig;
