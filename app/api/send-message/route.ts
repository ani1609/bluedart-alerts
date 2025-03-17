import { NextResponse } from "next/server";
import { REST } from "@discordjs/rest";
import { Routes, APIChannel } from "discord-api-types/v10";

const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || "";

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

export async function POST(req: Request) {
  try {
    const { userDiscord, message } = await req.json();

    if (!userDiscord || !message) {
      return NextResponse.json(
        { error: "userDiscord (user ID) and message are required" },
        { status: 400 }
      );
    }

    const dmChannel = (await rest.post(Routes.userChannels(), {
      body: { recipient_id: userDiscord },
    })) as APIChannel;

    await rest.post(Routes.channelMessages(dmChannel.id), {
      body: { content: message },
    });

    return NextResponse.json({ success: true, message: "DM sent!" });
  } catch (error) {
    console.error("Error sending Discord DM:", error);
    return NextResponse.json({ error: "Failed to send DM" }, { status: 500 });
  }
}
