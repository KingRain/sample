/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'qoannizembvpejpmjvby.supabase.co', // Your Supabase domain
      'lh3.googleusercontent.com' // For Gemini image URLs
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig
