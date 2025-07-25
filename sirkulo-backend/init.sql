-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis" SCHEMA public;

-- Create indexes for better performance
-- These will be created after TypeORM runs migrations