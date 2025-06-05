import { getUserSearchResult } from "@/app/component/backend_component/TaskBackend";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  try {
    const { userId, query, userSearchBarDashboardBtn } = await request.json();
    console.log("🚀 ~ POST ~ userSearchBarDashboardBtn:", userSearchBarDashboardBtn)
    console.log("🚀 ~ POST ~ query:", query)
    console.log("🚀 ~ POST ~ userId:", userId)
    const queryResult = await getUserSearchResult(userId, query, userSearchBarDashboardBtn);

    if (Array.isArray(queryResult)) {
      const dataFormat = queryResult.map((item) => {
        const message = MessagesFormat(item.title)
        return (
          { id: item.id, title: message }
        )
      })
      return NextResponse.json({ success: true, data: dataFormat });
    }

  } catch (error: unknown) {
    console.error("Error fetching result from search bar query:", error);
    return NextResponse.json({ success: false, error: error });
  }
}

const MessagesFormat = (title: string) => {
  const messages = [
    `Your task titled "${title}" has been saved successfully!`,
    `Wow, we just received your task "${title}" and saved it for you!`,
    `Great news! Your task "${title}" has been successfully added.`,
    `Heads up! We have just recorded the task "${title}" you submitted.`,
    `Fantastic! Your new task "${title}" is now saved in our system.`,
    `Awesome! The task "${title}" you saved has been received.`,
    `Nice work! We’ve successfully added your task "${title}" to your list.`,
    `Hooray! Your task "${title}" is now part of our records.`,
    `Success! We just captured your task "${title}" for you.`,
    `All set! Your task "${title}" has been saved and is ready to go.`,
    `Cheers! We received and stored your task "${title}" just now.`,
    `We've recorded your task "${title}" and added it to your list.`,
    `Task "${title}" has been successfully added to your tasks.`,
    `Successfully saved your task: "${title}".`,
    `Task "${title}" is now recorded in our system.`,
    `We got it: "${title}" is now saved!`,
    `Your new task "${title}" has been successfully logged.`,
    `Task "${title}" has been saved and is ready for review.`,
    `We've added "${title}" to your task list successfully.`,
    `Confirmation: task "${title}" is now stored in our records.`,
    `Great, your task "${title}" has been successfully saved.`,
    `Your task "${title}" has been recorded successfully.`,
    `Task "${title}" saved and added to your current list.`,
    `We've successfully added your task: "${title}".`,
    `Task "${title}" has been logged into the system.`,
    `Your task "${title}" is now part of your saved list.`,
    `Your new task, "${title}", has been successfully recorded.`,
    `We've noted down your task: "${title}" is now saved.`,
    `Task "${title}" has been successfully recorded in our system.`,
    `Your task "${title}" has been saved and is ready to be viewed.`
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
