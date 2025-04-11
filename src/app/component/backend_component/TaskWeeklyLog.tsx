import { Pool } from 'pg';

interface DailyLog {
  date: string;
  completed: number;
  missed: number;
  active: number;
  deleted: number;
}

interface WeeklyLog {
  daily: DailyLog[];
  weekly: {
    completed: number;
    missed: number;
    active: number;
    deleted: number;
  };
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

async function testConnection() {
  const client = await pool.connect();
  try {
    console.log("Database connection established successfully.");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to connect to the database:', errorMessage);
  } finally {
    client.release();
  }
}
testConnection();

export async function getWeeklyLog(userId: number, activeDashboardBtn: string): Promise<WeeklyLog> {
  // Build the table name from the activeDashboardBtn, e.g. "personal_task"
  const dashboardTable = `${activeDashboardBtn}_task`;
  console.log("Dashboard table:", dashboardTable);

  // Validate that the table name is allowed to avoid SQL injection.
  const allowedDashboard = ["personal_task", "repeated_task", "time_bound_task", "work_task"];
  if (!allowedDashboard.includes(dashboardTable)) {
    console.error(`Invalid table name: ${dashboardTable}`);
    throw new Error(`Invalid table name: ${dashboardTable}`);
  }

  const client = await pool.connect();
  try {
    // Get current date
    const now = new Date();
    // In JavaScript, getDay() returns 0 for Sunday, 1 for Monday, …, 6 for Saturday.
    // To get Monday (as the beginning of the week), we shift Sunday to index 6.
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday => 0, Tuesday => 1, …, Sunday => 6
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    // Helper to format a Date to 'YYYY-MM-DD'
    const formatDate = (date: Date) => date.toISOString().slice(0, 10);
    const todayStr = formatDate(now);
    const mondayStr = formatDate(monday);
    console.log("Calculated week: Monday =", mondayStr, "to Today =", todayStr);

    // Prepare arrays for daily data and an object for weekly totals.
    const dailyData: DailyLog[] = [];
    const weeklyTotals = { completed: 0, missed: 0, active: 0, deleted: 0 };

    // Loop from Monday to today.
    for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);

      // Query to count statuses for a specific day.
      const query = `
        SELECT
          SUM(CASE WHEN status_elem->>'completed' IS NOT NULL THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN status_elem->>'missed' IS NOT NULL THEN 1 ELSE 0 END) AS missed,
          SUM(CASE WHEN status_elem->>'completed' IS NULL AND status_elem->>'missed' IS NULL THEN 1 ELSE 0 END) AS active,
          SUM(CASE WHEN deleted = true THEN 1 ELSE 0 END) AS deleted
        FROM ${dashboardTable},
        LATERAL jsonb_array_elements(task_data->'status') AS status_elem
        WHERE user_id = $1
          AND timestamp::date = $2;
      `;
      const { rows } = await client.query(query, [userId, dateStr]);
      const dayCounts = rows[0];

      // Ensure that we convert counts to numbers (or default to 0 if null)
      const dayResult: DailyLog = {
        date: dateStr,
        completed: Number(dayCounts.completed) || 0,
        missed: Number(dayCounts.missed) || 0,
        active: Number(dayCounts.active) || 0,
        deleted: Number(dayCounts.deleted) || 0,
      };

      // Update weekly totals
      weeklyTotals.completed += dayResult.completed;
      weeklyTotals.missed += dayResult.missed;
      weeklyTotals.active += dayResult.active;
      weeklyTotals.deleted += dayResult.deleted;

      // Add the day's data to our results array
      dailyData.push(dayResult);
    }

    // Return a JSON object with both daily breakdown and weekly totals.
    return {
      daily: dailyData,
      weekly: weeklyTotals,
    };
  } catch (error: unknown) {
    console.error("Error in getWeeklyLog:", error);
    throw error;
  } finally {
    client.release();
  }
}
