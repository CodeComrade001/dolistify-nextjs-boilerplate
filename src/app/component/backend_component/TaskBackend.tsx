/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/Dashboard/backend.ts
'use server';

import { createClient } from "@/app/utils/supabase/db";
type parsedTaskType = {
   title: string;
   subtasks: Array<{ id: number; description: string }>;
   status: Array<{ id: number; missed: boolean | null; completed: boolean | null }>;
};


// Allowed names for safety
const ALLOWED_TABLES = ["personal_task", "repeated_task", "repeated_task_status", "time_bound_task", "work_task"];
const ALLOWED_ROUTES = ["personal", "work", "high_priority", "archived", "main", "repeated", "time_deadline", "date_deadline"];

export default async function insertTask(
   dashboardBtn: string,
   dashboardRoute: string,
   taskDetails: {
      title: string;
      subtasks: Array<{ id: number; description: string }>;
      status: Array<{ id: number; completed: boolean | null; missed: boolean | null }>;
   },
   userDeadline?: string | number
): Promise<boolean> {

   const supabase = await createClient();

   try {
      const table = `${dashboardBtn}_task`;

      if (!ALLOWED_TABLES.includes(table) || !ALLOWED_ROUTES.includes(dashboardRoute)) {
         console.error("insertTask: Invalid table or column");
         return false;
      }

      // Build payload
      const payload: Record<string, any> = {
         task_data: taskDetails,
      };
      console.log("🚀 ~ payload:", payload)

      if (userDeadline) {
         let col: "time_deadline" | "date_deadline" = "date_deadline";
         let val: string;
         if (typeof userDeadline === "number") {
            col = "time_deadline";
            val = `${userDeadline}:00`;
         } else if (/^\d{2}:\d{2}$/.test(userDeadline)) {
            col = "time_deadline";
            val = userDeadline;
         } else {
            col = "date_deadline";
            val = userDeadline.toString();
         }
         payload[col] = val;
      } else {
         payload[dashboardRoute] = true;
      }

      const { error } = await supabase.from(table).insert(payload);
      console.log("🚀 ~ error:", error)
      if (error) {
         console.error("insertTask supabase error:", error);
         return false;
      }
      return true;
   } catch (err) {
      console.error("insertTask caught error:", err);
      return false;
   }
}

export async function updateTaskInformation(
   dashboardBtn: string,
   taskDetails: {
      title: string;
      subtasks: Array<{ id: number; description: string }>;
      status: Array<{ id: number; completed: boolean | null; missed: boolean | null }>;
   },
   updatingIndex: string
): Promise<boolean> {
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.includes(table)) {
         console.error("updateTaskInformation: Invalid table");
         return false;
      }

      const { data, error } = await supabase
         .from(table)
         .update({ task_data: taskDetails })
         .match({ id: updatingIndex });
      console.log("🚀 ~ data:", data)

      if (error) {
         console.error("updateTaskInformation supabase error:", error);
         return false;
      }
      return true;
   } catch (err) {
      console.error("updateTaskInformation caught error:", err);
      return false;
   }
}

export async function showSavedTaskSummaryView(
   dashboardBtn: string,
   dashboardRoute: string
) {
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.includes(table) || !ALLOWED_ROUTES.includes(dashboardRoute)) {
         console.error("showSavedTaskSummaryView: Invalid table or column");
         return false;
      }

      // Base selector (always select id, title, created_at)
      let query = supabase
         .from(table)
         .select("id, task_data->>title , created_at");

      // Special cases
      if (["time_deadline", "date_deadline"].includes(dashboardRoute)) {
         query = query
            .not(dashboardRoute, "is", null)
            .order("id", { ascending: true });
      } else if (dashboardRoute === "completed") {
         query = supabase
            .from(table)
            .select("id, task_data->>title , created_at")
            .eq("completed", true)
            .order("id", { ascending: true });
      } else if (
         dashboardBtn === "repeated" &&
         ["missed", "completed"].includes(dashboardRoute)
      ) {
         // For repeated tasks with missed/completed flags, join via repeated_task_status
         const { data, error } = await supabase
            .from("repeated_task_status")
            .select("task:rt(id, task_data->>title , created_at)")
            .eq(dashboardRoute, true)
            .order("task_id", { ascending: true });

         if (error) throw error;
         // Mapping out the inner `task` object (already sorted by task_id)
         return data.map;
      } else {
         // Default case: filter by the given boolean column (e.g., "main", "work", etc.)
         query = query
            .eq(dashboardRoute, true)
            .order("id", { ascending: true });
      }

      // Execute and return
      const { data, error } = await query;
      if (error) throw error;
      return data;
   } catch (err) {
      console.error("showSavedTaskSummaryView caught error:", err);
      return false;
   }
}

export async function showSavedTaskDetailView(
   taskId: string,         // assume "id" is a UUID
   dashboardBtn: string,
   dashboardRoute: string
): Promise<parsedTaskType | null> {
   const supabase = await createClient();
   try {
      if (!taskId || !dashboardBtn || !dashboardRoute) return null;

      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.includes(table) || !ALLOWED_ROUTES.includes(dashboardRoute)) {
         console.error("showSavedTaskDetailView: Invalid inputs");
         return null;
      }

      // Repeated + status join (if you ever need it)
      if (dashboardBtn === "repeated" && ["missed", "completed"].includes(dashboardRoute)) {
         const { data, error } = await supabase
            .from("repeated_task_status")
            .select(`task:rt(task_data->>title, task_data->>subtasks, task_data->>status)`)
            .eq(dashboardRoute, true)
            .eq("rt.id", taskId)
            .single();
         if (error) throw error;
         const { title, subtasks, status } = data.task[0];
         const dataFormat = {
            title,
            subtasks: JSON.parse(subtasks),
            status: JSON.parse(status),
         };
         return dataFormat;
      }

      // Default case: filter on “id” and on the boolean column named by dashboardRoute
      const { data, error } = await supabase
         .from(table)
         .select("task_data->>title, task_data->>subtasks , task_data->>status")
         .eq("id", taskId)             // ◀️ filter by the actual primary key column
         .eq(dashboardRoute, true)     // ◀️ e.g. “high_priority = true”
         .single();

      console.log("🚀 ~ data:", data);

      if (error) return null;
      const dataFormat = {
         ...data,
         subtasks: JSON.parse(data.subtasks),
         status: JSON.parse(data.status),
      };
      return dataFormat;
   } catch (err) {
      console.error("showSavedTaskDetailView caught error:", err);
      return null;
   }
}


// Assume ALLOWED_TABLES = ["personal_task","work_task", …]
export async function getUserSearchResult(
  query: string,
  dashboardBtn: string
): Promise<{ id: string; title: string }[] | null> {
  const supabase = await createClient();

  // 1) Refuse empty or whitespace‐only search
  if (!query.trim()) {
    return [];
  }

  // 2) Build and validate the table name
  const table = `${dashboardBtn}_task`;
  if (!ALLOWED_TABLES.includes(table)) {
    console.error("getUserSearchResult: Invalid table →", table);
    return null;
  }

  // 3) Escape any % or , that might break the PostgREST `.or(...)` syntax
  const safeQuery = query.replace(/%/g, "\\%").replace(/,/g, "\\,");

  try {
    const { data, error } = await supabase
      .from(table)
      .select("id, task_data->>title")
      .or(
        `task_data->>title.ilike.%${safeQuery}%,` +
        `task_data->>subtasks.ilike.%${safeQuery}%`
      );

    if (error) {
      console.error("getUserSearchResult supabase error:", error);
      return null;
    }

    // `data` is now an array of `{ id: string; title: string }`
    return data;
  } catch (err) {
    console.error("getUserSearchResult caught exception:", err);
    return null;
  }
}


export async function getTaskDetailsForPreview(
   taskId: string,
   dashboardBtn: string
) {
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.includes(table)) {
         console.error("getTaskDetailsForPreview: Invalid table");
         return false;
      }

      const { data, error } = await supabase
         .from(table)
         .select("task_data->>title , task_data->>subtasks , task_data->>status ")
         .match({ id: taskId })
         .single();

      if (error) throw error;
      const { title, subtasks, status } = data
      const dataFormat = {
         title,
         subtasks: JSON.parse(subtasks),
         status: JSON.parse(status),
      };
      return dataFormat;
   } catch (err) {
      console.error("getTaskDetailsForPreview caught error:", err);
      return false;
   }
}

// --------------- taskPositionRequirement ---------------
export async function taskPositionRequirement(
   dashboardBtn: string,
   dashboardRoute: string
): Promise<any[] | false> {
   console.log("🚀 ~ taskPositionRequirement:", taskPositionRequirement)
   console.log("🚀 ~ taskPositionRequirement function has started ===> :",)
   console.log("🚀 ~ dashboardBtn:", dashboardBtn)
   console.log("🚀 ~ dashboardRoute:", dashboardRoute)
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}`;
      console.log("🚀 ~ table:", table)

      // Base query: select id and created_at, but sort by id
      let query = supabase
         .from(table)
         .select("id, created_at ")
         .order("id", { ascending: true });

      if (["time_deadline", "date_deadline"].includes(dashboardRoute)) {
         query = query
            .not(dashboardRoute, "is", null)
            .order("id", { ascending: true });
      } else if (dashboardRoute === "completed") {
         query = supabase
            .from(table)
            .select("id, created_at ")
            .eq("completed", true)
            .order("id", { ascending: true });
      } else if (dashboardBtn === "repeated_task" && dashboardRoute === "time_bound") {
         query = supabase
            .from(table)
            .select("id, created_at ")
            .eq("time_bound", true)
            .not("date_deadline", "is", null)
            .not("time_deadline", "is", null)
            .order("id", { ascending: true });
      } else if (
         dashboardBtn === "repeated_task" &&
         ["missed", "completed"].includes(dashboardRoute)
      ) {
         // 1) Fetch all matching task IDs
         const { data: statusRows, error: statusError } = await supabase
            .from("repeated_task_status")
            .select("task_id")
            .eq(dashboardRoute, true)
            .order("task_id", { ascending: true });

         if (statusError) {
            console.error("Error fetching repeated_task_status:", statusError);
            return false;
         }

         const ids = statusRows?.map(r => r.task_id) ?? [];
         if (ids.length === 0) return [];

         // 2) Fetch those rows from the main table, sorted by id
         const { data: rows, error: rowsError } = await supabase
            .from(table)
            .select("id, created_at ")
            .in("id", ids)
            .order("id", { ascending: true });

         if (rowsError) {
            console.error("Error fetching tasks by IDs:", rowsError);
            return false;
         }
         return rows;
      }

      // Execute standard query
      const { data, error } = await query;
      if (error) {
         console.error("Error executing query:", error);
         return false;
      }
      return data ?? [];
   } catch (err) {
      console.error("taskPositionRequirement caught error:", err);
      return false;
   }
}


// --------------- TaskAttributes ---------------
export async function TaskAttributes(
   condition: "missed" | "completed" | "deleted",
   dashboardBtn: string,
   dashboardRoute: string,
   taskDetails: { title: string; subtasks: any[]; status: any[] },
   updatingIndex: string
): Promise<boolean> {
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.concat("repeated_task_status").includes(table)) {
         console.error("TaskAttributes: invalid table");
         return false;
      }
      if (!["missed", "completed", "deleted"].includes(condition)) {
         console.error("TaskAttributes: invalid condition");
         return false;
      }
      if (!ALLOWED_ROUTES.includes(dashboardRoute)) {
         console.error("TaskAttributes: invalid route");
         return false;
      }

      // 1) Ensure task exists
      const { data: existing, error: e1 } = await supabase
         .from(table)
         .select("id")
         .match({ id: updatingIndex, [dashboardRoute]: true })
         .single();
      if (e1 || !existing) {
         console.warn("TaskAttributes: no matching task");
         return false;
      }

      // 2) Update main task_data (and flag for non-repeated)
      if (!(dashboardBtn === "repeated_task" && (condition === "missed" || condition === "completed"))) {
         const { error: e2 } = await supabase
            .from(table)
            .update({ task_data: taskDetails, [condition]: true })
            .match({ id: updatingIndex, [dashboardRoute]: true });
         if (e2) throw e2;
         return true;
      }

      // 3) For repeated_task + missed/completed: two-step
      // 3a) update main table
      const { error: e3 } = await supabase
         .from(table)
         .update({ task_data: taskDetails })
         .match({ id: updatingIndex, [dashboardRoute]: true });
      if (e3) throw e3;

      // 3b) insert into repeated_task_status
      const { error: e4 } = await supabase
         .from("repeated_task_status")
         .insert([{ task_id: existing.id, [condition]: true }]);
      if (e4) throw e4;

      return true;
   } catch (err) {
      console.error("TaskAttributes caught error:", err);
      return false;
   }
}

// --------------- deletedTaskDetails ---------------
export async function deletedTaskDetails(
   dashboardBtn: string,
   dashboardRoute: string
): Promise<any[] | false> {
   const supabase = await createClient();
   try {
      const table = `${dashboardBtn}_task`;
      if (!ALLOWED_TABLES.includes(table) || !ALLOWED_ROUTES.includes(dashboardRoute)) {
         console.error("deletedTaskDetails: invalid table or route");
         return false;
      }

      let query = supabase
         .from(table)
         .select("id, task_data->>title AS title, created_at")
         .eq("deleted", true)
         .order("created_at", { ascending: true });

      if (["time_deadline", "date_deadline"].includes(dashboardRoute)) {
         query = query.not(dashboardRoute, "is", null);
      } else {
         query = query.eq(dashboardRoute, true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data!;
   } catch (err) {
      console.error("deletedTaskDetails caught error:", err);
      return false;
   }
}

// --------------- fetchUserNotification ---------------
export interface Notification { id: number; notification_data: any }
export interface DayNotification { date: string; Notification: Notification[] }

export async function fetchUserNotification(
): Promise<{ notification_details: DayNotification[] } | false> {
   const supabase = await createClient();
   try {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);

      const formatDate = (d: Date) => d.toISOString().slice(0, 10);
      const notification_details: DayNotification[] = [];

      for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
         const dayStart = `${formatDate(d)}T00:00:00Z`;
         const dayEnd = `${formatDate(d)}T23:59:59Z`;
         const { data, error } = await supabase
            .from("user_notification")
            .select("id, notification_data")
            .gte("created_at", dayStart)
            .lte("created_at", dayEnd);
         if (error) throw error;

         notification_details.push({
            date: formatDate(d),
            Notification: data ?? [],
         });
      }

      return { notification_details };
   } catch (err) {
      console.error("fetchUserNotification caught error:", err);
      return false;
   }
}

// --------------- storeUserNotification ---------------
export async function storeUserNotification(
   userNotificationData: string
): Promise<boolean> {
   const supabase = await createClient();
   try {
      const { error } = await supabase
         .from("user_notification")
         .insert([{ notification_data: userNotificationData }]);
      if (error) throw error;
      return true;
   } catch (err) {
      console.error("storeUserNotification caught error:", err);
      return false;
   }
}

// --------------- getUserNotificationCount ---------------
export async function getUserNotificationCount(
): Promise<number | false> {
   const supabase = await createClient();
   try {
      const now = new Date();
      const dayOfWeek = (now.getDay() + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - dayOfWeek);

      let total = 0;
      for (let d = new Date(monday); d <= now; d.setDate(d.getDate() + 1)) {
         const dayStart = `${d.toISOString().slice(0, 10)}T00:00:00Z`;
         const dayEnd = `${d.toISOString().slice(0, 10)}T23:59:59Z`;
         const { count, error } = await supabase
            .from("user_notification")
            .select("*", { count: "exact", head: true })
            .gte("created_at", dayStart)
            .lte("created_at", dayEnd);
         if (error) throw error;
         total += count ?? 0;
      }
      return total;
   } catch (err) {
      console.error("getUserNotificationCount caught error:", err);
      return false;
   }
}