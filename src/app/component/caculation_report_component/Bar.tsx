"use client";

import React, { useState } from "react";
import bars from "../../styles/bars.module.css";
import BarsLabels from "./BarLabels";

interface barsProps {
   activeHeight?: React.ReactNode;
   completeHeight?: React.ReactNode;
   missedHeight?: React.ReactNode;
   activeTaskValue?: React.ReactNode;
   activeGoalValue?: React.ReactNode;
   missedTaskValue?: React.ReactNode;
   missedGoalValue?: React.ReactNode;
   completeTaskValue?: React.ReactNode;
   completeGoalValue?: React.ReactNode;
   barLabelDay?: React.ReactNode;
}

export default function Bar({
   activeHeight,
   completeHeight,
   missedHeight,
   activeTaskValue,
   activeGoalValue,
   missedTaskValue,
   missedGoalValue,
   completeTaskValue,
   completeGoalValue,
   barLabelDay,
}: barsProps) {

   const [activeBar, setActiveBar] = useState(false);
   const [completeBar, setCompleteBar] = useState(false)
   const [missedBar, setMissedBar] = useState(false)



   type BarType = "active" | "complete" | "missed";

   function handleMouseEnter(barType: BarType) {
      switch (barType) {
         case "active":
            setActiveBar(true);
            break;
         case "complete":
            setCompleteBar(true);
            break;
         case "missed":
            setMissedBar(true);
            break;
         default:
            break;
      }
   }

   function handleMouseLeave(barType: BarType) {
      switch (barType) {
         case "active":
            setActiveBar(false);
            break;
         case "complete":
            setCompleteBar(false);
            break;
         case "missed":
            setMissedBar(false);
            break;
         default:
            break;
      }
   }

   return (
      <div className={bars.bar_container}>
         <div
            className={bars.active_bar}
            style={{ height: `${activeHeight}` }}
            onMouseEnter={() => handleMouseEnter("active")}
            onMouseLeave={() => handleMouseLeave("active")}
         >
            {activeBar &&
               <BarsLabels
                  labelDay={barLabelDay}
                  ValueLabel1={"Task"}
                  ValueLabel2={"Goal"}
                  Value1={activeTaskValue}
                  Value2={activeGoalValue}
                  labelColor={"yellow"}
               />
            }
         </div>
         <div
            className={bars.completed_bar}
            style={{ height: ` ${completeHeight}` }}
            onMouseEnter={() => handleMouseEnter("complete")}
            onMouseLeave={() => handleMouseLeave("complete")}
         >
            {completeBar && <BarsLabels
               labelDay={barLabelDay}
               ValueLabel1={"Task"}
               ValueLabel2={"Goal"}
               Value1={completeTaskValue}
               Value2={completeGoalValue}
               labelColor={"green"}
            />}
         </div>
         <div
            className={bars.missed_bar}
            style={{ height: `${missedHeight}` }}
            onMouseEnter={() => handleMouseEnter("missed")}
            onMouseLeave={() => handleMouseLeave("missed")}
         >
            {missedBar && <BarsLabels
               labelDay={barLabelDay}
               ValueLabel1={"Task"}
               ValueLabel2={"Goal"}
               Value1={missedTaskValue}
               Value2={missedGoalValue}
               labelColor={"red"}
            />}
         </div>
      </div>
   );
}