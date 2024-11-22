"use client";

import { useState } from "react";
import helperScreenStyle from "../../styles/helperScreenStyle.module.css";

export default function HelperBar(): JSX.Element {
   const [helperBarOpen, setHelperBarOpen] = useState<"error" | "success" | "warning" | "alert" | "message">("warning");
   const [isHovered, setIsHovered] = useState(false);

   function informationVerify(category: "error" | "success" | "warning" | "alert" | "message") {
      switch (category) {
         case "success":
            return {
               styles: {
                  border: "1px solid rgba(36, 241, 6, 1)",
                  backgroundColor: isHovered ? "rgba(7, 149, 66, 0.35)" : "rgba(7, 149, 66, 0.12156862745098039)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #259c08",
                  color: "#0ad406",
               },
               icon: (
                  <svg height="23" width="23" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" fill="#0ad406">
                     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                     <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                     <g id="SVGRepo_iconCarrier">
                        <path
                           fill="#0ad406"
                           d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.272 38.272 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336L456.192 600.384z"
                        ></path>
                     </g>
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_success,  
            };
         case "message":
            return {
               styles: {
                  border: "1px solid rgba(6, 44, 241, 0.46)",
                  backgroundColor: isHovered ? "rgba(7, 73, 149, 0.35)" : "rgba(7, 73, 149, 0.12156862745098039)",
                  transition: isHovered ? "0.5s" : "none",
                  boxShadow: "0px 0px 2px #0396ff",
                  color: "#0396ff",
               },
               icon: (
                  <svg
                     viewBox="0 0 24 24"
                     fill="none"
                     width="23px"
                     height="23px"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <circle cx="12" cy="12" r="9" stroke="#0396ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></circle>
                     <rect x="12" y="8" width="0.01" height="0.01" stroke="#0396ff" strokeWidth="3.75" strokeLinejoin="round"></rect>
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
               },
               icon: (
                  <svg height="23" width="23" fill="#ffb103" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                     <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                     <g id="SVGRepo_iconCarrier">
                        <path d="M520.741 163.801a10.234 10.234 0 00-3.406-3.406c-4.827-2.946-11.129-1.421-14.075 3.406L80.258 856.874a10.236 10.236 0 00-1.499 5.335c0 5.655 4.585 10.24 10.24 10.24h846.004c1.882 0 3.728-.519 5.335-1.499 4.827-2.946 6.352-9.248 3.406-14.075L520.742 163.802zm43.703-26.674L987.446 830.2c17.678 28.964 8.528 66.774-20.436 84.452a61.445 61.445 0 01-32.008 8.996H88.998c-33.932 0-61.44-27.508-61.44-61.44a61.445 61.445 0 018.996-32.008l423.002-693.073c17.678-28.964 55.488-38.113 84.452-20.436a61.438 61.438 0 0120.436 20.436zM512 778.24c22.622 0 40.96-18.338 40.96-40.96s-18.338-40.96-40.96-40.96-40.96 18.338-40.96 40.96 18.338 40.96 40.96 40.96zm0-440.32c-22.622 0-40.96 18.338-40.96 40.96v225.28c0 22.622 18.338 40.96 40.96 40.96s40.96-18.338 40.96-40.96V378.88c0-22.622-18.338-40.96-40.96-40.96z"></path>
                     </g>
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
               },
               icon: (
                  <svg
                     viewBox="0 0 512 512"
                     version="1.1"
                     width="23"
                     height="23"
                     xmlns="http://www.w3.org/2000/svg"
                     xmlnsXlink="http://www.w3.org/1999/xlink"
                     fill="#ff0303"
                  >
                     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                     <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                     <g id="SVGRepo_iconCarrier">
                        <title>error-filled</title>
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                           <g id="add" fill="#ff0303" transform="translate(42.666667, 42.666667)">
                              <path
                                 d="M213.333333,3.55271368e-14 C331.136,3.55271368e-14 426.666667,95.5306667 426.666667,213.333333 C426.666667,331.136 331.136,426.666667 213.333333,426.666667 C95.5306667,426.666667 3.55271368e-14,331.136 3.55271368e-14,213.333333 C3.55271368e-14,95.5306667 95.5306667,3.55271368e-14 213.333333,3.55271368e-14 Z M262.250667,134.250667 L213.333333,183.168 L164.416,134.250667 L134.250667,164.416 L183.168,213.333333 L134.250667,262.250667 L164.416,292.416 L213.333333,243.498667 L262.250667,292.416 L292.416,262.250667 L243.498667,213.333333 L292.416,164.416 L262.250667,134.250667 Z"
                                 id="Combined-Shape"
                              ></path>
                           </g>
                        </g>
                     </g>
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
               },
               icon: (
                  <svg
                     viewBox="0 0 24 24"
                     fill="none"
                     width="21"
                     height="21"
                     xmlns="http://www.w3.org/2000/svg"
                  >
                     <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                     <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                     <g id="SVGRepo_iconCarrier">
                        <path
                           d="M12.3657 0.888071C12.6127 0.352732 13.1484 0 13.75 0C14.9922 0 15.9723 0.358596 16.4904 1.29245C16.7159 1.69889 16.8037 2.13526 16.8438 2.51718C16.8826 2.88736 16.8826 3.28115 16.8826 3.62846L16.8825 7H20.0164C21.854 7 23.2408 8.64775 22.9651 10.4549L21.5921 19.4549C21.3697 20.9128 20.1225 22 18.6434 22H8L8 9H8.37734L12.3657 0.888071Z"
                           fill="#03d0ff"
                        ></path>
                        <path
                           d="M6 9H3.98322C2.32771 9 1 10.3511 1 12V19C1 20.6489 2.32771 22 3.98322 22H6L6 9Z"
                           fill="#03d0ff"
                        ></path>
                     </g>
                  </svg>
               ),
               iconAnimation: helperScreenStyle.icon_alert,  
            };
         default:
            return {};
      }
   }

   const infoStyles = informationVerify(helperBarOpen);

   return (
      <div
         className={helperScreenStyle.container}
         style={infoStyles.styles}
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
      >
         <div className={helperScreenStyle.bar} style={{ backgroundColor: infoStyles.styles?.color || "transparent" }}></div>
         <div className={`${helperScreenStyle.icon} ${infoStyles.iconAnimation}`} >{infoStyles.icon}</div>
         <div className={helperScreenStyle.text}>
            Well done! You successfully read this important message.
         </div>
      </div>
   );
}