/** @type {import('next').NextConfig} */

import type { NextConfig } from "next";
import type { Configuration } from "webpack";

//

const nextConfig: NextConfig = {
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
  webpack(config: Configuration): Configuration {
    if (!config.module) config.module = { rules: [] };
    if (!config.module.rules) config.module.rules = [];

    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    });

    return config;
  },

  reactStrictMode: false,
};

export default nextConfig;
