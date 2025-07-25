/**
 * Simple test script to verify search endpoints are accessible
 */
import express from 'express';
import searchRoutes from './src/routes/search.routes';

const app = express();
app.use(express.json());
app.use('/api/search', searchRoutes);

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Search integration test server running',
    availableEndpoints: [
      'GET /api/search/listings',
      'GET /api/search/suggestions', 
      'GET /api/search/popular',
      'GET /api/search/filters',
      'POST /api/search/save'
    ]
  });
});

const port = 3005;
app.listen(port, () => {
  console.log(`Search integration test server running on port ${port}`);
  console.log(`Test endpoint: http://localhost:${port}/test`);
  console.log(`Search endpoints: http://localhost:${port}/api/search/`);
});