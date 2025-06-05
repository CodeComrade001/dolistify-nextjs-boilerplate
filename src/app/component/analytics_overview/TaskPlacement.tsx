"use server";
import { taskPositionRequirement } from "../backend_component/TaskBackend";

// class taskPosition {}
export default async function taskPosition( dashboardBtn: string, dashboardRoute: string): Promise<{ id: number; row: number; column: number }[] | boolean> {
   console.log("🚀 ~ taskPosition ~ dashboardRoute:", dashboardRoute)
   console.log("🚀 ~ taskPosition ~ dashboardBtn:", dashboardBtn)
   console.log("🚀 ~ taskPosition ~ taskPosition:", taskPosition)
   let dashboardBtnFormat: string;
   let validatedDashboardRoute: string | undefined;
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

   try {
      const result = await taskPositionRequirement( dashboardBtnFormat, validatedDashboardRoute);
      console.log("🚀 ~ taskPosition ~ result:", result)

      if (!result) {
         console.log("Error fetching task");
         return false;
      }

      interface taskAddedDataType {
         id: number;
         hrs: number;
         min: number;
         sec: number;
      }

      const taskAddedArray: taskAddedDataType[] = result.map((element) => {
         // Access the 'timeadded' property directly
         const id = element.id;

         // Get time components as strings
         const hrsString: string = new Date(element.created_at).toLocaleString("en-GB", { hour: "2-digit" });
         const minString: string = new Date(element.created_at).toLocaleString("en-US", { minute: "2-digit" });
         const secString: string = new Date(element.created_at).toLocaleString("en-US", { second: "2-digit" });

         // Convert to integers
         const hrs: number = parseInt(hrsString, 10);
         const min: number = parseInt(minString, 10);
         const sec: number = parseInt(secString, 10);

         // Return the object with converted values
         return { id, hrs, min, sec };
      });

      const taskPosition = (() => {
         let lastRow: number = 1; // Initial row position
         let currentHrs: number | null = null; // Tracks the last processed hrs
         let columnOffset: number = 1; // Tracks column position for same hrs

         const result: Array<{ id: number; row: number; column: number }> = [];

         taskAddedArray.forEach((item) => {
            const { id, hrs } = item;
            let row: number;
            let column: number;

            // Logic to determine grid row
            if (hrs !== currentHrs) {
               // New hrs, move to a new row
               currentHrs = hrs;
               row = lastRow; // Move to a new row
               column = 1; // Start column position at 1
               lastRow += 3; // Increment the row for the next different hrs
               columnOffset = 5; // Reset column offset for this row
            } else {
               // Same hrs, stay in the same row
               row = lastRow - 3; // Use the same row as before
               column = columnOffset; // Increment column position
               columnOffset += 4; // Update column offset for the next item
            }

            // Add the processed data to the result array
            result.push({ id, row, column });
         });
         console.log("🚀 ~ taskAddedArray.forEach ~ result:", result)
         return result;
      })();
      return taskPosition;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "unknown Message";
      console.log("error fetching timestamp", errorMessage)
      return false;
   }
}
