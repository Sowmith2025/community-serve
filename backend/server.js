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
  // Define the EXACT path to the Angular build output directory (the folder containing index.html and assets)
  // This path assumes 'server.js' and 'frontend-angular' are both directly under the project root (e.g., /src).
  const angularDistDir = path.join(__dirname, 'frontend-angular/dist/frontend-angular/browser');
  const indexHtmlPath = path.join(angularDistDir, 'index.html');

  // CRITICAL CHECK: Ensure the build directory exists before trying to serve from it
  if (!fs.existsSync(angularDistDir)) {
    console.error(`\n==================================================================`);
    console.error(`💥 FATAL ERROR: Angular distribution directory not found!`);
    console.error(`Expected Directory: ${angularDistDir}`);
    console.error(`\nACTIONS REQUIRED:`);
    console.error(`1. Ensure your deployment's BUILD COMMAND is running successfully (e.g., 'ng build').`);
    console.error(`2. Verify the 'outputPath' in your angular.json file matches the structure above.`);
    console.error(`==================================================================\n`);
    // Note: The server will still start, but the frontend will fail to load until the build runs.
  } else {
    // 1. Serve all static files (CSS, JS, images) from the angular build directory.
    app.use(express.static(angularDistDir));

    // 2. For all other routes ('*'), which are likely Angular client-side routes,
    // serve the single entry point: index.html.
    app.get('*', (req, res) => {
      // We send index.html directly from the build directory defined above.
      res.sendFile(indexHtmlPath, (err) => {
        if (err) {
          // Fallback error response if index.html is missing inside the existing folder
          console.error(`Error serving index.html at ${indexHtmlPath}:`, err.message);
          res.status(500).send("The front-end application failed to load.");
        }
      });
    });
  }
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