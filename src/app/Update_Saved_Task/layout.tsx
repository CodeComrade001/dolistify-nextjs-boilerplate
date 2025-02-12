"use client";

import React from "react";
import EditSavedTask from "./page";
import { useParams } from "next/navigation";



export default function NewTaskLayout() {
  const params = useParams();
  const index = parseInt(params.index, 10); // Convert to number
  console.log("🚀 ~ NewTaskLayout ~ index:", index)
  const dashboardBtnParams = params.dashboardBtn; // Assuming this is a string
  console.log("🚀 ~ NewTaskLayout ~ dashboardBtnParams:", dashboardBtnParams)
  const dashboardRouteParams = params.dashboardRoute; // Assuming this is a string
  console.log("🚀 ~ NewTaskLayout ~ dashboardRouteParams:", dashboardRouteParams)


  return (
    <section className="body_section">
      <EditSavedTask
      taskId={index}
      dashboardBtn={dashboardBtnParams}
      dashBoardRoute={dashboardRouteParams}
      />
    </section>
  )
}