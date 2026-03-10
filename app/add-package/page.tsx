"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { addShipment } from "@/lib/utils";
import { toast } from "sonner";

export default function AddPackageComp() {
  const [packageId, setPackageId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const promise = addShipment({
        title: title.trim(),
        trackingId: packageId.trim(),
        userDiscordId: discordId.trim(),
        authToken: authToken.trim(),
      });

      toast.promise(promise, {
        loading: "Adding package...",
        success: "Package added successfully",
        error: "Error adding package",
      });

      await promise;

      setTimeout(() => {
        router.push(`/shipment/${packageId.trim()}`);
      }, 1000);
    } catch (error) {
      console.error("Error adding shipment: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex size-full items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-start justify-start sm:w-96"
      >
        <h1 className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Add Package
        </h1>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title"
          className="mt-4"
          type="text"
          required
          disabled={isLoading}
        />

        <Input
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          placeholder="Enter tracking ID"
          className="mt-4"
          type="text"
          required
          disabled={isLoading}
        />

        <Input
          value={discordId}
          onChange={(e) => setDiscordId(e.target.value)}
          placeholder="Enter Discord ID"
          className="mt-4"
          type="text"
          required
          disabled={isLoading}
        />

        <Input
          value={authToken}
          onChange={(e) => setAuthToken(e.target.value)}
          placeholder="Enter Auth Token"
          className="mt-4"
          type="text"
          required
          disabled={isLoading}
        />

        <Button type="submit" className="mt-6" disabled={isLoading}>
          Add Package
        </Button>
      </form>
    </main>
  );
}
