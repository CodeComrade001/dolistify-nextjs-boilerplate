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

export default async function insertTask(
   table: string,
   email: string,
   taskDetails: { title: string, subtasks: { id: number, description: string }[] },
   status: string,
): Promise<boolean> {
   const allowedTables = ["personal_task", "other_table", "all_users", "Personal_task", "Work_task", "Custom_task", "Time_bound_task", "Completed_task", "Missed_task", "Goal_task"];
   if (!allowedTables.includes(table)) {
      console.error("Invalid table name:", table);
      return false;
   }

   const client = await pool.connect();

   try {
      // Step 1: Find the user ID based on email 
      const userQuery = 'SELECT id FROM all_users WHERE email = $1';
      const userResult = await client.query(userQuery, [email]);

      if (userResult.rowCount === 0) {
         console.error('User not found with email:', email);
         return false;
      }

      const userId = userResult.rows[0].id;

      // Step 2: Insert the task as JSONB with the found user ID
      const taskQuery = `INSERT INTO ${table} (user_id, task_data, status) VALUES ($1, $2::jsonb, $3) RETURNING *;`;
      const taskValues = [userId, JSON.stringify(taskDetails), status];  // Convert taskDetails to JSON string
      const taskResult = await client.query(taskQuery, taskValues);

      console.log('Inserted task:', taskResult.rows[0]);
      return true;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error';
      console.error('Error inserting task:', errorMessage);
      return false;
   } finally {
      client.release();
   }
}

export async function EditTask(
   tableGroup?: string,
   tableGroupRoute?: string,
   table?: number,   // Assuming `id` is a number. Adjust if it's a different type.
   time?: number,
   taskDetails?: { title: string; subtasks: { id: number; description: string }[] }, // required
   deleteStatusId?: number
) {
   // Function implementation
}


export async function showSavedTaskSummaryView() {
   const client = await pool.connect();
   try {
      const userEmail = "john.doe@example.com";
      const userQuery = "SELECT id FROM all_users WHERE email = $1";
      const userResult = await client.query(userQuery, [userEmail]);

      if (userResult.rowCount === 0) {
         console.log("User not found with email:", userEmail);
         return false;
      }

      const userId = userResult.rows[0].id;

      // Modify the query to select only the title from task_data
      const taskQuery = "SELECT id, task_data->>'title' AS title, timestamp FROM personal_task WHERE user_id = $1";
      const taskResult = await client.query(taskQuery, [userId]);

      const row = taskResult.rows;
      return row;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      return false;
   } finally {
      client.release();
   }
}


export async function showSavedTaskDetailView(id?: number, tableName?: string) {
   if (!id || !tableName) { return }

   const client = await pool.connect();
   try {
      const received_table = tableName;
      const receivedID = id;

      if (receivedID == null) {
         return;
      } else {
         const taskQuery = `SELECT task_data->>'subtasks' AS allTask FROM ${received_table} WHERE id = $1`;
         const taskResult = await client.query(taskQuery, [receivedID]);
         const row = taskResult.rows;
         return row;
      }
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      return false;
   } finally {
      client.release();
   }
}

export async function taskPositionRequirement() {
   const client = await pool.connect();
   try {
      const taskQuery = "SELECT id, timestamp as timeAdded FROM personal_task where user_id = 1"
      const taskResult = await client.query(taskQuery);
      const row = taskResult.rows;
      console.log("🚀 ~ taskPositionRequirement ~ row:", row)
      return row;

   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      return false;
   } finally {
      client.release();
   }
}