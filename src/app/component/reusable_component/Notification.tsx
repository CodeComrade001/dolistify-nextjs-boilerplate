import React, { useContext, useEffect, useRef, useState } from "react";
import notifierStyle from "../../styles/notificationStatus.module.css";
import { NotifierContext } from "@/app/context/notificationContext";
import { fetchUserNotification, storeUserNotification } from "../backend_component/TaskBackend";

interface DayNotification {
  date: string;
  Notification: {
    id: number;
    notification_data: string;
  }[];
}

export default function Notifier({ userId }: { userId: number }) {
  const { message } = useContext(NotifierContext);
  console.log("🚀 ~ Notifier ~ message:", message)
  const [storedNotification, setStoredNotification] = useState<DayNotification[]>([]);
  console.log("🚀 ~ Notifier ~ storedNotification:", storedNotification)
  // Using a ref to keep track of the last message
  const lastMessageRef = useRef<string>("");
  console.log("🚀 ~ Notifier ~ lastMessageRef:", lastMessageRef)

  // When the context message updates, store it in the database if it's not a duplicate.
  useEffect(() => {
    if (message == undefined) return;
    if (!message.trim()) return;

    // Skip if it's a duplicate of the last message.
    if (lastMessageRef.current === message) {
      return;
    }

    lastMessageRef.current = message;
    // Store the new notification to the database.
    storeUserNotification(userId, message)
      .then((storeResult) => {
        console.log("Notification has been stored:", storeResult);
      })
      .catch((error) => {
        console.error("Error storing notification:", error);
      });
  }, [message, userId]);

  // Fetch stored notifications from the database.
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const fetchResult = await fetchUserNotification(userId);
        console.log("🚀 ~ fetchNotifications ~ fetchResult:", fetchResult)
        if (fetchResult && Array.isArray(fetchResult.notification_details)) {
          setStoredNotification(fetchResult.notification_details);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    }
    fetchNotifications();
  }, [userId, message]);

  return (
    <div className={notifierStyle.container}>
      {storedNotification.length > 0 &&
        storedNotification.map((day, dayIndex) =>
          day.Notification.length > 0 && (
            <fieldset key={dayIndex} className={notifierStyle.date} >
              <legend className={notifierStyle.date_content} >
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </legend>
              {day.Notification.map((notification, index) => (
                <div key={index} className={notifierStyle.content}>
                  {notification.notification_data}
                </div>
              ))}
            </fieldset>
          )
        )}
    </div>
  );
}
