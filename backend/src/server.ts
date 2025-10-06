import 'dotenv/config';
import app from './app.js';
import { supabase, isSupabaseConfigured } from './config/database.js';

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('appliances').select('count').limit(1);
        if (error) {
          console.log('⚠️  Database connection test failed, but continuing...');
          console.log('Error:', error.message);
        } else if (data) {
          console.log('✅ Database connected successfully');
        }
      } catch (error) {
        console.log('⚠️  Database connection test failed, but continuing...');
        console.log('Error:', error instanceof Error ? error.message : error);
      }
    } else {
      console.warn('⚠️  Supabase credentials not configured. Skipping database connection test.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`�� Health check: http://localhost:${PORT}/health`);
      console.log(`�� API base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
