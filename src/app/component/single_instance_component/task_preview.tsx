"use client";
import React, { useCallback, useEffect, useState } from "react";
import taskDisplay from "../../styles/taskDisplay.module.css";
import { showSavedTaskDetailView, showSavedTaskSummaryView, TaskAttributes } from "../backend_component/TaskBackend";
import taskPosition from "../analytics_overview/TaskPlacement";
import classNames from "classnames";

interface TaskQueryResult {
   id: number;
   title: string;
   timestamp: string;
}

interface savedTaskDataType {
   title: string;
   subtasks: Array<{ id: number; description: string }>;
   status: Array<{ id: number; completed: boolean | null; missed: boolean | null }>;
}

export default function TaskDisplay({

   editSavedTask,
   dashboardBtn,
   dashboardRoute,
}: {
   editSavedTask: (taskId: number) => void;
   dashboardBtn: string;
   dashboardRoute: string;
}) {
   const [tasks, setTasks] = useState<TaskQueryResult[]>([]);
   const [taskStyle, setTaskStyle] = useState<{ [key: number]: React.CSSProperties }>({});
   const [isStylesReady, setIsStylesReady] = useState(false);
   const [userId, setUserId] = useState<number | null>(null);
   const [userFullTask, setUserFullTask] = useState<savedTaskDataType>({
      title: "",
      subtasks: [{ id: 1, description: "" }],
      status: [{ id: 1, completed: null, missed: null }],
   })

   const setTaskPlacement = useCallback(async (id: number): Promise<React.CSSProperties> => {
      try {
         const taskPositionArray = (await taskPosition(dashboardBtn, dashboardRoute)) || [];
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

   const fetchTasks = useCallback(async (dashboardBtn: string, dashboardRoute: string) => {
      try {
         const queryResult = await showSavedTaskSummaryView(dashboardBtn, dashboardRoute);
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
   }, [setTaskPlacement]);

   async function fetchAllTask(userId: number, dashboardBtn: string, dashboardRoute: string) {
      try {
         if (userId !== null) {
            const allTaskResult = await showSavedTaskDetailView(userId, dashboardBtn, dashboardRoute);
            // Ensure the status is always an array.
            if (allTaskResult && allTaskResult.status && !Array.isArray(allTaskResult.status)) {
               allTaskResult.status = [allTaskResult.status];
            }

            const updatedTaskFormat = {
               title: allTaskResult.title,
               subtasks: JSON.parse(allTaskResult.subtasks),
               status: JSON.parse(allTaskResult.status),
            }

            setUserFullTask(updatedTaskFormat);
            console.log("🚀 ~ fetchAllTask ~ updatedTaskFormat:", updatedTaskFormat)
         }
      } catch (error: unknown) {
         console.log("error fetching full task in task preview", error);
      }
   }



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

   async function setTaskCondition(dashboardBtn: string, dashboardRoute: string, condition: "deleted" | "missed" | "completed") {
      console.log("🚀 ~ setTaskCondition ~ before userId:", userId)
      console.log("setTaskCondition has started")
      try {
         if (userId !== null && userFullTask !== undefined) {
            console.log("🚀 ~ setTaskCondition ~ after userId:", userId)
            if (condition === "missed") {
               const updatedStatus = userFullTask.status.map((item) => ({
                  ...item,
                  missed: true,
                  completed: false,
               }));

               setUserFullTask((prevTask) => ({
                  ...prevTask,
                  status: updatedStatus,
               }));

               const setTaskCondition = await TaskAttributes(condition, dashboardBtn, dashboardRoute, userFullTask, userId);
               console.log(setTaskCondition ? "successful set task condition" : "failed to set task condition");

               return true
            } else if (condition === "completed") {
               const updatedStatus = userFullTask.status.map((item) => ({
                  ...item,
                  missed: false,
                  completed: true,
               }));

               setUserFullTask((prevTask) => ({
                  ...prevTask,
                  status: updatedStatus,
               }));

               const setTaskCondition = await TaskAttributes(condition, dashboardBtn, dashboardRoute, userFullTask, userId);
               console.log(setTaskCondition ? "successful set task condition" : "failed to set task condition");
               return true
            } else {
               const setTaskCondition = await TaskAttributes(condition, dashboardBtn, dashboardRoute, userFullTask, userId);
               console.log(setTaskCondition ? "successful set task condition" : "failed to set task condition");
               return true
            }

         }
      } catch (error: unknown) {
         console.error("Error updating task condition:", error instanceof Error ? error.message : "Unknown error");
         return false;
      }
   }

   useEffect(() => {
      fetchTasks(dashboardBtn, dashboardRoute).then(() => setIsStylesReady(true));
   }, [fetchTasks, dashboardBtn, dashboardRoute]);

   const containerClass = classNames({
      [taskDisplay.container_loader]: !isStylesReady,
      [taskDisplay.container]: isStylesReady,
   });

   useEffect(() => {
      if (userId !== null) {
         console.log("fetching task preview full task")
         fetchAllTask(userId, dashboardBtn, dashboardRoute)
      }
   }, [userId, dashboardBtn, dashboardRoute])




   return (
      <div className={containerClass}>
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
                        <div className={taskDisplay.options_container}>
                           <div className={taskDisplay.top_row}>
                              <button
                                 className={taskDisplay.task_options}
                                 onClick={() => {
                                    setUserId(task.id)
                                    editSavedTask(task.id)
                                 }}
                              >
                                 View
                              </button>
                              <button
                                 className={taskDisplay.task_options}
                                 onClick={() => {
                                    setUserId(task.id)
                                    setTaskCondition(dashboardBtn, dashboardRoute, "completed")
                                 }}
                              >
                                 Done
                              </button>
                           </div>
                           <div className={taskDisplay.bottom_row}>
                              <button
                                 className={taskDisplay.task_options}
                                 onClick={() => {
                                    setUserId(task.id)
                                    setTaskCondition(dashboardBtn, dashboardRoute, "missed")
                                 }}
                              >
                                 fail
                              </button>
                              <button
                                 className={taskDisplay.task_options}
                                 onClick={() => {
                                    setUserId(task.id)
                                    setTaskCondition(dashboardBtn, dashboardRoute, "deleted")
                                 }}
                              >
                                 Del
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
