"use client";
import { useEffect, useState } from "react";
import editSavedTask from "../../styles/editSavedTask.module.css";
import { showSavedTaskDetailView } from "../backend_component/TaskBackend";

export default function EditSavedTask({
   closeEditTaskView,
   taskId,
}: {
   closeEditTaskView: () => void;
   taskId?: number | null,
}): JSX.Element {
   const [activeSelection, setActiveSelection] = useState<"none" | "dashboardGroup" | "dashboardRoute">("none");
   const [rows, setRows] = useState([{ id: 1, userInput: "" }]);


   function handleSelection(selection: "dashboardGroup" | "dashboardRoute") {
      setActiveSelection((prevSelection) =>
         prevSelection === selection ? "none" : selection
      );
   }

   useEffect(() => {
      async function savedTaskQuery() {
         try {
            const receivedTableName = "personal_task";
            if (taskId != null) {
               const result = await showSavedTaskDetailView(taskId, receivedTableName);
               console.log("🚀 ~ savedTaskQuery ~ result:", result)
               // Set fetched rows to state (if applicable)
               // if (result) {
               //    setRows(result);
               // }
            } else {
               console.warn("Invalid taskId provided. Skipping query.");
            }
         } catch (error: unknown) {
            console.error("Error Fetching Task:", error);
         }
      }

      // Call the function inside the effect
      savedTaskQuery();
   }, [taskId]);

   return (
      <div className={editSavedTask.container} >

         <div className={editSavedTask.title}>
            <p className={editSavedTask.task_condition}>Editing : My Demo Title</p>
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
                        <button className={editSavedTask.dashboard_options}>Personal</button>
                        <button className={editSavedTask.dashboard_options}>Work</button>
                        <button className={editSavedTask.dashboard_options}>Time Bound</button>
                        <button className={editSavedTask.dashboard_options}>Completed</button>
                        <button className={editSavedTask.dashboard_options}>Missed</button>
                        <button className={editSavedTask.dashboard_options}>Goal</button>
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
                        <button className={editSavedTask.dashboard_options}>Upcoming Tasks</button>
                        <button className={editSavedTask.dashboard_options}>High-Priority</button>
                        <button className={editSavedTask.dashboard_options}>Primary Task</button>
                        <button className={editSavedTask.dashboard_options}>Deadline Task</button>
                        <button className={editSavedTask.dashboard_options}>Time Bound</button>
                        <button className={editSavedTask.dashboard_options}>Missed Task</button>
                        <button className={editSavedTask.dashboard_options}>Custom Task</button>
                        <button className={editSavedTask.dashboard_options}>Archived Task</button>
                     </div>
                  )}
               </div>
               <div className={editSavedTask.editing_items}>
                  <title>Enter The Time Your tasks Should End</title>
                  <input type="time" className={editSavedTask.input_time} />
               </div>
               <div className={editSavedTask.editing_items}>
                  <title>Enter The Time Your tasks Should End</title>
                  <input type="text" className={editSavedTask.input_new_Title} placeholder="New Task Title" />
               </div>
               <button
                  className={editSavedTask.taskOptions_items}
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
                  <tr className={editSavedTask.content}>
                     <th className={editSavedTask.mark}>
                        <div className={editSavedTask.taskCount}> 1 </div>
                     </th>
                     <td className={editSavedTask.user_text}>
                        <input
                           type="text"
                           className={editSavedTask.user_input}
                           placeholder="Enter Your Task"
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
               </tbody>
            </table>
         </div>
         <button className={editSavedTask.update_details}>Save</button>
      </div>
   )
}
