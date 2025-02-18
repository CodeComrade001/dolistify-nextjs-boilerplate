"use client";

import React from "react";
import NewTaskStyle from "../styles/newTaskLayout.module.css"
import AddNewTask from "./page";

export default function NewTaskLayout() {

  return (
    <section className={NewTaskStyle.body_section}>
      <AddNewTask />
    </section>
  )
}