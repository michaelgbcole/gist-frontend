/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    webpack: (config) => {
      config.resolve.alias.canvas = false;
      // Disable webpack's rule for PDF.js worker
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
      };
      
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource',
        generator: {
          filename: 'static/worker/[hash][ext][query]'
        }
      });
      return config;
    },
  }
  
  export default nextConfig;