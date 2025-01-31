"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

export default function AddPackage() {
  const [packageId, setPackageId] = useState<string>("");
  // const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [succes, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setSuccess(null);

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

      await setDoc(packageRef, {
        // email: email,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      console.log("Document successfully written!");

      setError(null);
      setPackageId("");
      // setEmail("");
      setIsLoading(false);
      setSuccess("Package added successfully");
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="size-full flex justify-center items-center px-6">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-start justify-start w-96 sm:w-full"
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
        {/* <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="mt-4"
          type="email"
          required
          disabled={isLoading}
        /> */}

        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}

        {succes && <p className="text-green-500 mt-3 text-sm">{succes}</p>}

        <Button type="submit" className="mt-6" disabled={isLoading}>
          Add Package
        </Button>
      </form>
    </main>
  );
}
