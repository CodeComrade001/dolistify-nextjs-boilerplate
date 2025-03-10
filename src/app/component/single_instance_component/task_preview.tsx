"use client";
import React, { useCallback, useEffect, useState } from "react";
import taskDisplay from "../../styles/taskDisplay.module.css";
import { showSavedTaskDetailView, showSavedTaskSummaryView, TaskAttributes } from "../backend_component/TaskBackend";
import taskPosition from "../analytics_overview/TaskPlacement";
import classNames from "classnames";
import Link from "next/link";

interface TaskQueryResult {
   id: number;
   title: string;
   timestamp: string;
}

interface savedTaskDataType {
   title: string;
   subtasks: Array<{ id: number; description: string }>;
   status: Array<{ id: number; completed: boolean; missed: boolean }>;
}

export default function TaskDisplay({
   id,
   dashboardBtn,
   dashboardRoute,
}: {
   id : number
   dashboardBtn: string;
   dashboardRoute: string;
}) {
   const [tasks, setTasks] = useState<TaskQueryResult[]>([]);
   const [taskStyle, setTaskStyle] = useState<{ [key: number]: React.CSSProperties }>({});
   const [isStylesReady, setIsStylesReady] = useState(false);
   const [userFullTask, setUserFullTask] = useState<savedTaskDataType | null>(null)

   const setTaskPlacement = useCallback(async (id: number): Promise<React.CSSProperties> => {
      try {
         const taskPositionArray = (await taskPosition(id ,dashboardBtn, dashboardRoute)) || [];
         if (!Array.isArray(taskPositionArray)) {
            console.error("Invalid taskPositionArray");
            return {};
         }
         const item = taskPositionArray.find((pos) => pos.id === id);
         return item ? { gridRowStart: item.row, gridColumnStart: item.column } : {};
      } catch (error) {
         console.error("Error setting task placement:", error);
         return {};
      }
   }, [dashboardBtn, dashboardRoute])

   const fetchTasksSummaryView = useCallback(async (dashboardBtn: string, dashboardRoute: string) => {
      try {
         const queryResult = await showSavedTaskSummaryView(id ,dashboardBtn, dashboardRoute);
         if (Array.isArray(queryResult)) {
            setTasks(queryResult);
            const styles = await Promise.all(
               queryResult.map(async (task) => ({
                  [task.id]: await setTaskPlacement(task.id),
               }))
            );
            setTaskStyle(Object.assign({}, ...styles));
         } else {
            setTasks([]);
         }
      } catch (error) {
         console.error("Error fetching tasks:", error);
         setTasks([]);
      }
   }, [id,setTaskPlacement]);

   const handleTaskUpdate = async (taskId: number, condition: "deleted" | "missed" | "completed") => {
      console.log("🚀 ~ handleTaskUpdate ~ taskId:", taskId)
      // First, fetch the full task details
      const userFullTaskFetching = await fetchFullTask(taskId, dashboardBtn, dashboardRoute);
      console.log("🚀 ~ handleTaskUpdate ~ fullTask:", userFullTaskFetching)

      if (userFullTaskFetching !== null && userFullTask !== null) {
         // Optionally update state if needed:
         // Then update the task condition using the fetched details
         await setTaskCondition(taskId, dashboardBtn, dashboardRoute, condition, userFullTask);
      } else {
         console.error("Full task not found for id:", taskId);
         console.error("user Full task is null:", userFullTask);
      }
   };

   const fetchFullTask = useCallback(async (taskId: number, dashboardBtn: string, dashboardRoute: string) => {
      try {
         const savedTaskArray = await showSavedTaskDetailView( id ,taskId, dashboardBtn, dashboardRoute);
         console.log("🚀 ~ fetchFullTask ~ savedTaskArray:", savedTaskArray)

         if (!savedTaskArray) {
            console.log("No saved task found");
            return null;
         }

         const taskFormat: savedTaskDataType = {
            ...savedTaskArray,
            subtasks: JSON.parse(savedTaskArray.subtasks),
            status: JSON.parse(savedTaskArray.status),
         };

         console.log("🚀 ~ fetchFullTask ~ taskFormat:", taskFormat);
         setUserFullTask(taskFormat)
         return taskFormat;
      } catch (error: unknown) {
         console.error("Error Fetching full Task:", error);
         return null;
      }
   }, [id])


   function formatTimestamp(timestamp: string): string {
      return new Date(timestamp).toLocaleString("en-US", {
         weekday: "short",
         day: "2-digit",
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
         hour12: true,
      });
   }

   async function setTaskCondition(
      taskId: number,
      dashboardBtn: string,
      dashboardRoute: string,
      condition: "deleted" | "missed" | "completed",
      taskDetails: savedTaskDataType | null
   ) {
      console.log("🚀 ~ setTaskCondition ~ before taskId:", taskId);
      console.log("setTaskCondition has started");
      try {
         if (taskDetails !== null) {
            // For example, if condition is "missed", update the status:
            if (condition === "missed") {
               const updatedStatus = taskDetails.status.map((item) => ({
                  ...item,
                  missed: true,
                  completed: false,
               }));
               // If you want to update state as well:
               const updatedTask = {
                  ...taskDetails,
                  status: updatedStatus,
               };

               console.log("🚀 ~ updatedStatus ~ taskDetails:", updatedTask);
               const result = await TaskAttributes(id,condition, dashboardBtn, dashboardRoute, updatedTask, taskId);
               console.log(result ? "successful set task condition" : "failed to set task condition");
               return true;
            }
            // Similarly handle "completed" and "deleted"
            else if (condition === "completed") {
               const updatedStatus = taskDetails.status.map((item) => ({
                  ...item,
                  missed: false,
                  completed: true,
               }));

               const updatedTask = {
                  ...taskDetails,
                  status: updatedStatus,
               };
               console.log("🚀 ~ updatedStatus ~ taskDetails:", updatedTask);

               const result = await TaskAttributes(id,condition, dashboardBtn, dashboardRoute, updatedTask, taskId);
               console.log(result ? "successful set task condition" : "failed to set task condition");
               return true;
            } else {
               const result = await TaskAttributes(id,condition, dashboardBtn, dashboardRoute, taskDetails, taskId);
               console.log("🚀 ~ taskDetails:", taskDetails);
               console.log(result ? "successful set task condition" : "failed to set task condition");
               return true;
            }
         }
      } catch (error: unknown) {
         console.error("Error updating task condition:", error instanceof Error ? error.message : "Unknown error");
         return false;
      }
   }

   useEffect(() => {
      fetchTasksSummaryView(dashboardBtn, dashboardRoute).then(() => setIsStylesReady(true));
   }, [fetchTasksSummaryView, dashboardBtn, dashboardRoute]);

   const containerClass = classNames({
      [taskDisplay.container_loader]: !isStylesReady,
      [taskDisplay.container]: isStylesReady,
   });

   return (
      <div className={`${containerClass} ${taskDisplay.body_section}`}>
         {!isStylesReady ? (
            <div className={taskDisplay.loader_container}>
               <div className={taskDisplay.loader}></div>
            </div>
         ) : (
            <div className={taskDisplay.task_list_items}>
               {tasks.map((task) => (
                  <div
                     key={task.id}
                     data-key={task.id}
                     className={taskDisplay.new_task_position}
                     style={taskStyle[task.id] || {}}
                  >
                     <div className={taskDisplay.new_task_content}>
                        <div className={taskDisplay.task_details}>
                           <div className={taskDisplay.task_date}>
                              {formatTimestamp(task.timestamp)}
                           </div>
                           <div className={taskDisplay.task_title}>{task.title}</div>
                        </div>
                        <div  className={` ${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.deactivate_btn_option_container : taskDisplay.options_container}`}>
                           <div className={`${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.main_button_container : taskDisplay.top_row}`}>
                              <button
                                 title="View Task"
                                 className={` ${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.only_active_btn : taskDisplay.task_options}`}
                              >
                                 <Link href={{
                                    pathname: '/Update_Saved_Task',
                                    query: { param1: task.id, param2: dashboardBtn, param3: dashboardRoute },
                                 }}>
                                    <svg viewBox="0 0 1024 1024" className="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="white" stroke="white">
                                       <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                       <g id="SVGRepo_tracerCarrier" strokeLinecap="round"
                                          strokeLinejoin="round"></g>
                                       <g id="SVGRepo_iconCarrier">
                                          <path d="M149.333333 85.333333h725.333334v853.333334H149.333333z" fill="white"></path>
                                          <path d="M277.333333 554.666667h85.333334v85.333333h-85.333334zM277.333333 384h85.333334v85.333333h-85.333334zM277.333333 725.333333h85.333334v85.333334h-85.333334zM277.333333 213.333333h85.333334v85.333334h-85.333334zM448 554.666667h298.666667v85.333333H448zM448 384h298.666667v85.333333H448zM448 725.333333h298.666667v85.333334H448zM448 213.333333h298.666667v85.333334H448z" fill="white">
                                          </path>
                                       </g></svg>
                                 </Link>
                              </button>
                              <button
                                 title="complete Task"
                                 className={`${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.deactivate_btn : taskDisplay.task_options}`}
                                 onClick={() => handleTaskUpdate(task.id, "completed")}
                              >
                                 <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                       <path fillRule="evenodd" clipRule="evenodd" d="M12 21C16.9706 21 21 16.9706 21 12C21 10.1666 20.4518 8.46124 19.5103 7.03891L12.355 14.9893C11.6624 15.7589 10.4968 15.8726 9.66844 15.2513L6.4 12.8C5.95817 12.4686 5.86863 11.8418 6.2 11.4C6.53137 10.9582 7.15817 10.8686 7.6 11.2L10.8684 13.6513L18.214 5.48955C16.5986 3.94717 14.4099 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="white">
                                       </path>
                                    </g>
                                 </svg>
                              </button>
                           </div>
                           <div className={ `${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.deactivate_bottom_row : taskDisplay.bottom_row}`}>
                              <button
                                 title="failed Task"
                                 className={` ${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.deactivate_btn : taskDisplay.task_options}`}
                                 onClick={() => handleTaskUpdate(task.id, "missed")}
                              >
                                 <svg fill="white" viewBox="0 -8 528 528" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                       <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z">
                                       </path>
                                    </g></svg>
                              </button>
                              <button
                                 title="delete Task"
                                 className={` ${(dashboardRoute === "completed" || dashboardRoute === "missed") ? taskDisplay.deactivate_btn : taskDisplay.task_options}`}
                                 onClick={() => handleTaskUpdate(task.id, "deleted")}
                              >
                                 <svg fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                    <g id="SVGRepo_iconCarrier">
                                       <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z">
                                       </path>
                                    </g>
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
}
