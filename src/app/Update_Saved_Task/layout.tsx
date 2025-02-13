"use client";

import React, { useEffect, useState } from "react";
import EditSavedTask from "./page";
import { useRouter } from 'next/router'

export default function NewTaskLayout() {
  const [taskId, setTaskId] = useState<number>();
  const [taskQueryPath, setTaskQueryPath] = useState<{ dashboardBtn: string, dashboardRoute: string }>({
    dashboardBtn: "",
    dashboardRoute: "",
  })
  const router = useRouter()
  const { param1, param2, param3 } = router.query;

  useEffect(() => {
    const savedTaskQuery = async () => {
      try {
        if (param1 && param2 && param3) {
          console.log("🚀 ~ savedTaskQuery ~ param3:", param3)
          console.log("🚀 ~ savedTaskQuery ~ param2:", param2)
          console.log("🚀 ~ savedTaskQuery ~ param1:", param1)
          setTaskId(parseInt(param1 as string));
          setTaskQueryPath({
            dashboardBtn: param2 as string,
            dashboardRoute: param3 as string,
          });
        } else {
          console.log("error fetching params for saved task🚀 ~ savedTaskQuery ~ param3:", param3)
          console.log("error fetching params for saved task🚀 ~ savedTaskQuery ~ param1:", param1)
          console.log("error fetching params for saved task🚀 ~ savedTaskQuery ~ param2:", param2)
        }

      } catch (error: unknown) {
        console.error("error fetching params: ", error)
      }
    }
    savedTaskQuery();
  }, [param1, param2, param3]);

  return (
    <section className="body_section">
      {taskId && taskQueryPath.dashboardBtn && taskQueryPath.dashboardRoute? (
        <EditSavedTask
          taskId={taskId}
          dashboardBtn={taskQueryPath.dashboardBtn}
          dashboardRoute={taskQueryPath.dashboardRoute}
        />
      ) : (
        <p>Loading...</p>
      )}
    </section>
  )
}