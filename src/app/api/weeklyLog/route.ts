import { getWeeklyLog } from "@/app/component/backend_component/TaskWeeklyLog"
import { NextResponse } from "next/server";

interface DailyLog {
  date: string;
  completed: number;
  missed: number;
  active: number;
  deleted: number;
}

export async function POST(request: Request) {
  try {
    const { userId, activeDashboardBtn } = await request.json();
    console.log("User ID:", userId);
    console.log("Active Dashboard Btn:", activeDashboardBtn);

    const dataLog = await getWeeklyLog(userId, activeDashboardBtn);

    // Helper function to convert raw counts into percentage strings.
    const convertCountsToPercentage = (counts: { completed: number; missed: number; active: number; deleted: number }) => {
      const total = counts.completed + counts.missed + counts.active + counts.deleted;
      if (total === 0) {
        return { completed: "0%", missed: "0%", active: "0%", deleted: "0%" };
      }
      return {
        completed: ((counts.completed / total) * 100).toFixed(0) + "%",
        missed: ((counts.missed / total) * 100).toFixed(0) + "%",
        active: ((counts.active / total) * 100).toFixed(0) + "%",
        deleted: ((counts.deleted / total) * 100).toFixed(0) + "%",
      };
    };

    // Convert weekly totals to percentage values.
    const weeklyPercentage = convertCountsToPercentage(dataLog.weekly);
    const weeklyNumberFormat = dataLog.weekly;
    const dailyNumberFormat = dataLog.daily;

    // Convert each day’s counts into percentages.
    const dailyPercentage = dataLog.daily.map((day: DailyLog) => ({
      date: day.date,
      ...convertCountsToPercentage(day)
    }));
    console.log("🚀 ~ dailyPercentage ~ dailyPercentage:", dailyPercentage)



    if (dailyPercentage.length < 7) {
      const missingCount = 7 - dailyPercentage.length;
      for (let i = 0; i < missingCount; i++) {
        const remainingDailyPercentage = []
        const remainingDailyNumber = []
        remainingDailyPercentage.push({
          date: "", // Default placeholder for date if not provided.
          completed: "0%",
          missed: "0%",
          active: "0%",
          deleted: "0%"
        });
        console.log("🚀 ~ POST ~ remainingDailyPercentage:", remainingDailyPercentage)
        remainingDailyNumber.push({
          date: '',
          completed: 0,
          missed: 0,
          active: 0,
          deleted: 0
        })
        console.log("🚀 ~ POST ~ remainingDailyNumber:", remainingDailyNumber)
        dailyPercentage.push(...remainingDailyPercentage)
        dailyNumberFormat.push(...remainingDailyNumber)
      }
      console.log("🚀 ~ POST ~ dailyNumberFormat:", dailyNumberFormat)
      console.log("🚀 ~ POST ~ dailyPercentage:", dailyPercentage)
      //   dailyPercentage.map((item) => {
      //     item, ...remainingDailyPercentage
      // })
    }

    // Return the data that can be used in your Bar and PieChartLabel components.
    return NextResponse.json({
      success: true,
      data: {
        weekly: weeklyPercentage,
        daily: dailyPercentage,
        dailyNumFormat: dailyNumberFormat,
        weeklyNumFormat: weeklyNumberFormat,
      }
    });
  } catch (error: unknown) {
    console.error("Error processing weekly log request:", error);
    return NextResponse.json({ success: false, error: error });
  }
}
