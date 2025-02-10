import React from "react";

export default function DeletedTask() : JSX.Element {
   return (
      <tbody>
      <tr>
         <td className="ignored-task-title">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            Fugiat, architecto.
         </td>
         <td className="location-route">Deleted</td>
         <td className="location-route-time">10:15:50 AM</td>
      </tr>
   </tbody>
   )
}