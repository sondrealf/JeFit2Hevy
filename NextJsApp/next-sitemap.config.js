module.exports = {
  siteUrl: "https://jefit2hevy.vercel.app/",
  generateRobotsTxt: true,
  additionalPaths: async (config) => [
    {
      loc: 'https://github.com/sondrealf/JeFit2Hevy',
      lastmod: new Date().toISOString(),
    },
  ],
};
