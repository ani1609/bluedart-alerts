"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Timestamp } from "firebase/firestore";

export default function AddPackage() {
  const [packageId, setPackageId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const packageRef = doc(db, "packages", packageId);
      const packageDoc = await getDoc(packageRef);

      if (packageDoc.exists()) {
        console.log(
          "Package already registered for updates :",
          packageDoc.data()
        );
        setError("Package already registered for updates");
        return;
      }

      const packageStatusResponse = await fetch(
        `/api/get-package-status?trackingId=${packageId}`
      );

      if (!packageStatusResponse.ok) {
        console.error("Error fetching package status");
        setError("Error fetching package status");
        return;
      }

      const packageStatusData = await packageStatusResponse.json();

      if (packageStatusData.status === "Not found") {
        console.error("Package not found");
        setError("Package not found");
        return;
      }

      console.log("package status data", packageStatusData);

      await setDoc(packageRef, {
        email: email,
        events: packageStatusData.data.events
          ? packageStatusData.data.events
          : [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log("Document successfully written!");

      setError(null);
      setPackageId("");
      setEmail("");
      setIsLoading(false);
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-screen h-dvh flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start justify-start w-80"
      >
        <h1 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Add Package
        </h1>

        <Input
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
          placeholder="Enter package ID"
          className="mt-4"
          type="text"
          required
          disabled={isLoading}
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="mt-4"
          type="email"
          required
          disabled={isLoading}
        />

        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

        <Button type="submit" className="mt-6" disabled={isLoading}>
          Add Package
        </Button>
      </form>
    </main>
  );
}
