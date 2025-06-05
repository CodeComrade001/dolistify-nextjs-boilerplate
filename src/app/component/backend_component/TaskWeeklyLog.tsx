// src/app/Dashboard/backend.ts
'use server';

import { createClient } from '@/app/utils/supabase/db';

export interface DailyLog {
  date: string;
  completed: number;
  missed: number;
  active: number;
  deleted: number;
}

export interface WeeklyLog {
  daily: DailyLog[];
  weekly: {
    completed: number;
    missed: number;
    active: number;
    deleted: number;
  };
}

// Define interface for Supabase query results
interface QueryRow {
  timestamp: string;
  status_array: string | null;
  deleted: boolean;
}

// Helper to format a Date to 'YYYY-MM-DD'
const formatDate = (d: Date) => d.toISOString().slice(0, 10);
console.log("🚀 ~ formatDate:", formatDate)

/**
 * Fetches daily and weekly counts for a given user/dashboard,
 * using a single Supabase query and then sorting/aggregating in TS.
 */
export async function getWeeklyLog(
  activeDashboardBtn: string
): Promise<WeeklyLog | null> {

  console.log("🚀 ~ activeDashboardBtn:", activeDashboardBtn)
  const table = activeDashboardBtn == "" ? "personal_task" : `${activeDashboardBtn}_task`;
  const allowed = [
    'personal_task',
    'work_task',
    'time_bound_task',
    'repeated_task',
  ];
  if (!allowed.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
    return null
  }

  // Determine week range: Monday through today
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0…Sun=6
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek);

  const supabase = await createClient();
  try {
    // Query with explicit type handling
    const { data: rows, error } = await supabase
      .from(table)
      .select("created_at, task_data->>'status' AS status_array, deleted")
      .gte('created_at', monday.toISOString())
      .lte('created_at', now.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getWeeklyLog supabase error:', error);
      throw error;
    }

    // Initialize daily buckets for each date
    const dailyMap: Record<string, DailyLog> = {};
    for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = formatDate(d);
      dailyMap[dateKey] = {
        date: dateKey,
        completed: 0,
        missed: 0,
        active: 0,
        deleted: 0,
      };
    }

    // Cast rows to QueryRow interface for type safety
    const typedRows = (rows ?? []) as unknown as QueryRow[];

    // Tally each row into its corresponding day
    for (const row of typedRows) {
      const ts = new Date(row.timestamp);
      const dateKey = formatDate(ts);
      const bucket = dailyMap[dateKey];
      if (!bucket) continue; // outside range

      // Count deleted flag
      if (row.deleted) {
        bucket.deleted += 1;
      }

      // Parse status array JSON if exists
      let statuses: Array<{ completed?: boolean; missed?: boolean }> = [];
      if (row.status_array) {
        try {
          statuses = JSON.parse(row.status_array);
        } catch {
          // malformed JSON - treat as empty statuses
        }
      }

      // For each status entry, increment counters
      for (const stat of statuses) {
        if (stat.completed) {
          bucket.completed += 1;
        } else if (stat.missed) {
          bucket.missed += 1;
        } else {
          bucket.active += 1;
        }
      }
    }

    // Build final sorted daily array and weekly totals
    const daily: DailyLog[] = [];
    const weeklyTotals = { completed: 0, missed: 0, active: 0, deleted: 0 };

    Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((day) => {
        daily.push(day);
        weeklyTotals.completed += day.completed;
        weeklyTotals.missed += day.missed;
        weeklyTotals.active += day.active;
        weeklyTotals.deleted += day.deleted;
      });

    return { daily, weekly: weeklyTotals };
  } catch (error) {
    console.log("🚀 ~ error:", error)
    return null
  }
}