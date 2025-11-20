const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const telegramRoutes = require('./routes/telegram');
const telegramService = require('./services/telegram');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 requests per minute
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Routes
app.use('/api/telegram', telegramRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WiFi Checker Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize Telegram bot and start server
async function startServer() {
  try {
    console.log('🚀 Starting WiFi Checker Backend Server...\n');
    
    // Initialize Telegram bot
    await telegramService.initialize();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🌐 Server running on http://localhost:${PORT}`);
      console.log(`   📡 API endpoint: http://localhost:${PORT}/api`);
      console.log(`   💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`   📱 Telegram status: http://localhost:${PORT}/api/telegram/status`);
      console.log('\n✨ Server ready to accept requests\n');
    });
    
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error('   Please check your .env file and ensure TELEGRAM_BOT_TOKEN is set correctly.\n');
    process.exit(1);
  }
}

startServer();
