"use client";

import { useState } from "react";
import fullTaskView from "../../styles/fullTaskView.module.css";
import insertTask from "../backend_component/TaskBackend";
import { useFormStatus } from "react-dom";

export default function AddNewTask({
   closeFullTaskView,
}: {
   closeFullTaskView: () => void;
}): JSX.Element {
   const [currentTaskTable, setCurrentTaskTable] = useState("personal_task");
   const [submitCondition, setSubmitCondition] = useState("Done");
   const [save, setSave] = useState(false);
   const { pending } = useFormStatus();
   const [rows, setRows] = useState([{ id: 1, userInput: "" }]);
   const [newTaskTitle, setNewTaskTitle] = useState("")


   function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
      setNewTaskTitle(event.target.value);
   }

   async function insertIntoDB() {
      const userEmail = "john.doe@example.com";
      const taskDetailsJSON = {
         title: newTaskTitle,
         subtasks: rows.map((row, index) => ({
            id: index + 1,
            description: row.userInput,
         })),
      };
      console.log("🚀 ~ insertIntoDB ~ taskDetailsJSON:", taskDetailsJSON)
      const status = "completed"

      const isAnyRowEmpty = rows.some(row => row.userInput.trim() === "");
      if (isAnyRowEmpty) {
         setSubmitCondition("Empty Input");
         setSave(false);
         return;
      }

      // Iterate through each row to insert each task individually
      const success = await insertTask(currentTaskTable, userEmail, taskDetailsJSON, status);
      setSubmitCondition(success ? "Successful" : "Failed");
      setSave(false);
   }

   const addExtraRow = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Enter") {
         if (rows[index].userInput.trim() === "") return;

         setRows([...rows, { id: rows.length + 1, userInput: "" }]);
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const updatedRows = rows.map((row, idx) =>
         idx === index ? { ...row, userInput: e.target.value } : row
      );
      setRows(updatedRows);
   };

   return (
      <div className={fullTaskView.taskView_items}>
            <div className={fullTaskView.taskHeader}>
               <div className={fullTaskView.taskSelector}>
                  <label className={fullTaskView.label} htmlFor="taskSelection">Select Task Category: </label>
                  <select
                     id="taskSelection"
                     value={currentTaskTable} // Control the selected value
                     onChange={(e) => setCurrentTaskTable(e.target.value)}
                     className={fullTaskView.taskDropdown}>
                     <option className={fullTaskView.option} value="auto select">Auto Select</option>
                     <option className={fullTaskView.option} value="upcoming">Upcoming Tasks</option>
                     <option className={fullTaskView.option} value="highPriority">High-Priority</option>
                     <option className={fullTaskView.option} value="primary">Primary Task</option>
                     <option className={fullTaskView.option} value="deadline">Deadline Task</option>
                     <option className={fullTaskView.option} value="missed">Missed Task</option>
                     <option className={fullTaskView.option} value="custom">Custom Task</option>
                     <option className={fullTaskView.option} value="archived">Archived Task</option>
                  </select>
               </div>
               <div className={fullTaskView.taskOptions}>
                  <button className={fullTaskView.taskOptions_items}>Timer % Date</button>
                  <input
                     onChange={handleTitleChange}
                     type="text"
                     placeholder="Enter a title for your task"
                     value={newTaskTitle}
                     className={fullTaskView.task_title_input}
                  />
                  <button className={fullTaskView.taskOptions_items}> Edit </button>
                  <button
                     className={fullTaskView.taskOptions_items}
                     onClick={(e) => {
                        e.stopPropagation();
                        closeFullTaskView();
                     }}
                  >
                     close
                  </button>
               </div>
            </div>
            <div className={fullTaskView.grid_section}>
               <table className={fullTaskView.task_table}>
                  <tbody className={fullTaskView.table_body}>
                     {rows.map((row, index) => (
                        <tr key={row.id} className={fullTaskView.content}>
                           <th className={fullTaskView.mark}>
                              <div className={fullTaskView.taskCount}> {index + 1} </div>
                           </th>
                           <td className={fullTaskView.user_text}>
                              <input
                                 type="text"
                                 value={row.userInput}
                                 onChange={(e) => handleInputChange(e, index)}
                                 onKeyDown={(e) => addExtraRow(e, index)}
                                 className={fullTaskView.user_input}
                              />
                           </td>
                           <td className={fullTaskView.user_delete}>
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
                           <td className={fullTaskView.user_complete}>
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
         <button
            className={fullTaskView.send}
            onClick={insertIntoDB}
            disabled={pending || save} // Button disabled while pending or saving
            type="submit"
         >
            {save ? "Submitting..." : submitCondition}
         </button>
      </div>
   );
}