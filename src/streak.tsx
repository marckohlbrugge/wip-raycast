import { environment, updateCommandMetadata } from "@raycast/api";
import fetch from "node-fetch";

interface StreakResponse {
  streak: number;
  best_streak: number;
  streaking: boolean;
}

export default async function Command() {
  const response = await fetch("https://wip.co/api/v1/users/marc/streak.json");
  const data: StreakResponse = await response.json();

  await updateCommandMetadata({ subtitle: `${data.streak} 🔥 – ${data.streaking ? "Your streak is safe" : "⚠️ No completed todos day!"}` });
}

