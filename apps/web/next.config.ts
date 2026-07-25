import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode for catching potential issues
  reactStrictMode: true,

  // Trace monorepo packages (Nest dist + Prisma) into the serverless function.
  outputFileTracingRoot: path.join(__dirname, '../..'),
  outputFileTracingIncludes: {
    '/api/v1/[[...path]]': [
      './vendor/nest-api/**/*',
      '../api/dist/**/*',
      '../../node_modules/.prisma/**/*',
      '../../node_modules/@prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+client@*/**/*',
      '../../node_modules/.pnpm/@nestjs+*/**/*',
    ],
  },

  // Nest + Prisma must stay external so the compiled API bundle can boot on Vercel.
  serverExternalPackages: [
    '@mcpfac/api',
    '@nestjs/common',
    '@nestjs/core',
    '@nestjs/config',
    '@nestjs/platform-express',
    '@nestjs/swagger',
    '@nestjs/throttler',
    '@prisma/client',
    'nestjs-pino',
    'pino',
    'pino-http',
    'class-transformer',
    'class-validator',
    'reflect-metadata',
    'resend',
  ],

  // Image optimization for product images and laboratory photos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'peptidepeak.online',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Redirect trailing slashes for consistency
  trailingSlash: false,

  // Output for Vercel deployment
  output: undefined, // Vercel handles this automatically

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
