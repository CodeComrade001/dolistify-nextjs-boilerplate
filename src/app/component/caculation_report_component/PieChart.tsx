import React from "react";
import pieChartStyles from "../../styles/pieChartStyles.module.css";

export default function PieChart() {
   return (
      <div className={pieChartStyles.pieChart_view}>
         <div className={pieChartStyles.pieChart_center}>
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
   ArchiveValue: React.ReactNode;
   MissedValue: React.ReactNode;
}

export function PieChartLabel({
   ActiveValue,
   DeleteValue,
   ArchiveValue,
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
            <span className={pieChartStyles.tagsLabel}>Delete</span>
            <span className={pieChartStyles.values}>
               {DeleteValue}
            </span>
         </div>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>Archive</span>
            <span className={pieChartStyles.values}>{ArchiveValue}
            </span>
         </div>
         <div className={pieChartStyles.tags}>
            <span className={pieChartStyles.tagsLabel}>Missed</span>
            <span className={pieChartStyles.values}>
               {MissedValue}
            </span>
         </div>
      </div>
   );
}
