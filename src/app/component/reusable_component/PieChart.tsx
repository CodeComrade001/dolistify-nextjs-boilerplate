import React from "react";
import pieChartStyles from "../../styles/pieChartStyles.module.css";

// Define the shape of the weekly data prop.
interface WeeklyData {
   completed: string; // e.g., "17%"
   missed: string;    // e.g., "17%"
   active: string;    // e.g., "67%"
   deleted: string;   // e.g., "0%"
}

interface PieChartProps {
   weeklyData: WeeklyData;
}

export default function PieChart({ weeklyData }: PieChartProps) {
   console.log("🚀 ~ PieChart ~ weeklyData:", weeklyData);
   // Parse the percentage strings into numbers.
   const completed = parseFloat(weeklyData.completed); // e.g., 17
   const missed = parseFloat(weeklyData.missed);         // e.g., 17
   const active = parseFloat(weeklyData.active);         // e.g., 67
   const deleted = parseFloat(weeklyData.deleted);
   // e.g., 0

   // Sum of all segments. (This might not equal 100 exactly.)
   const total = completed + missed + active + deleted;
   console.log("🚀 ~ PieChart ~ total:", total)

   // If total is zero, set a uniform gradient.
   let gradient = "";
   if (total === 0) {
      gradient = `conic-gradient(white 0%, white 100%)`;
   } else {
      // Normalize the percentages so they add to 100.
      const normCompleted = (completed / total) * 100;
      console.log("🚀 ~ PieChart ~ normCompleted:", normCompleted)
      const normMissed = (missed / total) * 100;
      console.log("🚀 ~ PieChart ~ normMissed:", normMissed)
      const normActive = (active / total) * 100;
      console.log("🚀 ~ PieChart ~ normActive:", normActive)
      // const normDeleted = (deleted / total) * 100;

      // Calculate cumulative stops.
      const completedStop = normCompleted;
      console.log("🚀 ~ PieChart ~ completedStop:", completedStop)
      const missedStop = completedStop + normMissed;
      console.log("🚀 ~ PieChart ~ missedStop:", missedStop)
      const activeStop = missedStop + normActive;
      console.log("🚀 ~ PieChart ~ activeStop:", activeStop)
      // deletedStop should be 100 after normalization.
      // const deletedStop = activeStop + normDeleted;

      // Build the conic-gradient string.
      // Order: completed (green), missed (red), active (blue), deleted (gray).
      gradient = `conic-gradient(
      green 0%,
      green ${completedStop.toFixed(2)}%,
      red ${completedStop.toFixed(2)}%,
      red ${missedStop.toFixed(2)}%,
      blue ${missedStop.toFixed(2)}%,
      blue ${activeStop.toFixed(2)}%,
      #7f8c8d ${activeStop.toFixed(2)}%,
      #7f8c8d 100%
    )`;
   }

   console.log("🚀 ~ PieChart ~ Gradient:", gradient);

   return (
      <div className={pieChartStyles.pieChart_view} style={{ backgroundImage: gradient }}>
         <div className={pieChartStyles.pieChart_center}>
            {/* Optional inner elements or labels */}
            <div className={pieChartStyles.active}></div>
            <div className={pieChartStyles.delete}></div>
            <div className={pieChartStyles.archive}></div>
            <div className={pieChartStyles.missed}></div>
         </div>
      </div>
   );
}


interface pieChartLabelProps {
   ActiveValue: React.ReactNode;
   DeleteValue: React.ReactNode;
   completeValue: React.ReactNode;
   MissedValue: React.ReactNode;
}

export function PieChartLabel({
   ActiveValue,
   DeleteValue,
   completeValue,
   MissedValue,
}: pieChartLabelProps
) {
   return (
      <div className={pieChartStyles.tagsCount}>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>Active</span>
            <span className={pieChartStyles.values}>
               {ActiveValue}
            </span>
         </div>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>complete</span>
            <span className={pieChartStyles.values}>{completeValue}
            </span>
         </div>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>Missed</span>
            <span className={pieChartStyles.values}>
               {MissedValue}
            </span>
         </div>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>Delete</span>
            <span className={pieChartStyles.values}>
               {DeleteValue}
            </span>
         </div>
      </div>
   );
}
