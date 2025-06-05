"use client";
import React, { useEffect, useState } from "react";
import GetUserDetails from "../backend_component/Profile";


export default function ProfileDetails() {
   const [userDetails, setUserDetails] = useState<{ username: string, email: string, avatar_url : string }>({
      username: "",
      email: "",
      avatar_url: ""
   })

   useEffect(() => {
      async function getUserDetails() {
         try {
            const userFetchedDetails = await GetUserDetails();
            console.log("🚀 ~ getUserDetails ~ userFetchedDetails:", userFetchedDetails)
            if (userFetchedDetails) {
               setUserDetails({
                  username: userFetchedDetails.username,
                  email: userFetchedDetails.user_email,
                  avatar_url : userFetchedDetails.avatar_url,
               });
            }
         } catch (error: unknown) {
            console.log("error fetching username and email", error)
         }
      }
      getUserDetails()
   }, [])

   return (
      <>
         <div className="userprofile">
            {userDetails.avatar_url !== "" && 
            <img src={ userDetails.avatar_url} alt="Dolistify-logo" height="40" width="100" />
            } 
         </div>
         <div className="profile-details">
            <p id="fullname">{userDetails.username}</p>
            <p id="Occupation">{userDetails.email}</p>
         </div>
      </>
   );
}
