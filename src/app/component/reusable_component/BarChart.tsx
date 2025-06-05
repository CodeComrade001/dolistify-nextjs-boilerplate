"use client";

import React, { useState } from "react";
import bars from "../../styles/bars.module.css";
import barChartLabel from "../../styles/barChartLabel.module.css";

interface barsProps {
   activeHeight?: React.ReactNode;
   completeHeight?: React.ReactNode;
   missedHeight?: React.ReactNode;
   activeTaskValueNum?: React.ReactNode;
   activeTaskValuePercentage?: React.ReactNode;
   missedTaskValueNum?: React.ReactNode;
   missedTaskValuePercentage?: React.ReactNode;
   completeTaskValueNum?: React.ReactNode;
   completeTaskValuePercentage?: React.ReactNode;
   barLabelDay?: React.ReactNode;
   deletedTaskValueNum?: React.ReactNode;
   deletedTaskValuePercentage?: React.ReactNode;
}

export default function Bar({
   activeHeight,
   completeHeight,
   missedHeight,
   activeTaskValueNum,
   activeTaskValuePercentage,
   missedTaskValueNum,
   missedTaskValuePercentage,
   completeTaskValueNum,
   completeTaskValuePercentage,
   barLabelDay,
}: barsProps) {

   const [activeBar, setActiveBar] = useState(false);
   const [completeBar, setCompleteBar] = useState(false)
   const [missedBar, setMissedBar] = useState(false)



   type BarType = "active" | "complete" | "missed" | 'deleted';

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
            style={{ height: `${activeHeight}`, width: `${completeHeight !== 0 ? 33 : 0}%` }}
            onMouseEnter={() => handleMouseEnter("active")}
            onMouseLeave={() => handleMouseLeave("active")}
         >
            {activeBar &&
               <BarsLabels
                  labelDay={barLabelDay}
                  ValueLabel1={"Task Num: "}
                  ValueLabel2={"Task %: "}
                  ValueInNum={activeTaskValueNum}
                  ValueInPercentage={activeTaskValuePercentage}
                  labelColor={"blue"}
               />
            }
         </div>
         <div
            className={bars.completed_bar}
            style={{ height: ` ${completeHeight}`, width: `${completeHeight !== 0 ? 33 : 0}%` }}
            onMouseEnter={() => handleMouseEnter("complete")}
            onMouseLeave={() => handleMouseLeave("complete")}
         >
            {completeBar && <BarsLabels
               labelDay={barLabelDay}
               ValueLabel1={"Task Num: "}
               ValueLabel2={"Task %: "}
               ValueInNum={completeTaskValueNum}
               ValueInPercentage={completeTaskValuePercentage}
               labelColor={"green"}
            />}
         </div>
         <div
            className={bars.missed_bar}
            style={{ height: `${missedHeight}`, width: `${completeHeight !== 0 ? 33 : 0}%` }}
            onMouseEnter={() => handleMouseEnter("missed")}
            onMouseLeave={() => handleMouseLeave("missed")}
         >
            {missedBar && <BarsLabels
               labelDay={barLabelDay}
               ValueLabel1={"Task Num: "}
               ValueLabel2={"Task %: "}
               ValueInNum={missedTaskValueNum}
               ValueInPercentage={missedTaskValuePercentage}
               labelColor={"red"}
            />}
         </div>
      </div>
   );
}



interface BarChartLabelProps {
   labelDay: React.ReactNode;
   ValueLabel1: React.ReactNode;
   ValueLabel2: React.ReactNode;
   ValueInNum: React.ReactNode;
   ValueInPercentage: React.ReactNode;
   labelColor: React.ReactNode;
}

export function BarsLabels({
   labelDay,
   ValueLabel1,
   ValueLabel2,
   ValueInNum,
   ValueInPercentage,
   labelColor,
}: BarChartLabelProps) {

   return (
      <div className={`${barChartLabel.label_container}  ${barChartLabel.label_container_show} `}>
         <div className={barChartLabel.label_sub_container}>
            <div className={barChartLabel.label_day}>{labelDay}</div>
            {(ValueLabel1 || ValueInNum) && (
               <div className={barChartLabel.first_label}>
                  <div className={barChartLabel.label_icon_1} style={{ backgroundColor: `${labelColor}` }} ></div>
                  <div className={barChartLabel.label_text}>{ValueLabel1}</div>
                  <div className={barChartLabel.label_value}>{ValueInNum}</div>
               </div>
            )}
            {(ValueLabel2 || ValueInPercentage) && (
               <div className={barChartLabel.first_label}>
                  <div className={barChartLabel.label_icon_1} style={{ backgroundColor: `${labelColor}` }}></div>
                  <div className={barChartLabel.label_text}>{ValueLabel2}</div>
                  <div className={barChartLabel.label_value}>{ValueInPercentage}</div>
               </div>
            )}
         </div>
      </div>
   )
} 