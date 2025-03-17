"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AddShipmentRequest, AddShipmentResponse } from "@/types/shipment";

export default function AddPackage() {
  const [packageId, setPackageId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [discordId, setDiscordId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [succes, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setSuccess(null);
      setError(null);

      const apibody: AddShipmentRequest = {
        title,
        trackingId: packageId,
        userDiscordId: discordId,
      };

      const addShipmentRes = await axios.post("/api/add-shipment", apibody);

      if (addShipmentRes.status !== 200) {
        setError("An error occurred. Please try again later.");
        return;
      }

      const addShipmentData: AddShipmentResponse = await addShipmentRes.data;

      if (addShipmentData.status === "error") {
        setError(addShipmentData.data.message);
        return;
      }

      setError(null);
      setPackageId("");
      // setEmail("");
      setIsLoading(false);
      setSuccess("Package added successfully");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Error adding shipment: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="size-full  flex justify-center items-center px-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start justify-start sm:w-96 w-full"
      >
        <h1 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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

        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

        {succes && <p className="text-green-500 mt-3 text-sm">{succes}</p>}

        <Button type="submit" className="mt-6" disabled={isLoading}>
          Add Package
        </Button>
      </form>
    </main>
  );
}
