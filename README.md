# BlueDart Discord Tracker 📦

Get instant Discord notifications for your BlueDart package tracking updates.

## Features

- Real-time tracking notifications via Discord
- Simple setup with tracking ID and Discord ID
- Automatic monitoring for package status changes

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file:

   ```env
   BASE_URL=
   MONGODB_URI=
   DISCORD_BOT_TOKEN=
   USER_DISCORD_ID=
   ```

3. **Run the app**

   ```bash
   npm run dev
   ```

4. **Use the app**
   - Open http://localhost:3000
   - Enter your BlueDart tracking ID
   - Enter your Discord ID (Enable Developer Mode in Discord → Right-click your name → Copy ID)
   - Start tracking!

## Tech Stack

- Next.js 14
- Tailwind CSS
- Discord Webhooks

## Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Easy one-click deployment to Vercel. Don't forget to add your environment variables!

## ⚠️ Disclaimer

**This project is for educational purposes only and consumes data from publicly accessible endpoints. It is not affiliated with any courier company and is not intended for commercial use.**
