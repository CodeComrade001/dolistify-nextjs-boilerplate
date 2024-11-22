"use client";
import React, { useEffect, useState } from "react";
import taskDisplay from "../../styles/taskDisplay.module.css";
import { showSavedTaskSummaryView } from "../backend_component/TaskBackend";

interface TaskQueryResult {
   id: number;
   title: string;
   timestamp: string;
}

export default function TaskDisplay({
   editSavedTask,
}: {
   editSavedTask: (taskId: number) => void
}): JSX.Element {
   const [tasks, setTasks] = useState<TaskQueryResult[]>([]);
   const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
   const [TaskId, setTaskId] = useState<number | null>(null);

   // Fetch tasks from an external source
   async function fetchTasks() {
      try {
         const queryResult = await showSavedTaskSummaryView();
         console.log("🚀 ~ fetchTasks ~ queryResult:", queryResult)

         if (Array.isArray(queryResult)) {
            setTasks(queryResult);
         } else {
            setTasks([]);
         }
      } catch (error: unknown) {
         const errorMessage = error instanceof Error ? error.message : 'Unknown error';
         console.error("Error fetching tasks:", errorMessage);
         setTasks([]);
      }
   }

   function setTaskPlacement(id: number, index: number) {
      let style: React.CSSProperties = {};

      // Check the task id and apply corresponding grid placement styles
      if (id === 29) {
         style = { gridRowStart: 15 }; // Task with id 23 gets gridRowStart of 15
      } else if (id === 30) {
         style = {
            gridColumnStart: 19,
            gridRowStart: 19,
         }; // Task with id 4 gets gridColumnStart of 19
      } else if (id === 31) {
         style = {
            gridColumnStart: 18,
            gridRowStart: 12
         }; // Task with id 4 gets gridColumnStart of 19
      } else if (id === 32) {
         style = { gridColumnStart: 21 }; // Task with id 4 gets gridColumnStart of 19
      } else {
         style = { gridColumnStart: index + 1 }; // Fallback: All other tasks get gridColumnStart based on the index
      }

      return style;
   }

   function formatTimestamp(timestamp: string): string {
      return new Date(timestamp).toLocaleString("en-US", {
         weekday: "short",
         day: "numeric",
         hour: "numeric",
         minute: "numeric",
         second: "numeric",
         hour12: true,
      });
   }

   // Fetch tasks and set the task styles when component mounts
   useEffect(() => {
      fetchTasks(); // Fetch tasks when component mounts
   }, []);

   return (
      <div className={taskDisplay.container}>
         <div className={taskDisplay.task_list_items}>
            {tasks.map((task, index) => (
               <div
                  key={task.id}
                  data-key={task.id}
                  className={taskDisplay.new_task_position}
                  style={setTaskPlacement(task.id, index)}
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
                           <button
                              className={taskDisplay.task_options}
                           >
                              Done
                           </button>
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
      </div>
   );
}







