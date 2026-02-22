const express = require('express');
const cors = require('cors');
const testHistoryRoutes = require('./routes/testHistoryRoutes');

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/test-history', testHistoryRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'RAG Test History',
    timestamp: new Date().toISOString() 
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 RAG Test History Server running on port ${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/test-history`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

module.exports = app;
