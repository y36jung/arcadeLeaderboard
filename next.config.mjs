/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",  //This is for enabling static imports for GitHub Actions
  reactStrictMode: false,
};
//module.exports = nextConfig
export default nextConfig;
