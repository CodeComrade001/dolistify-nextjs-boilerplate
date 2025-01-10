"use client";
import { useEffect, useState, useMemo } from "react";
import editSavedTask from "../../styles/editSavedTask.module.css";
import { showSavedTaskDetailView, updateTaskInformation } from "../backend_component/TaskBackend";

interface savedTaskDataType {
   title: string;
   subtasks: Array<{ id: number; description: string }>;
   status : Array<{id :number; completed : boolean ; missed : boolean}>;
}

export default function EditSavedTask({
   closeEditTaskView,
   dashboardBtn,
   dashBoardRoute,
   taskId,
}: {
   closeEditTaskView: () => void;
   taskId?: number | null;
   dashboardBtn?: string;
   dashBoardRoute?: string;
}): JSX.Element {
   const [savedTask, setSavedTask] = useState<savedTaskDataType>();
   const [editedTask, setEditedTask] = useState<savedTaskDataType>();
   const [savedTaskStatus, setSavedTaskStatus] = useState<String>("Update")

   const addNewTaskRow = (prevTask: savedTaskDataType | undefined): savedTaskDataType | undefined => {
      if (!prevTask) return undefined;

      const newTask = { id: prevTask.subtasks.length + 1, description: "" };
      return { ...prevTask, subtasks: [...prevTask.subtasks, newTask] };
   };

   const addExtraInputColumn = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Enter") {
         setSavedTask((prevTask) => addNewTaskRow(prevTask));
         setEditedTask((prevTask) => addNewTaskRow(prevTask));
      }
   };

   const deleteTaskRow = (prevTask: savedTaskDataType | undefined, index: number): savedTaskDataType | undefined => {
      if (!prevTask) return undefined;

      if (index < 0 || index >= prevTask.subtasks.length) {
         console.error("Invalid index for deletion.");
         return prevTask; // Return the unchanged object if the index is invalid
      }
      if (prevTask.subtasks.length !== 1) {
         // Create updated task array
         const updatedSubtasks = [
            ...prevTask.subtasks.slice(0, index),
            ...prevTask.subtasks.slice(index + 1)
         ];
         // Return updated object while preserving the structure
         return { ...prevTask, subtasks: updatedSubtasks };
      }
      // If there's only one task, return undefined to indicate deletion
      return { ...prevTask }
   };

   const deleteInputTaskRow = (index: number) => {
      setSavedTask((prevTask) => deleteTaskRow(prevTask, index))
      setEditedTask((prevTask) => deleteTaskRow(prevTask, index))
   };

   const updateSavedTask = async (taskId: number) => {
      if (!editedTask) return;
      try {
         setSavedTaskStatus("Saving task...")
         const updatingId = taskId;
         const updatedTaskDetails = editedTask;
         const updatingTask = await updateTaskInformation(dashboardBtn, dashBoardRoute, updatedTaskDetails, updatingId)
         if (updatingTask) {
            setSavedTaskStatus("Updating successful");
            closeEditTaskView();
         }
         setSavedTaskStatus("Updating failed");
      } catch (error: unknown) {
         setSavedTaskStatus("Updating Failed");
         const errorMessage = (error instanceof Error) ? error.message : "unknown Error";
         console.log("Error send Task Details", errorMessage);
      }

   };

   // Fetch and set task data
   useEffect(() => {
      async function savedTaskQuery() {
         try {
            if (taskId != null) {
               const savedTaskArray = await showSavedTaskDetailView(taskId, dashboardBtn, dashBoardRoute);
               console.log("🚀 ~ savedTaskQuery ~ savedTaskArray:", savedTaskArray)

               const taskFormat = {
                  ...savedTaskArray,
                  subtasks: JSON.parse(savedTaskArray.subtasks),
               };
               console.log("🚀 ~ savedTaskQuery ~ taskFormat:", taskFormat)

               setSavedTask(taskFormat); // Save the processed task
               setEditedTask(taskFormat);
            } else {
               console.warn("Invalid taskId provided. Skipping query.");
            }
         } catch (error: unknown) {
            console.error("Error Fetching Task:", error);
         }
      }

      savedTaskQuery();
   }, [taskId, dashboardBtn, dashBoardRoute]);

   return (
      <>
         {
            savedTask &&
            (
               <div key={taskId} className={editSavedTask.container}>
                  {/* Task Title */}
                  <div className={editSavedTask.title}>
                     <p className={editSavedTask.task_condition}>{savedTask.title}</p>
                  </div>

                  {/* Header Section */}
                  <div className={editSavedTask.header}>
                     <div className={editSavedTask.moreTitleDetails}>
                        {/* Show Completed Task */}
                        <div className={editSavedTask.dashboard}>
                           Completed task
                        </div>

                        {/* Show Remaining Task Not Completed */}
                        <div className={editSavedTask.editing_items}>
                           Remaining Task
                        </div>

                        {/* Input for Task Title */}
                        <div className={editSavedTask.editing_new_title}>
                           <input
                              type="text"
                              value={savedTask.title}
                              className={editSavedTask.input_new_Title}
                              placeholder={savedTask.title}
                              onChange={(e) => {
                                 const updatedTitle = e.target.value;
                                 setSavedTask((prevTask) => prevTask ? { ...prevTask, title: updatedTitle } : prevTask);
                                 setEditedTask((prevTask) => prevTask ? { ...prevTask, title: updatedTitle } : prevTask);
                              }} />
                        </div>

                        {/* Close Button */}
                        <button
                           className={editSavedTask.close_task}
                           onClick={(e) => {
                              e.stopPropagation();
                              closeEditTaskView();
                           }}
                        >
                           Close
                        </button>
                     </div>
                  </div>

                  {/* Task Table */}
                  <div className={editSavedTask.table_container}>
                     <table className={editSavedTask.task_table}>
                        <tbody className={editSavedTask.table_body}>
                           {savedTask.subtasks.map((eachTask, index) => (
                              <tr key={eachTask.id} className={editSavedTask.content}>
                                 <th className={editSavedTask.mark}>
                                    <div className={editSavedTask.taskCount}>{index}</div>
                                 </th>
                                 <td className={editSavedTask.user_text}>
                                    <input
                                       type="text"
                                       className={editSavedTask.user_input}
                                       value={eachTask.description}
                                       placeholder="Enter a new Task"
                                       onChange={(e) => {
                                          const updatedDescription = e.target.value;
                                          setSavedTask((prevTask) => {
                                             if (!prevTask) return undefined;
                                             const updatedTasks = [...prevTask.subtasks];
                                             updatedTasks[index].description = updatedDescription;
                                             return { ...prevTask, subtasks: updatedTasks };
                                          });
                                          setEditedTask((prevTask) => {
                                             if (!prevTask) return undefined;
                                             const updatedTasks = [...prevTask.subtasks];
                                             updatedTasks[index].description = updatedDescription;
                                             return { ...prevTask, subtasks: updatedTasks };
                                          });
                                       }}
                                       onKeyDown={(e) => addExtraInputColumn(e, index)}
                                    />
                                 </td>
                                 <td
                                    className={editSavedTask.user_delete}
                                    onClick={() => deleteInputTaskRow(index)}
                                 >
                                    <svg
                                       viewBox="0 0 512 512"
                                       version="1.1"
                                       width="20"
                                       height="20"
                                       xmlns="http://www.w3.org/2000/svg"
                                       xmlnsXlink="http://www.w3.org/1999/xlink"
                                       fill="#ff0303"
                                    >
                                       <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                       <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                       <g id="SVGRepo_iconCarrier">
                                          <title>error-filled</title>
                                          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                                             <g id="add" fill="#ff0303" transform="translate(42.666667, 42.666667)">
                                                <path
                                                   d="M213.333333,3.55271368e-14 C331.136,3.55271368e-14 426.666667,95.5306667 426.666667,213.333333 C426.666667,331.136 331.136,426.666667 213.333333,426.666667 C95.5306667,426.666667 3.55271368e-14,331.136 3.55271368e-14,213.333333 C3.55271368e-14,95.5306667 95.5306667,3.55271368e-14 213.333333,3.55271368e-14 Z M262.250667,134.250667 L213.333333,183.168 L164.416,134.250667 L134.250667,164.416 L183.168,213.333333 L134.250667,262.250667 L164.416,292.416 L213.333333,243.498667 L262.250667,292.416 L292.416,262.250667 L243.498667,213.333333 L292.416,164.416 L262.250667,134.250667 Z"
                                                   id="Combined-Shape"
                                                ></path>
                                             </g>
                                          </g>
                                       </g>
                                    </svg>
                                 </td>
                                 <td className={editSavedTask.user_complete}>
                                    <svg height="20" width="20" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#0ad406">
                                       <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                       <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                       <g id="SVGRepo_iconCarrier">
                                          <path
                                             fill="#0ad406"
                                             d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
                                          ></path>
                                       </g>
                                    </svg>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Save Button */}
                  <button
                     className={editSavedTask.update_details}
                     onClick={(e) => {
                        if (taskId) {
                           e.stopPropagation();
                           updateSavedTask(taskId);
                        }
                     }}
                  >
                     {savedTaskStatus}
                  </button>
               </div>
            )
         }
      </>
   );
}
