import { NextResponse } from "next/server";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel } from "discord-api-types/v10";
import { handleApiError, handleMissingParamsError } from "@/lib/utils";
import { SendMessageRequest, SendMessageResponse } from "@/types/message";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

export async function POST(req: Request) {
  try {
    const body: SendMessageRequest = await req.json();
    const { userDiscordId, message } = body;

    // Validate input
    if (!userDiscordId || !message) {
      return handleMissingParamsError(
        "userDiscordId (user ID) and message are required",
      );
    }

    // Create DM channel with user
    const dmChannel = (await rest.post(Routes.userChannels(), {
      body: { recipient_id: userDiscordId },
    })) as APIChannel;

    // Send message to the created DM channel
    await rest.post(Routes.channelMessages(dmChannel.id), {
      body: { content: message },
    });

    // Success response
    const resPayload: SendMessageResponse = {
      status: "success",
      data: {
        message: "DM sent!",
      },
    };

    return NextResponse.json(resPayload, { status: 200 });
  } catch (error) {
    console.error("Error sending Discord DM:", error);
    return handleApiError(error);
  }
}
