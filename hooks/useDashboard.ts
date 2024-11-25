import { useState } from "react";

export function useDashboard() {
   const [fullViewTaskQuery, setFullViewTaskQuery] = useState(false);
   const [taskEditView, setTaskEditView] = useState(false);

   function showTaskView() {
      setFullViewTaskQuery(true);
   }

   function closeFullTask() {
      setFullViewTaskQuery(false);
      setTaskEditView(false);
   }

   function showSavedTaskView() {
      setTaskEditView(true);
   }

   return {
      fullViewTaskQuery,
      taskEditView,
      showTaskView,
      closeFullTask,
      showSavedTaskView,
   };
}
