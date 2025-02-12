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
   dashboardBtn: string,
   dashboardRoute: string,
   email: string,
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> },
   userDeadline?: string | number
): Promise<boolean> {
   // Format dashboard button
   const dashboardBtnFormat = `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute;

   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ dashboardRoute:", validatedDashboardRoute);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
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

      // Step 2: Prepare and execute the query
      let taskQuery: string;
      let taskValues: (string | number | object)[];

      if (userDeadline) {

         let formattedDeadline: string;
         let columnDeadline: string;

         if (typeof userDeadline === "number") {
            // Convert hours to PostgreSQL `time` format
            formattedDeadline = `${userDeadline}:00`;
            columnDeadline = "time_deadline";
         } else if (/^\d{2}:\d{2}$/.test(userDeadline)) {
            // If string matches `HH:MM`, treat as `TIME`
            formattedDeadline = userDeadline;
            columnDeadline = "time_deadline";
         } else {
            // Assume valid `DATE` format for other strings
            formattedDeadline = userDeadline;
            columnDeadline = "date_deadline";
         }

         console.log("🚀 ~ formattedDeadline:", formattedDeadline);
         taskQuery = `INSERT INTO ${dashboardBtnFormat} (user_id, task_data, ${columnDeadline}) VALUES ($1, $2::jsonb, $3) RETURNING *;`;
         taskValues = [userId, JSON.stringify(taskDetails), formattedDeadline];
      } else {
         // Insert without deadline
         taskQuery = `
         INSERT INTO ${dashboardBtnFormat} (user_id, task_data, ${validatedDashboardRoute}) 
         VALUES ($1, $2::jsonb, $3) RETURNING *;
       `;
         taskValues = [userId, JSON.stringify(taskDetails), true];
      }

      const taskResult = await client.query(taskQuery, taskValues);

      console.log('Inserted task:', taskResult.rows[0]);
      return true;
   } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('Error inserting task:', errorMessage);
      return false;
   } finally {
      client.release();
   }
}

export async function updateTaskInformation(
   dashboardBtn: string,
   validatedDashboardRoute: string,
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> }, // required
   updatingIndex: number,
   updateDeadline?: number | string,
) {
   const dashboardBtnFormat = `${dashboardBtn}_task`;
   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ dashboardRoute:", validatedDashboardRoute);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      // Check if the ID exists
      const existingTaskQuery = `SELECT task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1 AND ${validatedDashboardRoute} = $2`;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, true]);
      console.log("🚀 ~ initial task details:", existingTaskResult.rows);

      if (existingTaskResult.rows.length > 0) {
         // Task exists, prepare the update query
         const updatedTaskFormat = JSON.stringify(taskDetails);
         let updateTaskQuery: string;
         let updateTaskValues: (string | number | boolean)[];

         if (updateDeadline) {
            let formattedDeadline: string;
            let columnDeadline: string;

            if (typeof updateDeadline === "number") {
               // Convert hours to `TIME` format
               formattedDeadline = `${updateDeadline}:00`;
               columnDeadline = "time_deadline";
            } else if (/^\d{2}:\d{2}$/.test(updateDeadline)) {
               // If matches `HH:MM`
               formattedDeadline = updateDeadline;
               columnDeadline = "time_deadline";
            } else {
               // Assume valid `DATE` format
               formattedDeadline = updateDeadline;
               columnDeadline = "date_deadline";
            }

            updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1, ${columnDeadline} = $2 WHERE id = $3 AND ${validatedDashboardRoute} = $4`;
            updateTaskValues = [updatedTaskFormat, formattedDeadline, updatingIndex, true];
         } else {
            // Update without deadline
            updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1 WHERE id = $2 AND ${validatedDashboardRoute} = $3`;
            updateTaskValues = [updatedTaskFormat, updatingIndex, true];
         }

         // Execute the update query
         const updatedTaskResult = await client.query(updateTaskQuery, updateTaskValues);
         console.log("🚀 ~ updated task details:", updatedTaskResult);
         return true;
      }

      // ID not found
      console.warn(`No task found with id ${updatingIndex} in ${dashboardBtnFormat}.`);
      return false;
   } catch (error: unknown) {
      console.error("Error updating task:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
}

export async function showSavedTaskSummaryView(dashboardBtn: string, dashboardRoute: string) {
   const dashboardBtnFormat = dashboardBtn === "" ? "personal_task" : `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute === "" ? "high_priority" : dashboardRoute;

   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ showSavedTaskSummaryView ~ tableRouteLabel:", validatedDashboardRoute);

   // Matching table label and table route
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "archived", "missed", "main", "time_deadline", "date_deadline"]; // Add more valid column names if necessary
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      const userEmail = "john.doe@example.com";
      const userQuery = "SELECT id FROM all_users WHERE email = $1";
      const userResult = await client.query(userQuery, [userEmail]);

      if (userResult.rowCount === 0) {
         console.log("User not found with email:", userEmail);
         return false;
      }

      let taskQuery: string;

      const userId = userResult.rows[0].id;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline" || dashboardRoute === "completed" || dashboardRoute === "missed") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} = true`;
      }
      // Dynamically construct the query
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

export async function showSavedTaskDetailView(id?: number, dashboardBtn?: string, dashboardRoute?: string) {

   const dashboardBtnFormat = dashboardBtn === "" ? "personal_task" : `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute === "" ? "high_priority" : dashboardRoute;


   console.log("🚀 ~ showSavedTaskDetailView ~ id:", id)
   if (!id || dashboardBtnFormat === "" || validatedDashboardRoute === "") {
      console.log("Invalid input parameters");
   }

   if (typeof id !== "number" || typeof dashboardBtnFormat !== "string" || typeof validatedDashboardRoute !== "string") {
      console.log("invalid type of data type")
      return false;
   }

   console.log("🚀 ~ showSavedTaskDetailView ~ id:", id);
   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ showSavedTaskSummaryView ~ tableRouteLabel:", validatedDashboardRoute);

   // Matching table label and table route
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
   }

   const allowedRoutes = ["completed", "high_priority", "archived", "missed", "main", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline" || dashboardRoute === "completed" || dashboardRoute === "missed") {
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks,task_data ->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else {
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks,task_data ->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 AND ${validatedDashboardRoute} = true`;
      }

      const taskResult = await client.query(taskQuery, [id]);
      const row = taskResult.rows[0]; // Return the first row
      console.log("🚀 ~ showSavedTaskDetailView ~ row:", row);
      return row;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      throw error; // Re-throw the error
   } finally {
      client.release();
   }
}

export async function taskPositionRequirement(dashboardBtn: string, dashboardRoute: string) {

   // Matching table label and table route
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtn)) {
      console.log(`Table not found or wrong table format: ${dashboardBtn}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "main", "completed", "time_deadline", "date_deadline"]; // Add more valid column names if necessary
   if (!allowedRoutes.includes(dashboardRoute)) {
      console.log(`Invalid column name: ${dashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = 1 AND ${dashboardRoute} IS NOT NULL  ORDER BY timestamp ASC`

      } else {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = 1 AND ${dashboardRoute} = true  ORDER BY timestamp ASC`
      }

      const taskResult = await client.query(taskQuery);
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

export async function TaskAttributes(
   condition: "missed" | "completed" | "deleted",
   dashboardBtn: string,
   dashboardRoute: string,
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> }, // required
   updatingIndex: number,
) {
   const dashboardBtnFormat = `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute;
   const validatedCondition = condition;
   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ dashboardRoute:", validatedDashboardRoute);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedCondition = ["completed", "missed", "deleted"];
   if (!allowedCondition.includes(validatedCondition)) {
      console.error(`Invalid column name: ${validatedCondition}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      // Check if the ID exists
      const existingTaskQuery = `SELECT task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1 AND ${validatedDashboardRoute} = $2`;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, true]);
      console.log("🚀 ~ initial task details:", existingTaskResult.rows);

      if (existingTaskResult.rows.length > 0) {
         // Task exists, prepare the update query
         const updatedTaskFormat = JSON.stringify(taskDetails);

         const updateTaskQuery = `UPDATE ${allowedDashboard}, SET task_data = $1, ${validatedCondition} = $2 WHERE id = $3 AND ${validatedDashboardRoute} = $4 `
         const updateTaskValues = [updatedTaskFormat, true, updatingIndex, true];

         const updateTaskCondition = await client.query(updateTaskQuery, updateTaskValues);

         console.log("🚀 ~ updateTaskCondition:", updateTaskCondition);
         return true;
      }

      // ID not found
      console.warn(`No task found with id ${updatingIndex} in ${dashboardBtnFormat}.`);
      return false;
   } catch (error: unknown) {
      console.error("Error updating task condition:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
} 