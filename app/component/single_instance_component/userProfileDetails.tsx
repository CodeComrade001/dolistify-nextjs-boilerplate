import React from "react";
import Profile from "../../public/images/profile.png";
import Image from "next/image";

export default function ProfileDetails(): JSX.Element {
   return (
      <div className="profile-details">
      <p id="fullname">Kim Wu Song</p>
      <p id="Occupation">Web Developer</p>
   </div>
   );
}

export function ProfileImage() : JSX.Element {
   return (
      <Image src={Profile} width="60" height="60" alt="Profile" placeholder="blur" />
   );
}