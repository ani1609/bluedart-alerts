import { NextResponse } from "next/server";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel } from "discord-api-types/v10";
import {
  handleApiError,
  handleMissingParamsError,
} from "@/utils/handle-api-errors";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

export async function POST(req: Request) {
  try {
    const { userDiscordId, message } = await req.json();

    if (!userDiscordId || !message) {
      return handleMissingParamsError(
        "userDiscordId (user ID) and message are required"
      );
    }

    const dmChannel = (await rest.post(Routes.userChannels(), {
      body: { recipient_id: userDiscordId },
    })) as APIChannel;

    await rest.post(Routes.channelMessages(dmChannel.id), {
      body: { content: message },
    });

    return NextResponse.json({ success: true, message: "DM sent!" });
  } catch (error) {
    console.error("Error sending Discord DM:", error);
    return handleApiError(error);
  }
}
