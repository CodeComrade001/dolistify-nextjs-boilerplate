// app/Dashboard/page.tsx
"use client";
import React, { useState } from "react";
import ProfileDetails from "../component/single_instance_component/userProfileDetails";
import DashboardPage, { DashboardPageProps } from "./DashboardPage";
import TaskDisplay from "../component/single_instance_component/task_preview";
import DeletedTask from "../component/single_instance_component/userDeletedTask";
import WeeklyBarChart from "../component/single_instance_component/WeeklyReview";
import HelperBar from "../component/reusable_component/helper_screen";
import ShowSavedTaskPreview from "../component/reusable_component/savedTaskEditorPreview";

export default function DashboardHomePage() {
   // replicate the same state/hooks/logic you had in DashboardLayout:
   const [taskQueryPath, setTaskQueryPath] = useState({ dashboardBtn: "personal", dashboardRoute: "high_priority" });
   const [fullTaskPreviewProps, setFullTaskPreviewProps] = useState<{ taskId: string | null, dashboardBtn: string }>({
      taskId: null,
      dashboardBtn: ""
   });
   const [notificationMessage, setNotificationMessage] = useState<{ message: string | null, messageType: string | null }>({
      message: null,
      messageType: null
   })

   function sendToMessageComponent(message: string, messageType: string) {
      if (message == null || messageType == null) return;
      setNotificationMessage({ message, messageType })

   }

   function sendTaskQueryPath(dashboardBtn: string, dashboardRoute: string) {
      setTaskQueryPath({ dashboardBtn, dashboardRoute });
   }

   function showSearchFullResult(taskId: string, btn: string) {
      if (taskId !== null) {
         setFullTaskPreviewProps({ taskId, dashboardBtn: btn });
      }
   }

   // now build each ReactElement prop
   const props: DashboardPageProps = {
      profileDetails: <ProfileDetails />,
      userTask: (
         <TaskDisplay
            sendNotificationToMessageComponent={sendToMessageComponent}
            sendingTaskPreviewPath={showSearchFullResult}
            dashboardBtn={taskQueryPath.dashboardBtn}
            dashboardRoute={taskQueryPath.dashboardRoute}
         />
      ),
      userDeletedFiles: <DeletedTask />,
      weeklyData: <WeeklyBarChart dashboardBtn={taskQueryPath.dashboardBtn} />,
      helperViewTab: <HelperBar
         directlySentMessage={notificationMessage.message ?? undefined}
         directSentMessageCategory={notificationMessage.messageType ?? undefined}
      />,
      userFullTaskDetailsPreview: (
         <ShowSavedTaskPreview
            taskId={fullTaskPreviewProps.taskId!}
            dashboardBtn={fullTaskPreviewProps.dashboardBtn}
         />
      ),
      userTaskQueryPath: sendTaskQueryPath,
      showSearchFullResult,
   };

   return <DashboardPage {...props} />;
}
