// app/Dashboard/page.tsx
"use client";
import React, { useState, useEffect, Suspense } from "react";
import EditSavedTask from "./updateSavedTask";
import savedTaskStyles from "../styles/savedTaskLayout.module.css";
import { useSearchParams } from 'next/navigation';

export default function UpdateSavedTaskHomePage() {
  // replicate the same state/hooks/logic you had in DashboardLayout:
  const [taskId, setTaskId] = useState<string>();
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
          setTaskId(param1);
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

  function SearchBarFallback() {
    return <>fetch updatedTask please wait</>
  }

  return (
    <section className={savedTaskStyles.body_section}>
       <Suspense fallback={<SearchBarFallback />}>
      {taskId && taskQueryPath.dashboardBtn && taskQueryPath.dashboardRoute ? (
        <EditSavedTask
          taskId={taskId}
          dashboardBtn={taskQueryPath.dashboardBtn}
          dashboardRoute={taskQueryPath.dashboardRoute}
        />
      ) : (
        <p> fetching task animation Loading...</p>
      )}
      </Suspense>
    </section>
  );
}
