import React from 'react';
import LoaderStyle from "../../styles/LoadingIcon.module.css";

export default function LoaderIcon() {
  return (
    <div className={LoaderStyle.loader_container}>
      <div className={LoaderStyle.loader}>
      </div>
    </div>
  )
} 