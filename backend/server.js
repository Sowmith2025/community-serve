// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database connection
const connectDB = require('./config/database');

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const attendanceRoutes = require('./routes/attendance');
const organizerRoutes = require('./routes/organizer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);

app.use('/api/organizer', organizerRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Community Service API is running!',
    timestamp: new Date().toISOString()
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Prefer Angular build if available; otherwise fall back to React build
  const angularDistDir = path.join(__dirname, '../frontend-angular/dist/frontend-angular');
  const reactBuildDir = path.join(__dirname, '../frontend/build');

  const useAngular = fs.existsSync(angularDistDir);
  const staticDir = useAngular ? angularDistDir : reactBuildDir;

  app.use(express.static(staticDir));

  app.get('*', (req, res) => {
    const indexFile = useAngular
      ? path.join(angularDistDir, 'index.html')
      : path.join(reactBuildDir, 'index.html');
    res.sendFile(indexFile);
  });
}

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();