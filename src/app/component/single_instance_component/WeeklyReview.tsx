"use client";

import React, { useEffect, useState } from "react";
import weeklyReview from "../../styles/weeklyReview.module.css";
import Bar from "../caculation_report_component/Bar";
import PieChart, { PieChartLabel } from "../caculation_report_component/PieChart";

export default function WeeklyBarChart() {

   return (
      <div className={weeklyReview.weekly_bar_chart}>
         <div className={weeklyReview.barChart_content}>
            <div className={weeklyReview.barChart_hints}>
               <div className={weeklyReview.barChart_insight}>
                  <h1 className={weeklyReview.barChart_insight_item}>Personal Insight</h1>
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
               <span className={weeklyReview.barChart_filter}>filter</span>
            </div>
            <div className={weeklyReview.barChart}>
               <Bar
                  activeHeight={"93%"}
                  barLabelDay={"Monday"}
                  completeHeight={"41%"}
                  missedHeight={"78%"}
                  activeTaskValue={"45%"}
                  activeGoalValue={"48%"}
                  missedTaskValue={"40%"}
                  missedGoalValue={"38%"}
                  completeTaskValue={"20%"}
                  completeGoalValue={"21%"}
               />
               <Bar
                  barLabelDay={"Tuesday"}
                  activeHeight={"36%"}
                  completeHeight={"74%"}
                  missedHeight={"71%"}
                  activeTaskValue={"18%"}
                  activeGoalValue={"18%"}
                  missedTaskValue={"35%"}
                  missedGoalValue={"36%"}
                  completeTaskValue={"37%"}
                  completeGoalValue={"37%"}
               />
               <Bar
                  activeHeight={"89%"}
                  barLabelDay={"Wednesday"}
                  completeHeight={"82%"}
                  missedHeight={"19%"}
                  activeTaskValue={"45%"}
                  activeGoalValue={"44%"}
                  missedTaskValue={"10%"}
                  missedGoalValue={"9%"}
                  completeTaskValue={"41%"}
                  completeGoalValue={"41%"}
               />
               <Bar
                  barLabelDay={"Thursday"}
                  activeHeight={"82%"}
                  completeHeight={"93%"}
                  missedHeight={"71%"}
                  activeTaskValue={"41%"}
                  activeGoalValue={"41%"}
                  missedTaskValue={"35%"}
                  missedGoalValue={"36%"}
                  completeTaskValue={"47%"}
                  completeGoalValue={"46%"}
               />
               <Bar
                  barLabelDay={"Friday"}
                  activeHeight={"50%"}
                  completeHeight={"80%"}
                  missedHeight={"20%"}
                  activeTaskValue={"25%"}
                  activeGoalValue={"25%"}
                  missedTaskValue={"10%"}
                  missedGoalValue={"10%"}
                  completeTaskValue={"40%"}
                  completeGoalValue={"40%"}
               />
               <Bar
                  barLabelDay={"Saturday"}
                  activeHeight={"30%"}
                  completeHeight={"5%"}
                  missedHeight={"100%"}
                  activeTaskValue={"15%"}
                  activeGoalValue={"15%"}
                  missedTaskValue={"50%"}
                  missedGoalValue={"50%"}
                  completeTaskValue={"2%"}
                  completeGoalValue={"3%"}
               />
               <Bar
                  barLabelDay={"Sunday"}
                  activeHeight={"50%"}
                  completeHeight={"70%"}
                  missedHeight={"66%"}
                  activeTaskValue={"25%"}
                  activeGoalValue={"25%"}
                  missedTaskValue={"33%"}
                  missedGoalValue={"33%"}
                  completeTaskValue={"35%"}
                  completeGoalValue={"35%"}
               />

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
               <PieChart />
            </div>
            <div className={weeklyReview.pieChart_labelling}>
               <PieChartLabel 
               ActiveValue={"17"}
               DeleteValue={"25"}
               ArchiveValue={"69"}
               MissedValue={"20"}
               />
            </div>
         </div>
      </div >
   )
}