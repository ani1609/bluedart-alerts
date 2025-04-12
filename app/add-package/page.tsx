import AddPackageComp from "./components/add-package";

const userDiscordId = process.env.DISCORD_USER_ID || "";

export default function AddPackage() {
  return <AddPackageComp userDiscordId={userDiscordId} />;
}
