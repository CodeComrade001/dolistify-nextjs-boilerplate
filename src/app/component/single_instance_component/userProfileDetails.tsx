"use client";
import React, { useEffect, useState } from "react";
import Profile from "../../../../public/images/profile.png";
import Image from "next/image";
import GetUserDetails from "../backend_component/Profile";


export default function ProfileDetails({
   id,
}: {
   id: number
}) {
   const [userDetails, setUserDetails] = useState<{ username: string, email: string }>({
      username: "",
      email: ""
   })

   useEffect(() => {
      async function getUserDetails(index: number) {
         try {
            const userFetchedDetails = await GetUserDetails(index);
            console.log("🚀 ~ getUserDetails ~ userFetchedDetails:", userFetchedDetails)
            if (userFetchedDetails) {
               setUserDetails(userFetchedDetails);
            } 
         } catch (error: unknown) {
            console.log("error fetching username and email", error)
         }
      }
      getUserDetails(id)
   }, [id])

   return (
      <div className="profile-details">
         <p id="fullname">{userDetails.username}</p>
         <p id="Occupation">{userDetails.email}</p>
      </div>
   );
}

export function ProfileImage() {
   return (
      <Image src={Profile} width="60" height="60" alt="Profile" placeholder="blur" />
   );
}