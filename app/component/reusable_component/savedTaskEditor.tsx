"use client";
import { useCallback, useEffect, useState, useMemo } from "react";
import editSavedTask from "../../styles/editSavedTask.module.css";
import { showSavedTaskDetailView } from "../backend_component/TaskBackend";

interface savedTaskDataType {
   tasktitle: string;
   alltask: Array<{ id: number; description: string }>;
}

export default function EditSavedTask({
   closeEditTaskView,
   taskId,
}: {
   closeEditTaskView: () => void;
   taskId?: number | null;
}): JSX.Element {
   const [activeSelection, setActiveSelection] = useState<"none" | "dashboardGroup" | "dashboardRoute">("none");
   const [savedTask, setSavedTask] = useState<savedTaskDataType>();
   const [editedTask, setEditedTask] = useState<savedTaskDataType>();


   function handleSelection(selection: "dashboardGroup" | "dashboardRoute") {
      setActiveSelection((prevSelection) => (
         prevSelection === selection ? "none" : selection
      ));
   }

   const addNewTaskRow = (prevTask: savedTaskDataType | undefined): savedTaskDataType | undefined => {
      if (!prevTask) return undefined;

      const newTask = { id: prevTask.alltask.length + 1, description: "" };
      return { ...prevTask, alltask: [...prevTask.alltask, newTask] };
   };

   const addExtraInputColumn = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Enter") {
         setSavedTask((prevTask) => addNewTaskRow(prevTask));
         setEditedTask((prevTask) => addNewTaskRow(prevTask));
      }
   };

   const deleteTaskRow = (prevTask: savedTaskDataType | undefined, index: number): savedTaskDataType | undefined => {
      if (!prevTask) return undefined;

      if (index < 0 || index >= prevTask.alltask.length) {
         console.error("Invalid index for deletion.");
         return prevTask; // Return the unchanged object if the index is invalid
      }
      if (prevTask.alltask.length !== 1) {
         // Create updated task array
         const updatedAlltask = [
            ...prevTask.alltask.slice(0, index),
            ...prevTask.alltask.slice(index + 1)
         ];
         // Return updated object while preserving the structure
         return { ...prevTask, alltask: updatedAlltask };
      }
      // If there's only one task, return undefined to indicate deletion
      return {...prevTask}
   };

   const deleteInputTaskRow = (index: number) => {
      setSavedTask((prevTask) => deleteTaskRow(prevTask, index))
      setEditedTask((prevTask) => deleteTaskRow(prevTask, index))
   };

   const updateSavedTask = async () => {
      if (!editedTask) return; // If no edits are made, return
      const jsonFormat = JSON.stringify(editedTask);
      console.log("🚀 ~ updateSavedTask ~ jsonFormat:", jsonFormat);
   };

   // Fetch and set task data
   useEffect(() => {
      async function savedTaskQuery() {
         try {
            const receivedTableName = "personal_task";
            if (taskId != null) {
               const savedTaskArray = await showSavedTaskDetailView(taskId, receivedTableName);

               // Ensure the response is an array
               if (!Array.isArray(savedTaskArray) || savedTaskArray.length === 0) {
                  console.warn("Unexpected response format or empty data");
                  return;
               }

               // Extract and parse the data
               var task = savedTaskArray[0];
               if (typeof task.alltask === "string") {
                  task.alltask = JSON.parse(task.alltask); // Parse the stringified array
               }

               console.log("🚀 ~ savedTaskQuery ~ processed task:", task);
               setSavedTask(task); // Save the processed task
               setEditedTask({ ...task });
            } else {
               console.warn("Invalid taskId provided. Skipping query.");
            }
         } catch (error: unknown) {
            console.error("Error Fetching Task:", error);
         }
      }

      savedTaskQuery();
   }, [taskId]);

   return (
      <>
         {
            savedTask &&
            <div key={taskId} className={editSavedTask.container}>
               {/* Task Title */}
               <div className={editSavedTask.title}>
                  <p className={editSavedTask.task_condition}>{savedTask.tasktitle}</p>
               </div>

               {/* Header Section */}
               <div className={editSavedTask.header}>
                  <div className={editSavedTask.moreTitleDetails}>
                     {/* Dropdown for Dashboard Group */}
                     <div className={editSavedTask.dashboard}>
                        <button
                           className={editSavedTask.dashboard_container}
                           onClick={() => handleSelection("dashboardGroup")}
                        >
                           <div className={editSavedTask.dashboard_selector}>Dashboard Group</div>
                           <div className={editSavedTask.selector_icon}>
                              <svg
                                 height="20"
                                 width="20"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                 <g id="svgBackground" strokeWidth="0"></g>
                                 <g id="svgTracer" strokeLinecap="round" strokeLinejoin="round"></g>
                                 <g id="iconCarrier">
                                    <path
                                       d="M8.00003 8.1716L3.41424 3.58582L0.585815 6.41424L8.00003 13.8285L15.4142 6.41424L12.5858 3.58582L8.00003 8.1716Z"
                                       fill="#000000"
                                    />
                                 </g>
                              </svg>
                           </div>
                        </button>
                        {activeSelection === "dashboardGroup" && (
                           <div className={editSavedTask.group_selector_container}>
                              {["Personal", "Work", "Time Bound", "Completed", "Missed", "Goal"].map((option) => (
                                 <button key={option} className={editSavedTask.dashboard_options}>{option}</button>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Dropdown for Dashboard Route */}
                     <div className={editSavedTask.editing_items}>
                        <button
                           className={editSavedTask.dashboard_container}
                           onClick={() => handleSelection("dashboardRoute")}
                        >
                           <div className={editSavedTask.dashboard_selector}>Dashboard Route</div>
                           <div className={editSavedTask.selector_icon}>
                              <svg
                                 height="20"
                                 width="20"
                                 viewBox="0 0 16 16"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg">
                                 <g id="svgBackground" strokeWidth="0"></g>
                                 <g id="svgTracer" strokeLinecap="round" strokeLinejoin="round"></g>
                                 <g id="iconCarrier">
                                    <path
                                       d="M8.00003 8.1716L3.41424 3.58582L0.585815 6.41424L8.00003 13.8285L15.4142 6.41424L12.5858 3.58582L8.00003 8.1716Z"
                                       fill="#000000"
                                    />
                                 </g>
                              </svg>
                           </div>
                        </button>
                        {activeSelection === "dashboardRoute" && (
                           <div className={editSavedTask.route_selector_container}>
                              {["Upcoming Tasks", "High-Priority", "Primary Task", "Archived Task"].map((route) => (
                                 <button key={route} className={editSavedTask.dashboard_options}>
                                    {route}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>

                     {/* Input for Task Title */}
                     <div className={editSavedTask.editing_new_title}>
                        <input
                           type="text"
                           value={savedTask.tasktitle}
                           className={editSavedTask.input_new_Title}
                           placeholder={savedTask.tasktitle}
                           onChange={(e) => {
                              const updatedTitle = e.target.value;
                              setSavedTask((prevTask) => prevTask ? { ...prevTask, tasktitle: updatedTitle } : prevTask);
                              setEditedTask((prevTask) => prevTask ? { ...prevTask, tasktitle: updatedTitle } : prevTask);
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
                        {savedTask.alltask.map((eachTask, index) => (
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
                                          const updatedTasks = [...prevTask.alltask];
                                          updatedTasks[index].description = updatedDescription;
                                          return { ...prevTask, alltask: updatedTasks };
                                       });
                                       setEditedTask((prevTask) => {
                                          if (!prevTask) return undefined;
                                          const updatedTasks = [...prevTask.alltask];
                                          updatedTasks[index].description = updatedDescription;
                                          return { ...prevTask, alltask: updatedTasks };
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
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Save Button */}
               <button
                  className={editSavedTask.update_details}
                  onClick={(e) => {
                     e.stopPropagation();
                     updateSavedTask();
                  }}
               >
                  Save
               </button>
            </div>
         }
      </>
   );
}
