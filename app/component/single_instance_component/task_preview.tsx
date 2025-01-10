"use client";
import React, { useEffect, useState } from "react";
import taskDisplay from "../../styles/taskDisplay.module.css";
import { showSavedTaskSummaryView } from "../backend_component/TaskBackend";
import taskPosition from "../analytics_overview/TaskPlacement";
import classNames from "classnames";

interface TaskQueryResult {
   id: number;
   title: string;
   timestamp: string;
}

export default function TaskDisplay({
   editSavedTask,
   dashboardBtn , 
   dashboardRoute,
}: {
   editSavedTask: (taskId: number) => void;
   dashboardBtn : string; 
   dashboardRoute: string;
}): JSX.Element {
   const [tasks, setTasks] = useState<TaskQueryResult[]>([]);
   const [taskStyle, setTaskStyle] = useState<{ [key: number]: React.CSSProperties }>({});
   const [isStylesReady, setIsStylesReady] = useState(false);

   async function fetchTasks(dashboardBtn: string,dashboardRoute: string) {
      try {
         const queryResult = await showSavedTaskSummaryView(dashboardBtn,dashboardRoute );
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
   }

   async function setTaskPlacement(id: number): Promise<React.CSSProperties> {
      try {
         const taskPositionArray = (await taskPosition(dashboardBtn,dashboardRoute)) || [];
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

   useEffect(() => {
      fetchTasks(dashboardBtn,dashboardRoute).then(() => setIsStylesReady(true));
   }, [dashboardBtn,dashboardRoute]);

   const containerClass = classNames({
      [taskDisplay.container_loader]: !isStylesReady,
      [taskDisplay.container]: isStylesReady,
   });

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
                                 onClick={() => editSavedTask(task.id)}
                              >
                                 View
                              </button>
                              <button className={taskDisplay.task_options}>Done</button>
                           </div>
                           <div className={taskDisplay.bottom_row}>
                              <button className={taskDisplay.task_options}>Arch</button>
                              <button className={taskDisplay.task_options}>Del</button>
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
