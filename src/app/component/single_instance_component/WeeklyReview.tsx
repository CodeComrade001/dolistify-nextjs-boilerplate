"use client";

import React, { useCallback, useEffect, useState } from "react";
import weeklyReview from "../../styles/weeklyReview.module.css";
import Bar from "../reusable_component/BarChart";
import PieChart, { PieChartLabel } from "../reusable_component/PieChart";

interface DailyLog {
   date: string;
   completed: number;
   missed: number;
   active: number;
   deleted: number;
}

interface weeklyLogDataType {
   daily: DailyLog[];
   weekly: {
      completed: number;
      missed: number;
      active: number;
      deleted: number;
   };
   dailyNumFormat: DailyLog[];
   weeklyNumFormat: {
      completed: number;
      missed: number;
      active: number;
      deleted: number;
   }
}

export default function WeeklyBarChart({ userId, dashboardBtn }: { userId: number, dashboardBtn: string }) {
   const [dashboardBtnType, setDashboardBtnType] = useState("Personal Task")
   const [dashboardDropdown, setDashboardDropdown] = useState(false)
   const [activeDashboardBtn, setActiveDashboardBtn] = useState("personal")
   const [weeklyLogData, setWeeklyLogData] = useState<null | weeklyLogDataType>(null)
   console.log("🚀 ~ WeeklyBarChart ~ weeklyLogData:", weeklyLogData)
   console.log("🚀 ~ WeeklyBarChart ~ activeDashboardBtn:", activeDashboardBtn)

   function handleOptionClick(taskType: "Personal Task" | "personal" | "work" | "time_bound" | "repeated" | "Work Task" | "Time-bound Task" | "Repeated Task") {
      switch (taskType) {
         case "Personal Task":
         case "personal":
            setDashboardBtnType("Personal Task");
            setActiveDashboardBtn("personal");
            setDashboardDropdown(false);
            setWeeklyLogData(null)
            break;
         case "Work Task":
         case "work":
            setDashboardBtnType("Work Task");
            setActiveDashboardBtn("work");
            setDashboardDropdown(false);
            setWeeklyLogData(null)
            break;
         case "Time-bound Task":
         case "time_bound":
            setDashboardBtnType("Time-bound Task");
            setActiveDashboardBtn("time_bound");
            setDashboardDropdown(false);
            setWeeklyLogData(null)
            break;
         case "Repeated Task":
         case "repeated":
            setDashboardBtnType("Repeated Task");
            setActiveDashboardBtn("repeated");
            setDashboardDropdown(false);
            setWeeklyLogData(null)
            break;
         default:
            break;
      }
   }

   // Use useEffect to run handleOptionClick only when dashboardBtn changes,
   // rather than on every render.
   useEffect(() => {
      handleOptionClick(dashboardBtn as "personal" | "repeated" | "time_bound" | "work");
   }, [dashboardBtn]);


   const fetchTaskLog = useCallback(async (userId: number) => {
      console.log("🚀 ~ fetchTaskLog ~ DashboardBtnType:", activeDashboardBtn)
      const response = await fetch("/api/weeklyLog", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ userId, activeDashboardBtn }),
      });
      const logData = await response.json();
      if (logData.success) {
         console.log("🚀 ~ fetchTaskLog ~ data:", logData)
         setWeeklyLogData(logData.data)
      } else {
         console.error("log error:", logData.error);
      }
   }, [activeDashboardBtn])


   useEffect(() => {
      fetchTaskLog(userId)
   }, [fetchTaskLog, userId])

   const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

   return (
      <div className={weeklyReview.weekly_bar_chart}>
         <div className={weeklyReview.barChart_content}>
            <div className={weeklyReview.barChart_hints}>
               <div className={weeklyReview.dashboard}>
                  <button
                     className={weeklyReview.dashboard_group_item}
                     onClick={() => setDashboardDropdown(true)}
                  >
                     {dashboardBtnType}
                     <div className={weeklyReview.selector_icon}>
                        <svg
                           height="20"
                           width="20"
                           viewBox="0 0 16 16"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg">
                           <g id="svgBackground" strokeWidth="0"></g>
                           <g id="svgTracer" strokeLinecap="round" strokeLinejoin="round"></g>
                           <g id="iconCarrier">
                              <path
                                 d="M8.00003 8.1716L3.41424 3.58582L0.585815 6.41424L8.00003 13.8285L15.4142 6.41424L12.5858 3.58582L8.00003 8.1716Z"
                                 fill="white"
                              />
                           </g>
                        </svg>
                     </div>
                  </button>
                  {dashboardDropdown && (
                     <div className={weeklyReview.group_selector_container}>
                        {["Personal Task", "Work Task", "Time-bound Task", "Repeated Task"].map((option) => (
                           <button
                              key={option}
                              className={weeklyReview.dashboard_options}
                              onClick={() => {
                                 handleOptionClick(option as "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task")
                                 fetchTaskLog(userId)
                              }}
                           >
                              {option}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
               <span className={weeklyReview.hint_container}>
                  <div className={weeklyReview.active_color}></div>
                  <h3 className={weeklyReview.hints}>Active</h3>
               </span>
               <span className={weeklyReview.hint_container}>
                  <div className={weeklyReview.completed_color}></div>
                  <h3 className={weeklyReview.hints}>Completed</h3>
               </span>
               <span className={weeklyReview.hint_container}>
                  <div className={weeklyReview.missed_color}></div>
                  <h3 className={weeklyReview.hints}>Missed</h3>
               </span>
               <span className={weeklyReview.hint_container}>
                  <div className={weeklyReview.deleted_color}></div>
                  <h3 className={weeklyReview.hints}>deleted</h3>
               </span>

            </div>
            <div className={weeklyReview.barChart}>
               {weeklyLogData !== null &&
                  weeklyLogData.dailyNumFormat &&
                  weeklyLogData.daily.map((item, index) => {
                     // For each day, get the corresponding raw number data from dailyNumFormat.
                     const { completed: completedNumFormat, missed: missedNumFormat, active: activeNumFormat } = weeklyLogData.dailyNumFormat[index];
                     return (
                        <Bar
                           key={index}
                           activeHeight={item.active}                // Percentage value as string (e.g., "67%")
                           completeHeight={item.completed}           // Percentage value as string (e.g., "17%")
                           missedHeight={item.missed}                // Percentage value as string (e.g., "17%")
                           activeTaskValueNum={activeNumFormat}      // Raw number value (e.g., 4)
                           activeTaskValuePercentage={item.active}   // Percentage value as string (e.g., "67%")
                           missedTaskValueNum={missedNumFormat}        // Raw number value (e.g., 1)
                           missedTaskValuePercentage={item.missed}     // Percentage value as string (e.g., "17%")
                           completeTaskValueNum={completedNumFormat}  // Raw number value (e.g., 1)
                           completeTaskValuePercentage={item.completed} // Percentage value as string (e.g., "17%")
                           barLabelDay={weekdays[index]}             // Day label (e.g., "Monday")
                        />
                     );
                  })}
            </div>
            <div className={weeklyReview.Labelling}>
               <h2 className={weeklyReview.label_mon}>Mon</h2>
               <h2 className={weeklyReview.label_tue}>Tue</h2>
               <h2 className={weeklyReview.label_wed}>Wed</h2>
               <h2 className={weeklyReview.label_thur}>Thur</h2>
               <h2 className={weeklyReview.label_fri}>Fri</h2>
               <h2 className={weeklyReview.label_sat}>Sat</h2>
               <h2 className={weeklyReview.label_sun}>Sun</h2>
            </div>
         </div>
         <div className={weeklyReview.pieChart_items}>
            <div className={weeklyReview.pieChart_diagram}>
               {weeklyLogData?.weekly && (
                  <PieChart
                     weeklyData={{
                        completed: `${weeklyLogData.weekly.completed}`,
                        missed: `${weeklyLogData.weekly.missed}`,
                        active: `${weeklyLogData.weekly.active}`,
                        deleted: `${weeklyLogData.weekly.deleted}`,
                     }}
                  />
               )}
            </div>
            <div className={weeklyReview.pieChart_labelling}>
               {weeklyLogData !== null &&
                  <PieChartLabel
                     ActiveValue={weeklyLogData.weeklyNumFormat.active}
                     MissedValue={weeklyLogData.weeklyNumFormat.missed}
                     completeValue={weeklyLogData.weeklyNumFormat.completed}
                     DeleteValue={weeklyLogData.weeklyNumFormat.deleted}
                  />
               }
            </div>
         </div>
      </div >
   )
}