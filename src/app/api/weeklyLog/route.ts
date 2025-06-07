// File: src/app/api/weeklyLog/route.ts

import { DailyLog, getWeeklyLog, WeeklyLog } from "@/app/component/backend_component/TaskWeeklyLog";
import { NextResponse } from "next/server";

/**
 * We take DailyLog’s `date` but redefine
 * the four count properties as strings.
 */
type DailyPct = Omit<
  DailyLog,
  "completed" | "missed" | "active" | "deleted"
> & {
  completed: string;
  missed: string;
  active: string;
  deleted: string;
};

export async function POST(request: Request) {
  try {
    const { activeDashboardBtn } = await request.json();

    // 1) Fetch the WeeklyLog (or null if not found)
    let dataLog: WeeklyLog | null;
    if (activeDashboardBtn == undefined) {
      const defaultName = "personal";
      dataLog = await getWeeklyLog(defaultName);
    } else {
      dataLog = await getWeeklyLog(activeDashboardBtn);
    }

    // 2) Helper: convert raw counts into percentage‐strings
    const toPct = (counts: {
      completed: number;
      missed: number;
      active: number;
      deleted: number;
    }) => {
      const total =
        counts.completed +
        counts.missed +
        counts.active +
        counts.deleted;

      if (total === 0) {
        return {
          completed: "0%",
          missed: "0%",
          active: "0%",
          deleted: "0%",
        };
      }

      return {
        completed: ((counts.completed / total) * 100).toFixed(0) + "%",
        missed: ((counts.missed / total) * 100).toFixed(0) + "%",
        active: ((counts.active / total) * 100).toFixed(0) + "%",
        deleted: ((counts.deleted / total) * 100).toFixed(0) + "%",
      };
    };

    // 3) If dataLog is null, build a “zero‐filled” response
    if (dataLog === null) {
      // Weekly counts all zero
      const zeroWeeklyCounts = {
        completed: 0,
        missed: 0,
        active: 0,
        deleted: 0,
      };
      // Weekly percentages all “0%”
      const zeroWeeklyPct = toPct(zeroWeeklyCounts);

      // Build a 7‐element daily array of zeros
      const zeroDailyNum: Array<{
        date: string;
        completed: number;
        missed: number;
        active: number;
        deleted: number;
      }> = [];
      const zeroDailyPct: DailyPct[] = [];

      for (let i = 0; i < 7; i++) {
        zeroDailyNum.push({
          date: "",
          completed: 0,
          missed: 0,
          active: 0,
          deleted: 0,
        });
        zeroDailyPct.push({
          date: "",
          completed: "0%",
          missed: "0%",
          active: "0%",
          deleted: "0%",
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          weekly: zeroWeeklyPct,
          weeklyNumFormat: zeroWeeklyCounts,
          daily: zeroDailyPct,
          dailyNumFormat: zeroDailyNum,
        },
      });
    }

    // 4) At this point, dataLog is definitely not null. Extract weekly & daily:
    // Weekly data
    const weeklyPct = toPct(dataLog.weekly);
    const weeklyNum = dataLog.weekly;

    // Daily data
    const dailyNum = [...dataLog.daily]; // shallow copy of all seven (or fewer) entries
    const dailyPct: DailyPct[] = dataLog.daily.map((day) => ({
      date: day.date,
      ...toPct(day),
    }));

    // 5) If there are fewer than 7 days in `dataLog.daily`, pad out to length=7
    for (let i = dailyPct.length; i < 7; i++) {
      dailyPct.push({
        date: "",
        completed: "0%",
        missed: "0%",
        active: "0%",
        deleted: "0%",
      });
      dailyNum.push({
        date: "",
        completed: 0,
        missed: 0,
        active: 0,
        deleted: 0,
      });
    }

    // 6) Return the normal, non‐null case
    return NextResponse.json({
      success: true,
      data: {
        weekly: weeklyPct,
        weeklyNumFormat: weeklyNum,
        daily: dailyPct,
        dailyNumFormat: dailyNum,
      },
    });
  } catch  {
    return NextResponse.json({
      success: false,
      error: "server error",
    });
  }
}
