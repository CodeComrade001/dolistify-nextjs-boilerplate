"use client";

import React from "react";
import barChartLabel from "../../styles/barChartLabel.module.css";

interface BarChartLabelProps {
   labelDay: React.ReactNode;
   ValueLabel1: React.ReactNode;
   ValueLabel2: React.ReactNode;
   Value1: React.ReactNode;
   Value2: React.ReactNode;
   labelColor: React.ReactNode;
}

export default function BarsLabels({
   labelDay,
   ValueLabel1,
   ValueLabel2,
   Value1,
   Value2,
   labelColor,
}: BarChartLabelProps) {

   return (
      <div className={barChartLabel.label_container}>
         <div className={barChartLabel.label_sub_container}>
            <div className={barChartLabel.label_day}>{labelDay}</div>
            {(ValueLabel1 || Value1) && (
               <div className={barChartLabel.first_label}>
                  <div className={barChartLabel.label_icon_1} style={{ backgroundColor: `${labelColor}` }} ></div>
                  <div className={barChartLabel.label_text}>{ValueLabel1}</div>
                  <div className={barChartLabel.label_value}>{Value1}</div>
               </div>
            )}
            {(ValueLabel2 || Value2) && (
               <div className={barChartLabel.first_label}>
                  <div className={barChartLabel.label_icon_1} style={{ backgroundColor: `${labelColor}` }}></div>
                  <div className={barChartLabel.label_text}>{ValueLabel2}</div>
                  <div className={barChartLabel.label_value}>{Value2}</div>
               </div>
            )}
         </div>
      </div>
   )
} 