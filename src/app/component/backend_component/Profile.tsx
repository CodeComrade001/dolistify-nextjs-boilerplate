'use server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

// Test the database connection
async function testConnection() {
  const client = await pool.connect();
  try {
    console.log("Database connection established successfully.");
  } catch (error: unknown) {
    const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
    console.error('Failed to connect to the database:', errorMessage);
  } finally {
    client.release();
  }
}

// Call the connection test function
testConnection();

export default async function GetUserDetails(index: number) {
  console.log("🚀 ~ GetUserDetails ~ GetUserDetails:", GetUserDetails)
  console.log("🚀 ~ GetUserDetails ~ index:", index)
  const client = await pool.connect();
  try {
    const taskQuery: string = `SELECT username as userName, email as Email FROM users WHERE id  = $1`
    const isUserRegistered = await client.query(taskQuery, [index])
    if (isUserRegistered.rows.length > 0) {
      const userDetails = isUserRegistered.rows[0];
      console.log("🚀 ~ GetUserDetails ~ isUserRegistered.rows:", isUserRegistered.rows[0])
      console.log("🚀 ~ GetUserDetails ~ userDetails:", userDetails)
      return userDetails;
    } else {
      return false
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error('Error inserting task:', errorMessage);
    return false
  } finally {
    client.release()
  }
}