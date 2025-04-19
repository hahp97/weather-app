/** @type {import('next').NextConfig} */
import CaseSensitivePathsPlugin from "case-sensitive-paths-webpack-plugin";
import type { Configuration } from "webpack";

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
  webpack(config: Configuration) {
    if (!config.module) config.module = { rules: [] };
    if (!config.module.rules) config.module.rules = [];

    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    });

    if (!config.plugins) config.plugins = [];
    config.plugins = [new CaseSensitivePathsPlugin(), ...config.plugins];

    return config;
  },

  reactStrictMode: false,
};

export default nextConfig;
