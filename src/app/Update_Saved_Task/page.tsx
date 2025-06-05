"use client";
import React, { useState, useEffect, Suspense } from "react";
import EditSavedTask from "./updateSavedTask";
import savedTaskStyles from "../styles/savedTaskLayout.module.css";
import { useSearchParams } from 'next/navigation';

// Create a separate component for the content that uses useSearchParams
function SavedTaskContent() {
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

  if (!taskId || !taskQueryPath.dashboardBtn || !taskQueryPath.dashboardRoute) {
    return <p>Fetching task... Please wait</p>;
  }

  return (
    <EditSavedTask
      taskId={taskId}
      dashboardBtn={taskQueryPath.dashboardBtn}
      dashboardRoute={taskQueryPath.dashboardRoute}
    />
  );
}

export default function UpdateSavedTaskHomePage() {
  return (
    <section className={savedTaskStyles.body_section}>
      <Suspense fallback={<p>Loading task data...</p>}>
        <SavedTaskContent />
      </Suspense>
    </section>
  );
}