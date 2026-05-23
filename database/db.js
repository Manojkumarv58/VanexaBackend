import pkg from "pg";
import dotenv from "dotenv";

// Load env if not already loaded
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const { Pool } = pkg;

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') 
    ? { rejectUnauthorized: false } 
    : false,
});

export default database;