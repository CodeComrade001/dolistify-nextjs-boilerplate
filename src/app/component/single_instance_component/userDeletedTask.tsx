import React, { useCallback, useEffect, useState } from "react";
import DeletedTaskStyles from "../../styles/deletedTask.module.css";
import { deletedTaskDetails, deletePermanently, restoreDeletedTask } from "../backend_component/TaskBackend";
import LoaderIcon from "../reusable_component/LoadingIcon";

interface savedTaskDataType {
   id: string;
   title: string;
   timestamp: string;
   subtasks: Array<{ id: number; description: string }>;
   status: Array<{ id: number; completed: boolean; missed: boolean }>;
}

export default function DeletedTask() {
   const [dashboard, setDashboard] = useState<"Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task" | "Task Group">("Task Group");
   const [dashboardRoute, setDashboardRoute] = useState<"high_priority Task" | "main Task" | "Deadline Task" | "archived Task" | "Task Category">("Task Category");
   const [activeSelection, setActiveSelection] = useState<"none" | "dashboardGroup" | "dashboardRoute">("none");
   const [dashboardBtn, setDashboardBtn] = useState<"Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task" | "">("");
   const [activeDashboardBtn, setActiveDashboardBtn] = useState<"personal" | "work" | "time_bound" | "repeated">("personal");
   const [activeDashboardRoute, setActiveDashboardRoute] = useState<"upComing" | "high_priority" | "main" | "archived" | "time_deadline" | "date_deadline">("high_priority");
   const [tasks, setTasks] = useState<savedTaskDataType[]>([]);
   // State to control how many tasks to show (4 per load)
   // const [visibleCount, setVisibleCount] = useState(4);
   function handleSelection(selection: "dashboardGroup" | "dashboardRoute") {
      setActiveSelection((prevSelection) => (
         prevSelection === selection ? "none" : selection
      ));
   }
   const [taskIsLoading, setTaskIsLoading] = useState<boolean>(true)

   const handleOptionClick = (option: "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task") => {
      const dashboard = dashboardRouteOptions(option).activeDashboard;

      setDashboardBtn(option);
      setDashboard(option);
      setActiveDashboardBtn(dashboard as "personal" | "work" | "time_bound" | "repeated");
      setActiveSelection("none");
   };

   function dashboardRouteOptions(category: "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task" | "") {
      switch (category) {
         case "Personal Task":
            return {
               routeOptions: ["high_priority Task", "main Task", "archived Task"],
               activeDashboard: "personal",
               activeRouteOptions: ["high_priority", "main", "archived"],
            }
         case "Work Task":
            return {
               routeOptions: ["high_priority Task", "main Task", "archived Task"],
               activeDashboard: "work",
               activeRouteOptions: ["high_priority", "main", "archived"],
            }
         case "Time-bound Task":
            return {
               routeOptions: ["archived Task", "Time Deadline Task", "Date Deadline Task"],
               activeDashboard: "time_bound",
               activeRouteOptions: ["archived", "time_deadline", "date_deadline"],
            }
         case "Repeated Task":
            return {
               routeOptions: ["high_priority Task", "main Task", "archived Task", "Time Deadline Task", "Date Deadline Task"],
               activeDashboard: "repeated",
               activeRouteOptions: ["high_priority", "main", "archived", "time_deadline", "date_deadline"],
            }
         case "":
            return {
               routeOptions: [],
               activeDashboard: "",
               activeRouteOptions: [],
            }
      }
   }

   function getUserDate(timestamp: string): string {
      return new Date(timestamp).toLocaleString("en-US", {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric",

      });
   }

   function getUserTime(timestamp: string): string {
      return new Date(timestamp).toLocaleString("en-US", {
         hour: "2-digit",
         minute: "2-digit",
         second: "2-digit",
         hour12: false,
      });

   }

   const handleDeletedTaskUpdate = useCallback(async (id: string, condition: "delete" | "restore"): Promise<boolean> => {
      // no ID → nothing to do
      if (!id) return false;

      // pick the correct backend call
      const apiFn =
         condition === "delete" ? deletePermanently : restoreDeletedTask;

      const result = await apiFn(id, activeDashboardBtn, activeDashboardRoute);
      console.log("🚀 ~ handleDeletedTaskUpdate ~ result:", result)
      if (!result) return false;

      // in either case, remove the task from *this* list
      setTasks((prev) => prev.filter((t) => t.id !== id));

      return true;
   },
      [activeDashboardBtn, activeDashboardRoute]
   );



   useEffect(() => {
      async function fetchDeletedTaskDetails() {
         const dashboardBtn = activeDashboardBtn;
         const dashboardRoute = activeDashboardRoute;
         try {
            const queryResult = await deletedTaskDetails(dashboardBtn, dashboardRoute);
            if (!queryResult) {
               setTaskIsLoading(false)
               setTasks([]);
               return;
            }

            if (Array.isArray(queryResult)) {
               // setTasks(queryResult.slice(0, visibleCount));
               setTaskIsLoading(false)
               setTasks(queryResult);
            } else {
               setTaskIsLoading(false)
               setTasks([queryResult]);
            }
         } catch {
            setTasks([]);
         }
      }

      fetchDeletedTaskDetails();
   }, [activeDashboardBtn, activeDashboardRoute]);




   const dashboardOptionsQuery = dashboardRouteOptions(dashboardBtn as "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task");

   return (
      <div className={DeletedTaskStyles.container}>
         <div className={DeletedTaskStyles.deleted_items_header}>
            <h2 className={DeletedTaskStyles.welcome_message}>
               Deleted Task
            </h2>
            <div className={DeletedTaskStyles.dashboard}>
               <button
                  className={DeletedTaskStyles.dashboard_group_item}
                  onClick={() => handleSelection("dashboardGroup")}
               >
                  {dashboard}
                  <div className={DeletedTaskStyles.selector_icon}>
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
                              fill="white"
                           />
                        </g>
                     </svg>
                  </div>
               </button>
               {activeSelection === "dashboardGroup" && (
                  <div className={DeletedTaskStyles.group_selector_container}>
                     {["Personal Task", "Work Task", "Time-bound Task", "Repeated Task"].map((option) => (
                        <button
                           key={option}
                           className={DeletedTaskStyles.dashboard_options}
                           onClick={() => handleOptionClick(option as "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task")}
                        >
                           {option}
                        </button>
                     ))}
                  </div>
               )}
            </div>
            <div className={DeletedTaskStyles.dashboard_route}>
               <button
                  className={DeletedTaskStyles.dashboard_route_items}
                  onClick={() => handleSelection("dashboardRoute")}
               >
                  {dashboardRoute}
                  <div className={DeletedTaskStyles.selector_icon}>
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
                              fill="white"
                           />
                        </g>
                     </svg>
                  </div>
               </button>
               {activeSelection === "dashboardRoute" && (
                  <div className={DeletedTaskStyles.route_selector_container}>
                     {dashboardOptionsQuery.routeOptions.map((route, index) => (
                        <button
                           key={route}
                           className={DeletedTaskStyles.dashboard_options}
                           onClick={() => {
                              const options = dashboardRouteOptions(dashboardBtn as "Personal Task" | "Work Task" | "Time-bound Task" | "Repeated Task"); // Ensure to fetch updated options
                              const routeOption = options.activeRouteOptions[index]; // Index matches the button
                              const dashboardRouteOption = options.routeOptions[index]
                              setActiveDashboardRoute(routeOption as "high_priority" | "main" | "archived" | "upComing");
                              setDashboardRoute(dashboardRouteOption as "high_priority Task" | "main Task" | "Deadline Task" | "archived Task");
                              setActiveSelection("none");
                           }}
                        >
                           {route}
                        </button>
                     ))}
                  </div>
               )}
            </div>
         </div>


         <div className={DeletedTaskStyles.task_table_container}>
            <div className={DeletedTaskStyles.task_table_header} >
               <div className={DeletedTaskStyles.task_table_header_title}>Title</div>
               <div className={DeletedTaskStyles.task_table_header_title}>Time</div>
               <div className={DeletedTaskStyles.task_table_header_title}>Date</div>
               <div className={DeletedTaskStyles.task_table_header_title}>status</div>
               {/* <th><h2>Status</h2></th> */}
            </div>
            <div className={DeletedTaskStyles.table_body}>
               {taskIsLoading ? (
                  // Render only the tasks up to the visibleCount
                  <LoaderIcon />
               ) : (
                  tasks?.map((item, index) => (
                     <div key={index} className={DeletedTaskStyles.each_task_container}>
                        <div className={DeletedTaskStyles.deleted_task_title}>{item.title}</div>
                        <div className={DeletedTaskStyles.deleted_task_time}>{getUserTime(item.timestamp)}</div>
                        <div className={DeletedTaskStyles.deleted_task_date}>{getUserDate(item.timestamp)}</div>
                        <div className={DeletedTaskStyles.deleted_task_condition}>
                           <button
                              title="delete Task"
                              className={DeletedTaskStyles.task_options}
                              onClick={() => handleDeletedTaskUpdate(item.id, "delete")}
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
                           <button
                              title="delete Task"
                              className={DeletedTaskStyles.task_options}
                              onClick={() => handleDeletedTaskUpdate(item.id, "restore")}
                           >
                              <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                                 <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                                 <g id="SVGRepo_iconCarrier">
                                    <path d="M5.68623 0H10.3138L12.178 3.27835L13.9282 2.26789L14.4282 3.13392L13.3301 7.232L9.23203 6.13392L8.73203 5.26789L10.4459 4.27837L9.15033 2L6.84966 2L6.29552 2.97447L4.56343 1.97445L5.68623 0Z" fill="white"></path>
                                    <path d="M13.1649 9.05964L13.7039 10.0076L12.6055 12H9.99998L9.99998 9.99995H8.99998L5.99998 12.9999L8.99998 15.9999H9.99998L9.99998 14H13.7868L15.996 9.99242L14.8969 8.05962L13.1649 9.05964Z" fill="white"></path>
                                    <path d="M3.39445 12H4.49998V14H2.21325L0.00390625 9.99242L1.8446 6.75554L0.0717772 5.732L0.571776 4.86598L4.66986 3.7679L5.76793 7.86598L5.26793 8.732L3.57669 7.75556L2.29605 10.0076L3.39445 12Z" fill="white"></path>
                                 </g>
                              </svg>
                           </button>
                        </div>
                     </div>
                  )))
               }
            </div>
         </div>
      </div >

   )
}