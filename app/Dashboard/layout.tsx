"use client";
import React, { useState } from "react";
import DeletedTask from "../component/single_instance_component/userDeletedTask";
import ProfileDetails, { ProfileImage } from "../component/single_instance_component/userProfileDetails";
import TaskDisplay from "../component/single_instance_component/task_preview";
import DashboardPage from "./page";
import "../styles/layout.css";
import WeeklyBarChart from "../component/single_instance_component/WeeklyReview";
import parentDashboard from "../styles/dashboardMainBody.module.css";
import  AddNewTask  from "../component/reusable_component/addNewTask";
import  EditSavedTask  from "../component/reusable_component/savedTaskEditor";
import  HelperBar  from "../component/reusable_component/helper_screen";

// Define the type for task view state
interface TaskViewState {
   isFullView: boolean;
   isEditView: boolean;
}

export default function DashboardLayout({
   children,
}: {
   children: React.ReactNode
}): JSX.Element {
   const [taskView, setTaskView] = useState<TaskViewState>({
      isFullView: false,
      isEditView: false,
   });
   const [editingTaskId, setEditingTaskId] = useState<number | null>(null); 

   // Type newState to match TaskViewState's keys
   function updateTaskView(newState: Partial<TaskViewState>) {
      setTaskView((prev) => ({ ...prev, ...newState }));
   }

   function closeFullTask() {
      updateTaskView({ isFullView: false, isEditView: false });
   }

   function closeEditTask() {
      updateTaskView({ isEditView: false });
   }

   function showTaskView() {
      updateTaskView({ isFullView: true });
   }

   function showSavedTaskView(taskId: number) {
      setEditingTaskId(taskId); 
      updateTaskView({ isEditView: true });
   }
   return (
      <section className={parentDashboard.body_section}>
         {taskView.isFullView && (
            <div className={parentDashboard.centeredContent}>
               <AddNewTask closeFullTaskView={closeFullTask} />
            </div>
         )}
         {taskView.isEditView && (
            <div className={parentDashboard.centeredContent}>
               <EditSavedTask 
               taskId={editingTaskId}
               closeEditTaskView={closeEditTask}
                />
            </div>
         )}
         <div className={`${parentDashboard.mainContent} ${taskView.isFullView || taskView.isEditView ? parentDashboard.blurred : ""}`}>
            <DashboardPage
               showTaskDisplay={showTaskView}
               weeklyData={<WeeklyBarChart />}
               profileImage={<ProfileImage />}
               profileDetails={<ProfileDetails />}
               userTask={<TaskDisplay editSavedTask={showSavedTaskView} />}
               userDeletedFiles={<DeletedTask />}
               helperViewTab={<HelperBar />}
            />
         </div>
      </section>
   );
}
