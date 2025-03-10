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
   userId: number,
   dashboardBtn: string,
   dashboardRoute: string,
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

   const allowedRoutes = ["personal", "work", "high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();

   try {
      // Step 1: Find the user ID based on email
      const userQuery = 'SELECT id FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);

      if (userResult.rowCount === 0) {
         console.error('User not found with email:', userId);
         return false;
      }

      // Step 2: Prepare and execute the query
      let taskQuery: string;
      let taskValues: (string | number | boolean | object)[];

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
   userId: number,
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
      const existingTaskQuery = `SELECT task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1 , user_id = $2 AND ${validatedDashboardRoute} = $3`;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, userId, true]);
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
            if (dashboardBtnFormat === "repeated_task" && updateDeadline) {
               updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1, ${columnDeadline} = $2, time_bound = true WHERE id = $3, user_id = $4 AND ${validatedDashboardRoute} = $5`;
               updateTaskValues = [updatedTaskFormat, formattedDeadline, updatingIndex, userId, true];
            } else {
               updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1, ${columnDeadline} = $2 WHERE id = $3, user_id = $4 AND ${validatedDashboardRoute} = $5`;
               updateTaskValues = [updatedTaskFormat, formattedDeadline, updatingIndex, userId, true];
            }

         } else {
            // Update without deadline
            updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1 WHERE id = $2, user_id = $3 AND ${validatedDashboardRoute} = $4`;
            updateTaskValues = [updatedTaskFormat, updatingIndex, userId, true];
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

export async function showSavedTaskSummaryView(
   userId: number,
   dashboardBtn: string,
   dashboardRoute: string
) {
   let dashboardBtnFormat: string;
   let validatedDashboardRoute: string;
   if (dashboardBtn === "completed" || dashboardBtn === "missed") {
      dashboardBtnFormat = `${dashboardBtn}_task`;
      validatedDashboardRoute = `${dashboardRoute}_task`;

   } else if (dashboardBtn === "repeated" && dashboardRoute === "personal" || dashboardRoute === "work" || dashboardRoute === "time_bound") {
      dashboardBtnFormat = `${dashboardBtn}_task`;
      validatedDashboardRoute = `${dashboardRoute}`;
   } else {
      dashboardBtnFormat = dashboardBtn === "" ? "personal_task" : `${dashboardBtn}_task`;
      validatedDashboardRoute = dashboardRoute === "" ? "high_priority" : dashboardRoute;
   }

   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ showSavedTaskSummaryView ~ tableRouteLabel:", validatedDashboardRoute);

   // Matching table label and table route
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"]; // Add more valid column names if necessary
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (validatedDashboardRoute === "time_deadline" || validatedDashboardRoute === "date_deadline") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else if (dashboardBtn === "completed_task") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND completed = true`;
      } else if (dashboardBtn === "missed_task") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND missed = true`;
      } else if (dashboardBtnFormat === "repeated_task" && ((validatedDashboardRoute === "missed" || validatedDashboardRoute === "completed"))) {
         taskQuery = `SELECT 
         rt.id, 
         rt.task_data->>'title' AS title, 
         rt.timestamp
         FROM ${dashboardBtnFormat} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
       WHERE rts.${validatedDashboardRoute} = true AND rt.user_id = $1; 
       `;
      } else {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} = true`;
      }
      // Dynamically construct the query
      const taskResult = await client.query(taskQuery, [userId]);

      const row = taskResult.rows;
      console.log("🚀 ~ showSavedTaskSummaryView ~ row:", row)
      return row;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      return false;
   } finally {
      client.release();
   }
}

export async function showSavedTaskDetailView(
   userId: number,
   id?: number,
   dashboardBtn?: string,
   dashboardRoute?: string
) {

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
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"]; // Add more valid column names if necessary
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (validatedDashboardRoute === "time_deadline" || validatedDashboardRoute === "date_deadline") {
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks,task_data ->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 , user_id = $2 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else if (dashboardBtnFormat === "repeated_task" && ((validatedDashboardRoute === "missed" || validatedDashboardRoute === "completed"))) {
         taskQuery = `SELECT 
         rt.id, 
         rt.task_data->>'title' AS title, 
         rt.task_data->>'subtasks' AS subtasks, 
         rt.task_data->>'status' AS status 
         FROM ${dashboardBtnFormat} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
       WHERE rts.${validatedDashboardRoute} = true AND rt.id = $1 , rt.user_id = $2
         `;
      } else {
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks,task_data ->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 , user_id = $2 AND ${validatedDashboardRoute} = true`;
      }

      const taskResult = await client.query(taskQuery, [id, userId]);
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

export async function taskPositionRequirement(
   userId: number,
   dashboardBtn: string,
   dashboardRoute: string
) {

   // Matching table label and table route
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtn)) {
      console.log(`Table not found or wrong table format: ${dashboardBtn}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"]; // Add more valid column names if necessary
   if (!allowedRoutes.includes(dashboardRoute)) {
      console.log(`Invalid column name: ${dashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = $1 AND ${dashboardRoute} IS NOT NULL  ORDER BY timestamp ASC`
      } else if (dashboardBtn === "completed_task") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardRoute} WHERE user_id = $1 AND completed = true  ORDER BY timestamp ASC`
      } else if (dashboardBtn === "missed_task") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardRoute} WHERE user_id = $1 AND missed = true  ORDER BY timestamp ASC`
      } else if (dashboardBtn === "repeated_task" && ((dashboardRoute === "missed" || dashboardRoute === "completed"))) {
         taskQuery = `SELECT 
         rt.id,  
         rt.timestamp
         FROM ${dashboardBtn} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
       WHERE rts.${dashboardRoute} = true
         `;
      } else {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = $1 AND ${dashboardRoute} = true  ORDER BY timestamp ASC`
      }

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

export async function TaskAttributes(
   userId: number,
   condition: "missed" | "completed" | "deleted",
   dashboardBtn: string,
   dashboardRoute: string,
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> }, // required
   updatingIndex: number,
) {

   const dashboardBtnFormat = `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute;
   const validatedCondition = condition;
   console.log("🚀 ~ validatedDashboardRoute:", validatedDashboardRoute)
   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat)
   console.log("🚀 ~ validatedCondition:", validatedCondition)


   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "repeated_task_status", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }


   const allowedCondition = ["completed", "missed", "deleted"];
   if (!allowedCondition.includes(validatedCondition)) {
      console.error(`Invalid column name: ${validatedCondition}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "work", "personal", "time_bound", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      // Check if the ID exists
      const existingTaskQuery = `SELECT id, task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1, user_id = $2 AND ${validatedDashboardRoute} = $3`;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, userId, true]);
      console.log("🚀 ~ initial task details:", existingTaskResult.rows);

      const taskId = existingTaskResult.rows[0].id;
      console.log("🚀 ~ taskId:", taskId)

      if (existingTaskResult.rows.length > 0) {
         // Task exists, prepare the update query
         const updatedTaskFormat = JSON.stringify(taskDetails);
         console.log("🚀 ~ updatedTaskFormat:", updatedTaskFormat)


         if (dashboardBtnFormat === "repeated_task" && (validatedCondition === "missed" || validatedCondition === "completed")) {
            console.log("repeated task updating started")
            const updateTaskAttributeQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1 WHERE id = $2 , user_id = $3 AND ${validatedDashboardRoute} = $4`;
            const updateTaskAttributeValues = [updatedTaskFormat, updatingIndex, userId, true];
            const updateMainTable = await client.query(updateTaskAttributeQuery, updateTaskAttributeValues);
            console.log("🚀 ~ updateMainTable:", updateMainTable)
            if (updateMainTable) {
               const updateTaskSecondaryQuery = `INSERT INTO repeated_task_status (task_id, user_id, ${validatedCondition}) VALUES ($1, $2, $3)`;

               const updateTaskSecondaryValues = [taskId, userId, true];
               const updateSecondaryTable = await client.query(updateTaskSecondaryQuery, updateTaskSecondaryValues);
               console.log("🚀 ~ updateSecondaryTable:", updateSecondaryTable)
               return true
            } else {
               console.log("main repeated table was not updated")
            }
         } else {
            console.log("other  task updating started")
            const updateTaskAttributeQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1, ${validatedCondition} = $2 WHERE id = $3, user_id = $4 AND ${validatedDashboardRoute} = $5`;
            const updateTaskAttributeValues = [updatedTaskFormat, true, updatingIndex, userId, true];
            const updateTaskCondition = await client.query(updateTaskAttributeQuery, updateTaskAttributeValues);
            console.log("🚀 ~ updateTaskCondition:", updateTaskCondition);
            return true;
         }

      }

      // ID not found
      console.warn(`No task found with id ${updatingIndex} in ${dashboardBtnFormat}.`);
      return false;
   } catch (error: unknown) {
      console.error("Error updating task condition for task attributes:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
}

export async function completeTaskDetails(
   userId: number,
   dashboardBtn: string,
   dashboardRoute: string
) {
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

   const allowedRoutes = ["high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline", "completed", "missed"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline") {
         taskQuery = `SELECT id,task_data->>'title' AS title , timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} IS NOT NULL ,user_id = $1 AND deleted = true  ORDER BY id ASC`
      } else if (dashboardBtnFormat === "repeated_task") {
         taskQuery = `SELECT  id, task_data ->> 'title' AS title, timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} = true,user_id = $1 AND deleted = true  ORDER BY timestamp ASC`
      } else {
         taskQuery = `SELECT  id, task_data ->> 'title' AS title, timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} = true,user_id = $1 AND deleted = true  ORDER BY timestamp ASC`
      }

      const taskResult = await client.query(taskQuery, [userId]);
      const row = taskResult.rows;
      return row;
   } catch (error: unknown) {
      console.error("Error updating task condition for complete task details:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
}