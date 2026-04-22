const app = require('../backend/server');

// Export the Express app as a serverless function
module.exports = (req, res) => {
  app(req, res);
};
