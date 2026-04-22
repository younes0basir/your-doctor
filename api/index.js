const app = require('../backend/server');

// Export for Vercel serverless function
module.exports = (req, res) => {
  app(req, res);
};
