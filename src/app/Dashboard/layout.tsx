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

export default function DashboardLayout() {
   const [taskQueryPath, setTaskQueryPath] = useState<{dashboardBtn: string, dashboardRoute: string }>({
      dashboardBtn: "personal",
      dashboardRoute: "high_priority",
   })
   console.log("🚀 ~ DashboardLayout ~ taskQueryPath:", taskQueryPath)
   const [userId, setUserId] = useState<null | number>(null)
   console.log("🚀 ~ DashboardLayout ~ userId:", userId)

   function SendTaskQueryPath(UserDashboardBtn: string, UserDashboardRoute: string) {
      setTaskQueryPath({
         dashboardBtn: UserDashboardBtn,
         dashboardRoute: UserDashboardRoute,
      })
   }


   function sendUserReceivedId(receivedUserId: number) {
      setUserId(receivedUserId);
   }

   return (
      <section className={parentDashboard.body_section}>
         <DashboardPage
            userTaskQueryPath={SendTaskQueryPath}
            sendingUserID={sendUserReceivedId}
            weeklyData={<WeeklyBarChart />}
            profileImage={<ProfileImage />}
            profileDetails={<ProfileDetails
               id={userId as number}
            />}
            userTask={
               <TaskDisplay
                  id={userId as number}
                  dashboardBtn={taskQueryPath.dashboardBtn}
                  dashboardRoute={taskQueryPath.dashboardRoute}
               />}
            userDeletedFiles={<DeletedTask
               id={userId as number}
            />}
            helperViewTab={<HelperBar />}
         />
      </section>
   );
}
