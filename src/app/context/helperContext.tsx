// "use client";
// import React, { createContext, useState, ReactNode } from "react";

// type NotifierContextType = {
//   helperMessage: string;
//   category: string;
//   setHelperMessage: (msg: string) => void;
//   setMessageCategory: (msg: string) => void,
// };

// export const HelperContext = createContext<NotifierContextType>({
//   helperMessage: "",
//   category: "",
//   setHelperMessage: () => {},
//   setMessageCategory: () => {},
// });

// type NotifierProviderProps = {
//   children: ReactNode;
// };

// export function HelperProvider({ children }: NotifierProviderProps) {
//   const [helperMessage, setHelperMessage] = useState<string>("");
//   const [category, setMessageCategory] = useState<string>("");
//   console.log("🚀 ~ NotifierProvider ~ helperMessage:", helperMessage)

//   return (
//     <HelperContext.Provider value={{ helperMessage, setHelperMessage, category, setMessageCategory }}>
//       {children}
//     </HelperContext.Provider>
//   );
// }
