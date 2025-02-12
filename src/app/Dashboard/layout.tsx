"use client";
import React, { useState } from "react";
import DeletedTask from "../component/single_instance_component/userDeletedTask";
import ProfileDetails, { ProfileImage } from "../component/single_instance_component/userProfileDetails";
import TaskDisplay from "../component/single_instance_component/task_preview";
import DashboardPage from "./page";
import "../styles/layout.css";
import WeeklyBarChart from "../component/single_instance_component/WeeklyReview";
import parentDashboard from "../styles/dashboardMainBody.module.css";
import HelperBar from "../component/reusable_component/helper_screen";

export default function DashboardLayout(){
   const [taskQueryPath, setTaskQueryPath] = useState<{ dashboardBtn: string, dashboardRoute: string }>({
      dashboardBtn: "personal",
      dashboardRoute: "high_priority",
   })

   function SendTaskQueryPath(UserDashboardBtn: string, UserDashboardRoute: string) {
      setTaskQueryPath({
         dashboardBtn: UserDashboardBtn,
         dashboardRoute: UserDashboardRoute,
      })
   }

   
   return (
      <section className={parentDashboard.body_section}>
            <DashboardPage
               userTaskQueryPath={SendTaskQueryPath}
               weeklyData={<WeeklyBarChart />}
               profileImage={<ProfileImage />}
               profileDetails={<ProfileDetails />}
               userTask={
                  <TaskDisplay
                     dashboardBtn={ taskQueryPath.dashboardBtn}
                     dashboardRoute={ taskQueryPath.dashboardRoute}
                  />}
               userDeletedFiles={<DeletedTask />}
               helperViewTab={<HelperBar />}
            />
      </section>
   );
}
