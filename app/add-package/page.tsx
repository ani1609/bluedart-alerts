import AddPackageComp from "./components/add-package";

const userDiscordId = process.env.USER_DISCORD_ID || "";

export default function AddPackage() {
  return <AddPackageComp userDiscordId={userDiscordId} />;
}
