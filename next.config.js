const webpack = require("webpack");
// import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
module.exports = {
  reactStrictMode: true,
  // output: "standalone",
  transpilePackages: ["@near-wallet-selector/wallet-connect"],
  experimental: {
    esmExternals: "loose",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          fs: "browserify-fs",
        })
      );
    }
    setupSvgLoader(config);

    return config;
  },
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //         reportFilename: "./analyze/client.html",
  //         openAnalyzer: false,
  //       })
  //     );
  //   } else {
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: "static",
  //         reportFilename: "./analyze/server.html",
  //         openAnalyzer: false,
  //       })
  //     );
  //   }
  //   return config;
  // },
};


function setupSvgLoader(config) {
  const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'));
  config.module.rules.push(
    // Reapply the existing rule, but only for svg imports ending in ?url
    {
      ...fileLoaderRule,
      test: /\.svg$/i,
      resourceQuery: /url/, // *.svg?url
    },
    // Convert all other *.svg imports to React components
    {
      test: /\.svg$/i,
      issuer: fileLoaderRule.issuer,
      resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
      use: ['@svgr/webpack'],
    },
  );
  // Modify the file loader rule to ignore *.svg, since we have it handled now.
  fileLoaderRule.exclude = /\.svg$/i;
}