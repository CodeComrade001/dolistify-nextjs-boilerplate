"use client";

import React, { useCallback, useEffect, useState } from "react";
import helperScreenStyle from "../../styles/helperScreenStyle.module.css";



export default function HelperBar({ directlySentMessage, directSentMessageCategory }: { directlySentMessage?: string, directSentMessageCategory?: string }) {
   const [isHovered, setIsHovered] = useState(false);
   // randomMessage holds the current random message object
   const [randomMessage, setRandomMessage] = useState(messages[0]);
   const [hasMounted, setHasMounted] = useState(false);

   // This function returns the styles and icon based on the category
   const informationVerify = useCallback((category: "error" | "success" | "warning" | "alert" | "message") => {
      switch (category) {
         case "success":
            return {
               styles: {
                  border: "1px solid rgba(36, 241, 6, 1)",
                  backgroundColor: isHovered ? "rgba(7, 149, 66, 0.35)" : "rgba(7, 149, 66, 0.12)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #259c08",
                  color: "#0ad406",
                  textShadow: "0px 0px #0ad406",
               },
               icon: (
                  <svg height="23" width="23" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#0ad406">
                     <path
                        fill="#0ad406"
                        d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
                     ></path>
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_success,
            };
         case "message":
            return {
               styles: {
                  border: "1px solid rgba(6, 44, 241, 0.46)",
                  backgroundColor: isHovered ? "rgba(7, 73, 149, 0.35)" : "rgba(7, 73, 149, 0.12)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #0396ff",
                  color: "#0396ff",
                  textShadow: "0px 0px #0396ff",
               },
               icon: (
                  <svg viewBox="0 0 24 24" fill="none" width="23px" height="23px">
                     <circle cx="12" cy="12" r="9" stroke="#0396ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></circle>
                     <path d="M12 12V16" stroke="#0396ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_message,
            };
         case "warning":
            return {
               styles: {
                  border: "1px solid rgba(241, 142, 6, 0.81)",
                  backgroundColor: isHovered ? "rgba(220, 128, 1, 0.33)" : "rgba(220, 128, 1, 0.16)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #ffb103",
                  color: "#ffb103",
                  textShadow: "0px 0px #ffb103",
               },
               icon: (
                  <svg height="23" width="23" fill="#ffb103" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                     <path d="M520.741 163.801a10.234 10.234 0 00-3.406-3.406c-4.827-2.946-11.129-1.421-14.075 3.406L80.258 856.874a10.236 10.236 0 00-1.499 5.335c0 5.655 4.585 10.24 10.24 10.24h846.004c1.882 0 3.728-.519 5.335-1.499 4.827-2.946 6.352-9.248 3.406-14.075L520.742 163.802zm43.703-26.674L987.446 830.2c17.678 28.964 8.528 66.774-20.436 84.452a61.445 61.445 0 01-32.008 8.996H88.998c-33.932 0-61.44-27.508-61.44-61.44a61.445 61.445 0 018.996-32.008l423.002-693.073c17.678-28.964 55.488-38.113 84.452-20.436a61.438 61.438 0 0120.436 20.436zM512 778.24c22.622 0 40.96-18.338 40.96-40.96s-18.338-40.96-40.96-40.96-40.96 18.338-40.96 40.96 18.338 40.96 40.96 40.96zm0-440.32c-22.622 0-40.96 18.338-40.96 40.96v225.28c0 22.622 18.338 40.96 40.96 40.96s40.96-18.338 40.96-40.96V378.88c0-22.622-18.338-40.96-40.96-40.96z"></path>
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_warning,
            };
         case "error":
            return {
               styles: {
                  border: "1px solid rgba(241, 6, 6, 0.81)",
                  backgroundColor: isHovered ? "rgba(220, 17, 1, 0.33)" : "rgba(220, 17, 1, 0.16)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #ff0303",
                  color: "#ff0303",
                  textShadow: "0px 0px #ff0303",
               },
               icon: (
                  <svg viewBox="0 0 512 512" width="23" height="23" xmlns="http://www.w3.org/2000/svg" fill="#ff0303">
                     <path d="M213.333333,0C331.136,0,426.667,95.531,426.667,213.333S331.136,426.667,213.333,426.667,0,331.136,0,213.333,95.531,0,213.333,0ZM262.251,134.251,213.333,183.169,164.416,134.251,134.251,164.417,183.169,213.333,134.251,262.251,164.417,292.417,213.333,243.499,262.251,292.417,292.417,262.251,243.499,213.333,292.417,164.417,262.251,134.251Z" />
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_error,
            };
         case "alert":
            return {
               styles: {
                  border: "1px solid rgba(6, 241, 226, 0.81)",
                  backgroundColor: isHovered ? "rgba(1, 204, 220, 0.33)" : "rgba(1, 204, 220, 0.16)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #03fff5",
                  color: "#03d0ff",
                  textShadow: "0px 0px #03d0ff",
               },
               icon: (
                  <svg viewBox="0 0 24 24" fill="none" width="21" height="21">
                     <path d="M12.3657 0.888071C12.6127 0.352732 13.1484 0 13.75 0C14.9922 0 15.9723 0.358596 16.4904 1.29245C16.7159 1.69889 16.8037 2.13526 16.8438 2.51718C16.8826 2.88736 16.8826 3.28115 16.8826 3.62846L16.8825 7H20.0164C21.854 7 23.2408 8.64775 22.9651 10.4549L21.5921 19.4549C21.3697 20.9128 20.1225 22 18.6434 22H8L8 9H8.37734L12.3657 0.888071Z" fill="#03d0ff" />
                     <path d="M6 9H3.98322C2.32771 9 1 10.3511 1 12V19C1 20.6489 2.32771 22 3.98322 22H6L6 9Z" fill="#03d0ff" />
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_alert,
            };
         default:
            return {};
      }
   }, [isHovered]);

   // Choose which category to use: directSentMessageCategory takes precedence over random message's category.
   const currentCategory = directSentMessageCategory || randomMessage.category;
   const infoStyles = informationVerify(currentCategory as "error" | "success" | "warning" | "alert" | "message");

   // Update the random message every 30 seconds
   useEffect(() => {
      setHasMounted(true);
      const interval = setInterval(() => {
         const randomIndex = Math.floor(Math.random() * messages.length);
         setRandomMessage(messages[randomIndex]);
      }, 30000);
      return () => clearInterval(interval);
   }, []);

   // Use the fixed initial message during SSR and switch to random once mounted.
   const displayedMessage = directlySentMessage || (hasMounted ? randomMessage.message : messages[0].message);


   return (
      <div
         className={helperScreenStyle.container}
         style={infoStyles.styles}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         <div className={helperScreenStyle.bar} style={{ backgroundColor: infoStyles.styles?.color || "transparent" }}></div>
         <div className={`${helperScreenStyle.icon} ${infoStyles.iconAnimation}`}>{infoStyles.icon}</div>
         <div
            className={helperScreenStyle.text}
            style={{ textShadow: infoStyles.styles?.textShadow }}
         >
            {directlySentMessage || displayedMessage}
         </div>
      </div>
   );
}


const messages = [
   // Error messages (10)
   { category: "error", message: " Unable to load your tasks. Please check your network connection and try again." },
   { category: "error", message: " There was a problem fetching your tasks. Refresh the page or try again later." },
   { category: "error", message: " Task data retrieval failed. Verify your internet connection and retry." },
   { category: "error", message: " Oops! We couldn't load your tasks. Please check your connection and refresh." },
   { category: "error", message: " Failed to fetch task details. Please ensure you’re online and try again." },
   { category: "error", message: " An unexpected error occurred while retrieving tasks. Refresh to try again." },
   { category: "error", message: " Your tasks could not be accessed. Please check your network and try reloading." },
   { category: "error", message: " There’s a problem with task data. Verify your connection and retry." },
   { category: "error", message: " Task loading failed. Ensure your internet is stable and refresh the page." },
   { category: "error", message: " Unable to retrieve tasks at this time. Please check your connection and try again." },

   // Warning messages (10)
   { category: "warning", message: " Unsaved changes detected. Please save your work to avoid data loss." },
   { category: "warning", message: " Your task list has pending updates. Double-check before closing the window." },
   { category: "warning", message: " Some modifications haven’t been saved. Review your tasks now." },
   { category: "warning", message: " You have unsaved progress. Save your changes to secure your work." },
   { category: "warning", message: " Reminder to save your work. Uncommitted changes might be lost." },
   { category: "warning", message: " Your edits remain unsaved. Check your tasks and save your progress soon." },
   { category: "warning", message: " You’re about to exit with unsaved changes. Please save your tasks now." },
   { category: "warning", message: " There are unsaved modifications in your tasks. Consider saving them promptly." },
   { category: "warning", message: " Some changes remain unsaved. Review and secure your work without delay." },
   { category: "warning", message: " You have pending unsaved updates. Please check your task list and save." },

   // Success messages (10)
   { category: "success", message: " Your tasks have been updated. Take a moment to review the latest changes." },
   { category: "success", message: " New tasks have been added. Check your list to see the updates." },
   { category: "success", message: " Task refresh complete. Review your updated task list for details." },
   { category: "success", message: " Your task list is now up to date. Explore the latest assignments." },
   { category: "success", message: " New information is available in your task list. Please review for any changes." },
   { category: "success", message: " Tasks successfully loaded. Check your list to see what’s new." },
   { category: "success", message: " Your tasks have been refreshed. Explore the updates on your dashboard." },
   { category: "success", message: " Task update completed. Please review your list to stay informed." },
   { category: "success", message: " Your task list has been successfully updated. Verify the recent changes." },
   { category: "success", message: " All tasks loaded correctly. Check your dashboard for the latest details." },

   // Informational messages (10)
   { category: "message", message: " Regularly reviewing your tasks can help you stay organized and efficient." },
   { category: "message", message: " A quick look at your task list may reveal new priorities. Check it out!" },
   { category: "message", message: " Remember to review your tasks for any updates or new assignments." },
   { category: "message", message: " Keeping an eye on your task list ensures nothing important is missed." },
   { category: "message", message: " Your task list is your roadmap to success. Take a moment to review it." },
   { category: "message", message: " Stay on top of your responsibilities by frequently checking your tasks." },
   { category: "message", message: " A regular review of your tasks can boost your productivity. Have a look!" },
   { category: "message", message: " Make it a habit to check your tasks daily for a smoother workflow." },
   { category: "message", message: " Your task list is updated with the latest details. Plan your day by reviewing it." },
   { category: "message", message: " Small, regular checks on your tasks can lead to big productivity gains." },

   // Alert messages (10)
   { category: "alert", message: " Your session is about to expire. Please save any unsaved work immediately." },
   { category: "alert", message: " System maintenance is scheduled soon. Check your tasks and save your progress." },
   { category: "alert", message: " Your session will end shortly. Please review your tasks and secure unsaved changes." },
   { category: "alert", message: " Maintenance alert! Save your work now to avoid losing unsaved changes." },
   { category: "alert", message: " Your session is nearing its end. Ensure all tasks are saved before it expires." },
   { category: "alert", message: " Time is running out on your session. Review and save your tasks right away." },
   { category: "alert", message: " Critical: Your session will expire soon. Save any unsaved updates immediately." },
   { category: "alert", message: " Notice: Your session is about to end. Check your task list and secure your progress." },
   { category: "alert", message: " Your session is expiring soon. Please make sure your tasks are saved." },
   { category: "alert", message: " System notice: Save your work now as your session will end shortly." },
   // Additional Error messages (2)
   { category: "error", message: " Unable to connect to the task server. Please verify your network and try restarting the app." },
   { category: "error", message: " A critical issue occurred while loading tasks. Try closing and reopening the application." },

   // Additional Warning messages (2)
   { category: "warning", message: " Unsaved changes detected—please save your work before navigating away." },
   { category: "warning", message: " Some tasks haven't been refreshed in a while. Consider updating your task list to stay current." },

   // Additional Success messages (2)
   { category: "success", message: " Your tasks have been successfully synced. Take a moment to review the updated list." },
   { category: "success", message: " All task updates were applied smoothly. Check your dashboard for the latest details." },

   // Additional Informational messages (2)
   { category: "message", message: " Regularly checking your tasks can help you spot important updates and hidden priorities." },
   { category: "message", message: " A brief review of your task list might uncover new opportunities to improve your workflow." },

   // Additional Alert messages (2)
   { category: "alert", message: " Your session is nearing its end. Please save your progress and secure any unsaved tasks." },
   { category: "alert", message: " Immediate attention needed—your session will expire soon. Verify and save your current tasks now." },
   // Error messages (20)
   { category: "error", message: " Unable to connect to the task server. Please verify your network connection and try again." },
   { category: "error", message: " Failed to load tasks due to a server issue. Refresh the page and try again." },
   { category: "error", message: " An unexpected error occurred while fetching tasks. Check your connection and retry." },
   { category: "error", message: " Task retrieval unsuccessful. Ensure you're online and refresh the app." },
   { category: "error", message: " Network error while accessing tasks. Please verify your internet connection." },
   { category: "error", message: " Task data could not be loaded. Try reloading or checking your network settings." },
   { category: "error", message: " Unable to fetch task details. Your connection may be unstable—please try again." },
   { category: "error", message: " The application encountered a problem loading tasks. Refresh and retry." },
   { category: "error", message: " Failed to retrieve tasks. Please check your connection and try again shortly." },
   { category: "error", message: " We couldn’t load your tasks due to a network issue. Please refresh the page." },
   { category: "error", message: " Task loading failed because of connection issues. Refresh and check your network." },
   { category: "error", message: " There was an error fetching your tasks. Verify your internet and try once more." },
   { category: "error", message: " The server is not responding. Ensure your connection is active and refresh the page." },
   { category: "error", message: " Tasks could not be retrieved due to an unexpected error. Please check your network." },
   { category: "error", message: " We encountered an error while loading your tasks. Try restarting the application." },
   { category: "error", message: " Unable to access task information. Please confirm your connection and try again." },
   { category: "error", message: " Task data retrieval failed. A network hiccup might be to blame—please refresh." },
   { category: "error", message: " Your tasks could not be loaded due to a connection error. Try again later." },
   { category: "error", message: " Failed to fetch tasks. Please verify your network settings and try reloading." },
   { category: "error", message: " An error occurred while fetching your tasks. Check your connection and try again." },

   // Warning messages (20)
   { category: "warning", message: " Unsaved changes detected. Please save your work to avoid data loss." },
   { category: "warning", message: " You have pending unsaved edits. Save your changes before leaving the page." },
   { category: "warning", message: " Some changes haven't been saved. Ensure you save your work promptly." },
   { category: "warning", message: " Your recent edits are unsaved. Check your task list and save your progress." },
   { category: "warning", message: " Uncommitted changes found. Please review and save your work soon." },
   { category: "warning", message: " You have modifications that are not yet saved. Secure your progress by saving now." },
   { category: "warning", message: " There are unsaved updates in your tasks. Save your work to keep it safe." },
   { category: "warning", message: " Your task list has unsaved changes. Please save before proceeding further." },
   { category: "warning", message: " Unsaved progress detected. Save your work to ensure nothing is lost." },
   { category: "warning", message: " Please save your changes soon to avoid losing any unsaved task updates." },
   { category: "warning", message: " It looks like you have unsaved work. Take a moment to save your task list." },
   { category: "warning", message: " Your changes are pending save. Verify your task list and save immediately." },
   { category: "warning", message: " Unsaved modifications found. Save your work to secure your progress." },
   { category: "warning", message: " Some of your task edits haven’t been saved. Check and save your work promptly." },
   { category: "warning", message: " You might lose unsaved changes if you navigate away. Please save your tasks." },
   { category: "warning", message: " There are pending unsaved changes in your tasks. Secure your progress by saving." },
   { category: "warning", message: " Your work contains unsaved updates. Please save your task list as soon as possible." },
   { category: "warning", message: " Unsaved progress may be lost if not saved. Check and update your task list now." },
   { category: "warning", message: " Ensure all changes are saved. Unsaved work in your tasks could be lost." },
   { category: "warning", message: " You have unsaved edits that need attention. Save your work immediately." },

   // Success messages (20)
   { category: "success", message: " Your tasks have been successfully updated. Review the latest additions to stay informed." },
   { category: "success", message: " Task updates applied. Your task list is now current—take a moment to review it." },
   { category: "success", message: " All tasks loaded successfully. Explore the updated task list for new details." },
   { category: "success", message: " Task refresh complete. Your latest tasks are now available for review." },
   { category: "success", message: " Your task list is up-to-date. Check the dashboard for any new assignments." },
   { category: "success", message: " Tasks have been synced perfectly. Take a moment to explore the recent changes." },
   { category: "success", message: " Your task list was updated successfully. Review it now to see what's new." },
   { category: "success", message: " New task details have been loaded. Visit your task list to review the changes." },
   { category: "success", message: " Task updates were applied without issues. Check your dashboard for the latest tasks." },
   { category: "success", message: " All tasks have been refreshed. A quick review of your task list is recommended." },
   { category: "success", message: " Task synchronization is complete. Your updated list is ready for review." },
   { category: "success", message: " New tasks are now visible. Please check your task list for the latest updates." },
   { category: "success", message: " Your task list was updated seamlessly. Take a moment to verify the changes." },
   { category: "success", message: " Task update complete. Your list reflects the most recent changes." },
   { category: "success", message: " Your tasks have been refreshed. Review the list to see all current items." },
   { category: "success", message: " All task updates were successfully applied. Check your dashboard for new details." },
   { category: "success", message: " Your tasks have been reloaded. A review of your task list is encouraged." },
   { category: "success", message: " New task data is now available. Please review your task list for any additions." },
   { category: "success", message: " Task refresh was successful. Your updated list is ready for review." },
   { category: "success", message: " Your task list has been updated. Enjoy a seamless experience with the latest tasks." },

   // Informational messages (20)
   { category: "message", message: " Regularly reviewing your tasks can help you stay organized and efficient." },
   { category: "message", message: " A quick glance at your task list might reveal important updates you shouldn’t miss." },
   { category: "message", message: " Keep your productivity high by checking your tasks regularly for any new changes." },
   { category: "message", message: " Remember, staying updated with your task list can lead to better time management." },
   { category: "message", message: " Your task list is a great resource. Take a moment to review it for new opportunities." },
   { category: "message", message: " Frequently checking your tasks can boost your workflow and highlight new priorities." },
   { category: "message", message: " A steady review of your task list can help you catch any missed deadlines or updates." },
   { category: "message", message: " Staying on top of your tasks ensures you don’t overlook important details." },
   { category: "message", message: " Your tasks are updated in real-time. Regular checks can help you remain efficient." },
   { category: "message", message: " A quick review of your task list might uncover insights to improve your daily schedule." },
   { category: "message", message: " Keeping an eye on your tasks can help you prioritize and manage your time better." },
   { category: "message", message: " Your task list is your roadmap. Regular reviews keep you aligned with your goals." },
   { category: "message", message: " Check your task list often to stay informed of any new assignments or updates." },
   { category: "message", message: " Staying updated with your tasks is key to maintaining productivity and focus." },
   { category: "message", message: " A daily review of your task list can help streamline your work and boost productivity." },
   { category: "message", message: " Your task list reflects your priorities. Regular checks help keep you on track." },
   { category: "message", message: " Consistent monitoring of your tasks can lead to better organization and success." },
   { category: "message", message: " An updated task list is your tool for efficiency. Check it frequently for best results." },
   { category: "message", message: " Regular reviews of your tasks help ensure nothing important slips through the cracks." },
   { category: "message", message: " A proactive approach to reviewing tasks can enhance your productivity and success." },

   // Alert messages (20)
   { category: "alert", message: " Your session is about to expire. Save any unsaved work immediately." },
   { category: "alert", message: " System maintenance is scheduled soon. Check your tasks and secure your progress." },
   { category: "alert", message: " Your session will end shortly. Please review your tasks and save your work now." },
   { category: "alert", message: " Immediate attention needed—your session is expiring. Save your work to prevent data loss." },
   { category: "alert", message: " Critical update: Your session will expire soon. Save all progress right away." },
   { category: "alert", message: " Your session is nearing its end. Verify your tasks and secure unsaved changes." },
   { category: "alert", message: " Time is running out on your session. Please ensure all changes are saved promptly." },
   { category: "alert", message: " Your session will expire in a few minutes. Save your work to avoid losing progress." },
   { category: "alert", message: "  Your session is about to close. Confirm and save all unsaved work immediately." },
   { category: "alert", message: " Urgent: Your session is expiring soon. Secure your tasks by saving your progress now." },
   { category: "alert", message: " Your session is nearly over. Take a moment to save any unsaved work immediately." },
   { category: "alert", message: " Session ending soon. Please review your task list and save your changes before time runs out." },
   { category: "alert", message: " Your session is on the verge of expiring. Save your work to ensure nothing is lost." },
   { category: "alert", message: " Attention: Your session will expire shortly. Secure any unsaved tasks now." },
   { category: "alert", message: " Notice: Your session is expiring. Review and save your progress to prevent data loss." },
   { category: "alert", message: " Your session is about to end. Please check your tasks and save any unsaved changes." },
   { category: "alert", message: " System notice: Your session will expire soon. Ensure that all your work is saved." },
   { category: "alert", message: " Immediate action required. Your session is nearing its end—save your tasks right away." },
   { category: "alert", message: " Urgent: Your session is almost over. Confirm that all changes are saved." },
   { category: "alert", message: " Final notice: Your session is expiring soon. Save all unsaved work immediately." }
];



