"use client";

import React, { useEffect, useState } from "react";
import EditSavedTask from "./page";
import savedTaskStyles from "../styles/savedTaskLayout.module.css";
import { useSearchParams } from 'next/navigation';

export default function UpdateSavedTaskLayout() {
  const [taskId, setTaskId] = useState<number>();
  const [taskQueryPath, setTaskQueryPath] = useState<{ dashboardBtn: string, dashboardRoute: string }>({
    dashboardBtn: "",
    dashboardRoute: "",
  });
  
  const searchParams = useSearchParams();

  useEffect(() => {
    const savedTaskQuery = async () => {
      const param1 = searchParams.get("param1");
      const param2 = searchParams.get("param2");
      const param3 = searchParams.get("param3");

      try {
        if (param1 && param2 && param3) {
          console.log("🚀 ~ param3:", param3);
          console.log("🚀 ~ param2:", param2);
          console.log("🚀 ~ param1:", param1);
          setTaskId(parseInt(param1));
          setTaskQueryPath({
            dashboardBtn: param2,
            dashboardRoute: param3,
          });
        } else {
          console.log("Error fetching params:", { param1, param2, param3 });
        }
      } catch (error) {
        console.error("Error fetching params:", error);
      }
    };
    savedTaskQuery();
  }, [searchParams]);

  return (
    <section className={savedTaskStyles.body_section}>
      {taskId && taskQueryPath.dashboardBtn && taskQueryPath.dashboardRoute ? (
        <EditSavedTask
          taskId={taskId}
          dashboardBtn={taskQueryPath.dashboardBtn}
          dashboardRoute={taskQueryPath.dashboardRoute}
        />
      ) : (
        <p> fetching task animation Loading...</p>
      )}
    </section>
  );
}
