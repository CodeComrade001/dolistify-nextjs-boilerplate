"use client";

import React, { useEffect, useState } from "react";
import NewTaskStyle from "../styles/newTaskLayout.module.css"
import AddNewTask from "./page";

export default function NewTaskLayout() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [])

  return (
    <section className={`${NewTaskStyle.body_section} ${theme === 'light' ? NewTaskStyle.dashboard_body_whiteTheme : NewTaskStyle.dashboard_body_blackTheme}`}>
      <AddNewTask />
    </section>
  )
}