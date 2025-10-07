import app from './app';

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running in ${process.env.NODE_ENV || 'development'} mode
📡 API server listening on port ${PORT}
🌐 API URL: http://localhost:${PORT}
📚 Health check: http://localhost:${PORT}/api/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

export default server;
