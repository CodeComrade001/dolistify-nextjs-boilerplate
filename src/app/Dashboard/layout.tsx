"use client";
import React, { useEffect, useState } from "react";
import DeletedTask from "../component/single_instance_component/userDeletedTask";
import ProfileDetails, { ProfileImage } from "../component/single_instance_component/userProfileDetails";
import TaskDisplay from "../component/single_instance_component/task_preview";
import DashboardPage from "./page";
import "../styles/layout.css";
import WeeklyBarChart from "../component/single_instance_component/WeeklyReview";
import parentDashboard from "../styles/dashboardMainBody.module.css";
import HelperBar from "../component/reusable_component/helper_screen";
import ShowSavedTaskPreview from "../component/reusable_component/savedTaskEditorPreview";

// Define an interface for the preview props with clear names.
// Renamed "Id" to "taskId" for clarity.
interface FullTaskPreviewPropsType {
   userId: number | null;
   taskId: number | null;
   dashboardBtn: string;
}

export default function DashboardLayout() {
   // State to keep track of the current task query path.
   const [taskQueryPath, setTaskQueryPath] = useState<{ dashboardBtn: string, dashboardRoute: string }>({
      dashboardBtn: "personal",
      dashboardRoute: "high_priority",
   });
   console.log("🚀 ~ DashboardLayout ~ taskQueryPath:", taskQueryPath);

   // State to store the logged in user's id.
   const [userId, setUserId] = useState<number | null>(null);
   console.log("🚀 ~ DashboardLayout ~ userId:", userId);

   // State for the full task preview props.
   // Using our interface for better clarity.
   const [fullTaskPreviewProps, setFullTaskPreviewProps] = useState<FullTaskPreviewPropsType>({
      userId: null,
      taskId: null,
      dashboardBtn: "",
   });

   // Function to update the task query path.
   function SendTaskQueryPath(UserDashboardBtn: string, UserDashboardRoute: string) {
      setTaskQueryPath({
         dashboardBtn: UserDashboardBtn,
         dashboardRoute: UserDashboardRoute,
      });
   }

   // Function to update the preview component props.
   // Simplified by directly setting new state rather than checking previous state.
   function parsingIntoPreviewComponent(
      previewUserId: number,
      previewTaskId: number,
      previewDashboardBtn: string,
   ) {
      setFullTaskPreviewProps({
         userId: previewUserId,
         taskId: previewTaskId,
         dashboardBtn: previewDashboardBtn,
      });
   }


   // useEffect to parse the userId from cookies.
   useEffect(() => {
      // Split the cookie string by semicolon (in case there are more cookies)
      const cookiesArray = document.cookie.split(";");
      console.log("🚀 ~ useEffect ~ cookiesArray:", cookiesArray);

      // Find the cookie that starts with "userId="
      const userIdCookie = cookiesArray.find(cookie => cookie.trim().startsWith("userId="));
      console.log("🚀 ~ useEffect ~ userIdCookie:", userIdCookie);

      // Extract the value and convert to a number
      const userIdStr = userIdCookie ? userIdCookie.split("=")[1].trim() : null;
      console.log("🚀 ~ useEffect ~ userIdStr:", userIdStr);
      const userIdNum = userIdStr ? Number(userIdStr) : null;
      console.log("🚀 ~ useEffect ~ userIdNum:", userIdNum);
      console.log("🚀 ~ useEffect ~ typeof(userIdNum):", typeof userIdNum);

      // Set the state with the numeric value (or null)
      setUserId(userIdNum);
   }, []);

   return (
      <section className={parentDashboard.body_section}>
         <DashboardPage
            // Pass the preview component with the correct properties.
            userFullTaskDetailsPreview={
               <ShowSavedTaskPreview
                  userId={fullTaskPreviewProps.userId as number}
                  taskId={fullTaskPreviewProps.taskId as number}
                  dashboardBtn={fullTaskPreviewProps.dashboardBtn}
               />
            }
            // Pass the function to update task query path.
            showSearchFullResult={parsingIntoPreviewComponent}
            userTaskQueryPath={SendTaskQueryPath}
            weeklyData={<WeeklyBarChart
               dashboardBtn={taskQueryPath.dashboardBtn}
               userId={userId as number}
            />}
            profileImage={<ProfileImage />}
            profileDetails={<ProfileDetails id={userId as number} />}
            userTask={
               <TaskDisplay
                  userId={userId as number}
                  sendingTaskPreviewPath={parsingIntoPreviewComponent}
                  dashboardBtn={taskQueryPath.dashboardBtn}
                  dashboardRoute={taskQueryPath.dashboardRoute}
               />
            }
            userDeletedFiles={<DeletedTask id={userId as number} />}
            helperViewTab={<HelperBar />}
         />
      </section>
   );
}
