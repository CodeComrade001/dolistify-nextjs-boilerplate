"use client";
import { taskPositionRequirement } from "../backend_component/TaskBackend";

// class taskPosition {}
export default async function taskPosition(dashboardBtn: string,dashboardRoute: string): Promise<{ id: number; row: number; column: number }[] | boolean> {
   try {
      const result = await taskPositionRequirement(dashboardBtn,dashboardRoute);

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
         const hrsString: string = new Date(element.timeadded).toLocaleString("en-GB", { hour: "2-digit" });
         const minString: string = new Date(element.timeadded).toLocaleString("en-US", { minute: "2-digit" });
         const secString: string = new Date(element.timeadded).toLocaleString("en-US", { second: "2-digit" });

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
               columnOffset = 4; // Reset column offset for this row
            } else {
               // Same hrs, stay in the same row
               row = lastRow - 3; // Use the same row as before
               column = columnOffset; // Increment column position
               columnOffset += 3; // Update column offset for the next item
            }

            // Add the processed data to the result array
            result.push({ id, row, column });
         });

         return result;
      })();
      return taskPosition;
   } catch (error: unknown) {
      const errorMessage = (error instanceof Error) ? error.message : "unknown Message";
      console.log("error fetching timestamp", errorMessage)
      return false;
   }
}
