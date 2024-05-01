import { environment, updateCommandMetadata } from "@raycast/api";
import fetch from "node-fetch";
import * as wip from "./oauth/wip";

export default async function Command() {
  await wip.authorize();
  const data = await wip.fetchStreak();

  await updateCommandMetadata({ subtitle: `${data.streak} 🔥 – ${data.streaking ? "Your streak is safe" : "⚠️ No completed todos day!"}` });
}