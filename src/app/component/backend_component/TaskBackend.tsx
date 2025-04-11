'use server';
import { Pool } from 'pg';

interface Notification {
   id: number;
   notification_data: string;
}

interface DayNotification {
   date: string;
   Notification: Notification[];
}

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
      // Changed comment: now verifying user exists by id instead of email
      const userQuery = 'SELECT id FROM users WHERE id = $1';
      const userResult = await client.query(userQuery, [userId]);

      if (userResult.rowCount === 0) {
         console.error('User not found with id:', userId);
         return false;
      }

      // Prepare and execute the query
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
         // Corrected query: removed commas in WHERE clause (if any) by proper formatting
         taskQuery = `INSERT INTO ${dashboardBtnFormat} (user_id, task_data, ${columnDeadline}) VALUES ($1, $2::jsonb, $3) RETURNING *;`;
         taskValues = [userId, JSON.stringify(taskDetails), formattedDeadline];
      } else {
         // Insert without deadline; query remains the same
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
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> },
   updatingIndex: number,
) {
   console.log("🚀 ~ userId:", userId)
   console.log("🚀 ~ updatingIndex:", updatingIndex)
   console.log("🚀 ~ taskDetails:", taskDetails)
   const dashboardBtnFormat = `${dashboardBtn}_task`;
   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }
   const client = await pool.connect();
   try {
      // Changed: replaced comma with AND in WHERE clause
      const existingTaskQuery = `SELECT task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1 AND user_id = $2 `;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, userId]);
      console.log("🚀 ~ initial task details:", existingTaskResult.rows);

      if (existingTaskResult.rows.length > 0) {
         // Task exists, prepare the update query
         const updatedTaskFormat = JSON.stringify(taskDetails);

         // Changed: replaced comma with AND in WHERE clause
         const updateTaskQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1 WHERE id = $2 AND user_id = $3 `;
         const updateTaskValues = [updatedTaskFormat, updatingIndex, userId];


         const updatedTaskResult = await client.query(updateTaskQuery, updateTaskValues);
         // check if result changes
         // Check if update affected any rows
         if (updatedTaskResult.rowCount != null && updatedTaskResult.rowCount > 0) {
            console.log("🚀 ~ updatedTaskResult.rowCount:", updatedTaskResult.rowCount)
            return true;
         } else {
            console.warn("Update did not affect any rows.");
            return false;
         }
      }
      console.log(`No task found with id ${updatingIndex} in ${dashboardBtnFormat}.`);
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
   } else if (dashboardBtn === "repeated" && (dashboardRoute === "personal" || dashboardRoute === "work" || dashboardRoute === "time_bound")) {
      dashboardBtnFormat = `${dashboardBtn}_task`;
      validatedDashboardRoute = dashboardRoute;
   } else {
      dashboardBtnFormat = dashboardBtn === "" ? "personal_task" : `${dashboardBtn}_task`;
      validatedDashboardRoute = dashboardRoute === "" ? "high_priority" : dashboardRoute;
   }

   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ showSavedTaskSummaryView ~ tableRouteLabel:", validatedDashboardRoute);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (validatedDashboardRoute === "time_deadline" || validatedDashboardRoute === "date_deadline") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else if (dashboardBtnFormat === "completed_task") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND completed = true`;
      } else if (dashboardBtnFormat === "missed_task") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND missed = true`;
      } else if (dashboardBtnFormat === "repeated_task" && validatedDashboardRoute === "time_bound") {
         // Changed comma to AND
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} = true AND (user_deadline IS NOT NULL OR date_deadline IS NOT NULL)`;
      } else if (dashboardBtnFormat === "repeated_task" && (validatedDashboardRoute === "missed" || validatedDashboardRoute === "completed")) {
         taskQuery = `SELECT 
         rt.id, 
         rt.task_data->>'title' AS title, 
         rt.timestamp
         FROM ${dashboardBtnFormat} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
         WHERE rts.${validatedDashboardRoute} = true AND rt.user_id = $1; 
       `;
      } else {
         // Corrected template literal for validatedDashboardRoute
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp FROM ${dashboardBtnFormat} WHERE user_id = $1 AND ${validatedDashboardRoute} = true`;
      }
      const taskResult = await client.query(taskQuery, [userId]);

      const row = taskResult.rows;
      console.log("🚀 ~ showSavedTaskSummaryView ~ row:", row)
      return row;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task for show saved task details:", errorMessage);
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

   console.log("🚀 ~ showSavedTaskDetailView ~ id:", id);
   if (!id || dashboardBtnFormat === "" || validatedDashboardRoute === "") {
      console.log("Invalid input parameters");
      return false; // Added early return for invalid parameters
   }

   if (typeof id !== "number" || typeof dashboardBtnFormat !== "string" || typeof validatedDashboardRoute !== "string") {
      console.log("Invalid type of data");
      return false;
   }

   console.log("🚀 ~ showSavedTaskDetailView ~ id:", id);
   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ showSavedTaskSummaryView ~ tableRouteLabel:", validatedDashboardRoute);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.log(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (validatedDashboardRoute === "time_deadline" || validatedDashboardRoute === "date_deadline") {
         // Changed comma to AND in WHERE clause
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks, task_data->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 AND user_id = $2 AND ${validatedDashboardRoute} IS NOT NULL`;
      } else if (dashboardBtnFormat === "repeated_task" && (validatedDashboardRoute === "missed" || validatedDashboardRoute === "completed")) {
         taskQuery = `SELECT 
         rt.id, 
         rt.task_data->>'title' AS title, 
         rt.task_data->>'subtasks' AS subtasks, 
         rt.task_data->>'status' AS status 
         FROM ${dashboardBtnFormat} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
         WHERE rts.${validatedDashboardRoute} = true AND rt.id = $1 AND rt.user_id = $2
         `;
      } else {
         // Changed comma to AND in WHERE clause
         taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks, task_data->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 AND user_id = $2 AND ${validatedDashboardRoute} = true`;
      }

      const taskResult = await client.query(taskQuery, [id, userId]);
      const row = taskResult.rows[0];
      console.log("🚀 ~ showSavedTaskDetailView ~ row:", row);
      return row;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "Unknown Message";
      console.log("Error fetching task:", errorMessage);
      throw error;
   } finally {
      client.release();
   }
}

export async function taskPositionRequirement(
   userId: number,
   dashboardBtn: string,
   dashboardRoute: string
) {
   console.log("🚀 ~ userId:", userId)

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtn)) {
      console.log(`Table not found or wrong table format: ${dashboardBtn}`);
      return false;
   }

   const allowedRoutes = ["completed", "high_priority", "personal_task", "work_task", "time_bound_task", "archived", "missed", "main", "time_deadline", "date_deadline", "personal", "work", "time_bound"];
   if (!allowedRoutes.includes(dashboardRoute)) {
      console.log(`Invalid column name: ${dashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      let taskQuery: string;
      if (dashboardRoute === "time_deadline" || dashboardRoute === "date_deadline") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = $1 AND ${dashboardRoute} IS NOT NULL  ORDER BY timestamp ASC`;
      } else if (dashboardBtn === "completed_task") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardRoute} WHERE user_id = $1 AND completed = true  ORDER BY timestamp ASC`;
      } else if (dashboardBtn === "repeated_task" && dashboardRoute === "time_bound") {
         // Changed comma to AND in WHERE clause
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = $1 AND ${dashboardRoute} = true AND (user_deadline IS NOT NULL OR date_deadline IS NOT NULL)`;
      } else if (dashboardBtn === "missed_task") {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardRoute} WHERE user_id = $1 AND missed = true  ORDER BY timestamp,id ASC`;
      } else if (dashboardBtn === "repeated_task" && (dashboardRoute === "missed" || dashboardRoute === "completed")) {
         taskQuery = `SELECT 
         rt.id,  
         rt.timestamp
         FROM ${dashboardBtn} rt
         JOIN repeated_task_status rts ON rt.id = rts.task_id
         WHERE rts.${dashboardRoute} = true`;
      } else {
         taskQuery = `SELECT id, timestamp as timeAdded FROM ${dashboardBtn} WHERE user_id = $1 AND ${dashboardRoute} = true  ORDER BY timestamp ASC`;
      }
      console.log("🚀 ~ taskQuery:", taskQuery)

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
   taskDetails: { title: string; subtasks: Array<{ id: number; description: string }>; status: Array<{ id: number; completed: boolean | null; missed: boolean | null }> },
   updatingIndex: number,
) {

   const dashboardBtnFormat = `${dashboardBtn}_task`;
   const validatedDashboardRoute = dashboardRoute;
   const validatedCondition = condition;
   console.log("🚀 ~ validatedDashboardRoute:", validatedDashboardRoute);
   console.log("🚀 ~ dashboardBtnFormat:", dashboardBtnFormat);
   console.log("🚀 ~ validatedCondition:", validatedCondition);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "repeated_task_status", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.error(`Invalid table name: ${dashboardBtnFormat}`);
      return false;
   }

   const allowedCondition = ["completed", "missed", "deleted"];
   if (!allowedCondition.includes(validatedCondition)) {
      console.error(`Invalid condition: ${validatedCondition}`);
      return false;
   }

   const allowedRoutes = ["high_priority", "archived", "work", "personal", "time_bound", "main", "repeated", "time_deadline", "date_deadline"];
   if (!allowedRoutes.includes(validatedDashboardRoute)) {
      console.error(`Invalid column name: ${validatedDashboardRoute}`);
      return false;
   }

   const client = await pool.connect();
   try {
      // Changed: replaced comma with AND in WHERE clause
      const existingTaskQuery = `SELECT id, task_data->>'subtasks' AS subtasks FROM ${dashboardBtnFormat} WHERE id = $1 AND user_id = $2 AND ${validatedDashboardRoute} = $3`;
      const existingTaskResult = await client.query(existingTaskQuery, [updatingIndex, userId, true]);
      console.log("🚀 ~ initial task details:", existingTaskResult.rows);

      if (existingTaskResult.rows.length > 0) {
         const taskId = existingTaskResult.rows[0].id;
         console.log("🚀 ~ taskId:", taskId);

         const updatedTaskFormat = JSON.stringify(taskDetails);
         console.log("🚀 ~ updatedTaskFormat:", updatedTaskFormat);

         if (dashboardBtnFormat === "repeated_task" && (validatedCondition === "missed" || validatedCondition === "completed")) {
            console.log("repeated task updating started");
            // Changed: replaced comma with AND in WHERE clause
            const updateTaskAttributeQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1 WHERE id = $2 AND user_id = $3 AND ${validatedDashboardRoute} = $4`;
            const updateTaskAttributeValues = [updatedTaskFormat, updatingIndex, userId, true];
            const updateMainTable = await client.query(updateTaskAttributeQuery, updateTaskAttributeValues);
            console.log("🚀 ~ updateMainTable:", updateMainTable);
            if (updateMainTable) {
               const updateTaskSecondaryQuery = `INSERT INTO repeated_task_status (task_id, user_id, ${validatedCondition}) VALUES ($1, $2, $3)`;
               const updateTaskSecondaryValues = [taskId, userId, true];
               const updateSecondaryTable = await client.query(updateTaskSecondaryQuery, updateTaskSecondaryValues);
               console.log("🚀 ~ updateSecondaryTable:", updateSecondaryTable);
               return true;
            } else {
               console.log("main repeated table was not updated");
            }
         } else {
            console.log("other task updating started");
            // Changed: replaced comma with AND in WHERE clause
            const updateTaskAttributeQuery = `UPDATE ${dashboardBtnFormat} SET task_data = $1, ${validatedCondition} = $2 WHERE id = $3 AND user_id = $4 AND ${validatedDashboardRoute} = $5`;
            const updateTaskAttributeValues = [updatedTaskFormat, true, updatingIndex, userId, true];
            const updateTaskCondition = await client.query(updateTaskAttributeQuery, updateTaskAttributeValues);
            console.log("🚀 ~ updateTaskCondition:", updateTaskCondition);
            return true;
         }
      }

      console.warn(`No task found with id ${updatingIndex} in ${dashboardBtnFormat}.`);
      return false;
   } catch (error: unknown) {
      console.error("Error updating task condition for task attributes:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
}

export async function deletedTaskDetails(
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
         // Changed: replaced comma with AND in WHERE clause
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} IS NOT NULL AND user_id = $1 AND deleted = true ORDER BY id ASC`;
      } else if (dashboardBtnFormat === "repeated_task") {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} = true AND user_id = $1 AND deleted = true ORDER BY timestamp ASC`;
      } else {
         taskQuery = `SELECT id, task_data->>'title' AS title, timestamp as timestamp FROM ${dashboardBtnFormat} WHERE ${validatedDashboardRoute} = true AND user_id = $1 AND deleted = true ORDER BY timestamp ASC`;
      }

      const taskResult = await client.query(taskQuery, [userId]);
      const row = taskResult.rows;
      return row;
   } catch (error: unknown) {
      console.error("Error updating task condition for deleted task details:", error instanceof Error ? error.message : "Unknown error");
      return false;
   } finally {
      client.release();
   }
}

export async function fetchUserNotification(userId: number) {
   console.log("🚀 ~ userNotification ~ userId:", userId);
   const client = await pool.connect();
   try {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // Monday => 0, Tuesday => 1, …, Sunday => 6
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);

      // Helper to format a Date to 'YYYY-MM-DD'
      const formatDate = (date: Date) => date.toISOString().slice(0, 10);
      const todayStr = formatDate(now);
      const mondayStr = formatDate(monday);
      console.log("Calculated week: Monday =", mondayStr, "to Today =", todayStr);

      // Declare notification_data as an array of DayNotification objects
      const notification_details: DayNotification[] = [];

      // Iterate from Monday to today
      for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
         const dateStr = formatDate(d);

         const query = `
         SELECT id, notification_data 
         FROM user_notification
         WHERE user_id = $1
           AND timestamp::date = $2;
       `;
         const { rows } = await client.query(query, [userId, dateStr]);
         console.log("🚀 ~ fetchUserNotification ~ rows:", rows)

         // Map the returned rows into Notification objects
         const notifications: Notification[] = rows.map((row: Notification) => ({
            id: row.id,
            notification_data: row.notification_data,
         }));

         // Create a result object for this day
         const dayResult: DayNotification = {
            date: dateStr,
            Notification: notifications,
         };
         notification_details.push(dayResult);
      }
      console.log("🚀 ~ fetchUserNotification ~ notification_data:", notification_details)

      return { notification_details };
   } catch (error: unknown) {
      console.log("Error fetching notification in database:", error);
      throw error;
   } finally {
      client.release();
   }
}



export async function storeUserNotification(userId: number, userNotificationData: string) {
   console.log("🚀 ~ userNotification ~ userId:", userId);
   const client = await pool.connect();
   try {
      // Fixed: Added a comma between $1 and $2 in the VALUES clause.
      const notificationQuery = await client.query(
         "INSERT INTO user_notification (user_id, notification_data) VALUES ($1, $2) RETURNING id",
         [userId, userNotificationData]
      );
      const message: boolean = notificationQuery.rows.length > 0 ? true : false;
      return message;
   } catch (error: unknown) {
      console.log("Error fetching notification in database : ", error);
      return false;
   } finally {
      client.release();
   }
}

export async function getUserNotificationCount(userId: number) {
   console.log("🚀 ~ userNotification ~ userId:", userId);
   const client = await pool.connect();
   try {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7; // Monday => 0, Tuesday => 1, …, Sunday => 6
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);

      // Helper to format a Date to 'YYYY-MM-DD'
      const formatDate = (date: Date) => date.toISOString().slice(0, 10);
      const todayStr = formatDate(now);
      const mondayStr = formatDate(monday);
      console.log("Calculated week: Monday =", mondayStr, "to Today =", todayStr);

      // Declare notification_data as an array of objects with a count property
      const notification_data: { count: number }[] = [];

      // Iterate from Monday to today
      for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
         const dateStr = formatDate(d);

         const query = `
            SELECT COUNT(*) AS notification_count
            FROM user_notification
            WHERE user_id = $1
              AND timestamp::date = $2;
         `;
         const { rows } = await client.query(query, [userId, dateStr]);
         console.log("🚀 ~ notificationCount ~ rows:", rows);
         const dayCount = rows[0];
         console.log("🚀 ~ notificationCount ~ dayCount:", dayCount);

         // Create a result object for this day and ensure the count is a number
         const dayResult = {
            count: Number(dayCount.notification_count),
         };
         console.log("🚀 ~ getUserNotificationCount ~ dayResult:", dayResult);

         notification_data.push(dayResult);
      }
      console.log("🚀 ~ getUserNotificationCount ~ notification_data:", notification_data);

      // Sum up all daily counts
      const totalCount = notification_data.reduce((acc, item) => acc + item.count, 0);
      return totalCount;
   } catch (error: unknown) {
      console.log("Error fetching notification in database:", error);
      throw error;
   } finally {
      client.release();
   }
}

export async function getUserSearchResult(id: number, query: string, dashboardBtn: string) {
   console.log("🚀 ~ getUserSearchResult ~ dashboardBtn:", dashboardBtn);
   console.log("🚀 ~ getUserSearchResult ~ query:", query);
   console.log("🚀 ~ getUserSearchResult ~ id:", id);

   const dashboardBtnFormat = `${dashboardBtn}_task`;
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];

   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const client = await pool.connect();
   try {
      const sqlQuery =
         `SELECT id, task_data->>'title' AS title
      FROM ${dashboardBtnFormat}
      WHERE user_id = $1
      AND (
          (task_data->>'title') LIKE '%' || $2 || '%'
          OR EXISTS (
             SELECT 
             FROM jsonb_array_elements(task_data->'subtasks') AS sub
             WHERE sub->>'description' LIKE '%' || $2 || '%'
          )
      );
   `;
      const result = await client.query(sqlQuery, [id, query]);
      console.log("🚀 ~ getUserSearchResult ~ result.rows:", result.rows)
      return result.rows;
   } catch (error: unknown) {
      console.log("Error fetching data from database:", error);
      throw error;
   } finally {
      client.release();
   }
}


export async function getTaskDetailsForPreview(userId: number, taskId: number, dashboardBtn: string) {

   const dashboardBtnFormat = `${dashboardBtn}_task`;

   if (!userId || !taskId || dashboardBtnFormat === "") {
      console.log("Invalid input parameters");
      return false; // Added early return for invalid parameters
   }

   console.log("🚀 ~ showSavedTaskSummaryView ~ dashboardBtnFormat:", dashboardBtnFormat);

   // Validate table and column names
   const allowedDashboard = ["personal_task", "repeated_task", "completed_task", "missed_task", "time_bound_task", "work_task"];
   if (!allowedDashboard.includes(dashboardBtnFormat)) {
      console.log(`Table not found or wrong table format: ${dashboardBtnFormat}`);
      return false;
   }

   const client = await pool.connect();
   try {
      const taskQuery = `SELECT task_data->>'title' as title, task_data->>'subtasks' AS subtasks, task_data->>'status' AS status FROM ${dashboardBtnFormat} WHERE id = $1 AND user_id = $2`
      const taskResult = await client.query(taskQuery, [taskId, userId]);
      const row = taskResult.rows[0];
      console.log("🚀 ~ showSavedTaskDetailView ~ row:", row);
      return row;
   } catch (error: unknown) {
      console.log("Error fetching data from database:", error);
      throw error;
   } finally {
      client.release();
   }
} 