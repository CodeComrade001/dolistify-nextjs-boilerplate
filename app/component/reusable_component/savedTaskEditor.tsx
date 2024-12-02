"use client";
import { useEffect, useState } from "react";
import editSavedTask from "../../styles/editSavedTask.module.css";
import { showSavedTaskDetailView } from "../backend_component/TaskBackend";

interface savedTaskDataType {
   tasktitle: string;
   alltask: Array<{ id: number; description: string }>
}

export default function EditSavedTask({
   closeEditTaskView,
   taskId,
}: {
   closeEditTaskView: () => void;
   taskId?: number | null,
}): JSX.Element {
   const [activeSelection, setActiveSelection] = useState<"none" | "dashboardGroup" | "dashboardRoute">("none");
   const [savedTask, setSavedTask] = useState<savedTaskDataType[]>([])
   const [editedTask, setEditedTask] = useState<savedTaskDataType | null>(null);

   function handleSelection(selection: "dashboardGroup" | "dashboardRoute") {
      setActiveSelection((prevSelection) =>
         prevSelection === selection ? "none" : selection
      );
   }

   function addExtraRow() {

   }

   async function updateSavedTask() {
      if (!editedTask) return; // If no edits are made, return
      const jsonFormat = JSON.stringify(editedTask)
      console.log("🚀 ~ updateSavedTask ~ jsonFormat:", jsonFormat)

      // try {
      //    // Simulate API call to update the task
      //    await updateTaskAPI(editedTask); // Replace with your actual API call
      //    alert("Task updated successfully!");

      //    // Update savedTask with the edited data after successful save
      //    setSavedTask((prevTasks) =>
      //       prevTasks.map((task) =>
      //          task.id === editedTask.id ? { ...editedTask } : task
      //       )
      //    );

      //    // Reset editedTask to null after saving
      //    setEditedTask(null);
      // } catch (error) {
      //    console.error("Failed to update task:", error);
      // }
   }

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
               const task = savedTaskArray[0];
               if (typeof task.alltask === "string") {
                  task.alltask = JSON.parse(task.alltask); // Parse the stringified array
               }

               console.log("🚀 ~ savedTaskQuery ~ processed task:", task);
               setSavedTask([task]); // Save the processed task
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
            savedTask.map((task) => (
               <div key={taskId} className={editSavedTask.container} >
                  <div className={editSavedTask.title} >
                     <p className={editSavedTask.task_condition}>Editing: {task.tasktitle}</p>
                  </div>
                  <div className={editSavedTask.header}>
                     <div className={editSavedTask.moreTitleDetails}>
                        <div className={editSavedTask.dashboard}  >
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
                        <div className={editSavedTask.editing_items}>
                           <button className={editSavedTask.dashboard_container} onClick={() => handleSelection("dashboardRoute")} >
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
                                 {["Upcoming Tasks", "High-Priority", "Primary Task", "Deadline Task", "Time Bound", "Missed Task", "Custom Task", "Archived Task"].map((route) => (
                                    <button key={route} className={editSavedTask.dashboard_options}>{route}</button>
                                 ))}
                              </div>
                           )}
                        </div>
                        <div className={editSavedTask.editing_items}>
                           <input type="time" className={editSavedTask.input_time} />
                        </div>
                        <div className={editSavedTask.editing_new_title}>
                           <input
                              type="text"
                              value={task.tasktitle}
                              className={editSavedTask.input_new_Title}
                              placeholder={task.tasktitle}
                              onChange={(e) => {
                                 const updatedTitle = e.target.value;
                                 setEditedTask((prevTask) => prevTask ? { ...prevTask, tasktitle: updatedTitle } : null);
                              }}
                           />
                        </div>
                        <button
                           className={editSavedTask.close_task}
                           onClick={(e) => {
                              e.stopPropagation();
                              closeEditTaskView();
                           }}
                        >
                           close
                        </button>
                     </div>
                  </div>
                  <div className={editSavedTask.table_container}>
                     <table className={editSavedTask.task_table}>
                        <tbody className={editSavedTask.table_body}>
                           {task.alltask.map((eachTask, index) => (
                              <tr className={editSavedTask.content} key={eachTask.id}>
                                 <th className={editSavedTask.mark}>
                                    <div className={editSavedTask.taskCount}> {eachTask.id} </div>
                                 </th>
                                 <td className={editSavedTask.user_text}>
                                    <input
                                       type="text"
                                       className={editSavedTask.user_input}
                                       value={eachTask.description}
                                       // placeholder={eachTask.description}
                                       onChange={(e) => {
                                          const updatedDescription = e.target.value;
                                          setEditedTask((prevTask) => {
                                             if (!prevTask) return null;
                                             const updatedAllTask = [...prevTask.alltask];
                                             updatedAllTask[index].description = updatedDescription;
                                             return { ...prevTask, alltask: updatedAllTask };
                                          });
                                       }}
                                       // onKeyDown={(e) => addExtraRow(e, index)}
                                    />
                                 </td>
                                 <td className={editSavedTask.user_delete}>
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
            ))}
      </>
   );
};
