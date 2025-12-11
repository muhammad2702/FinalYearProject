import app from './app.js';
import { PORT } from './config/server.js';
import connectDB from './config/db.js';

const start = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`SABCEMM API Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

