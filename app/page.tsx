"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Parcel {
  packageId: string;
  title: string;
}

interface ApiData {
  status: string;
  data: {
    parcels: Parcel[];
  };
}

export default function Home() {
  const [packages, setPackages] = useState<Parcel[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      const response = await fetch("/api/get-packages");

      if (!response.ok) {
        console.error("Failed to fetch packages");
        return;
      }

      const responseData: ApiData = await response.json();

      if (responseData.status === "error") {
        console.error("Error fetching packages");
        return;
      }

      setPackages(responseData.data.parcels);
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      if (typeof window !== "undefined" && "Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted");
        } else if (permission === "denied") {
          alert("You denied for the notification");
        }
      }
    };

    requestPermission();
  }, []);

  return (
    <main className="size-full flex justify-center items-center">
      {packages && packages.length > 0 ? (
        <ul className="flex flex-col gap-y-2">
          {packages.map((parcel, index) => (
            <Link
              key={index}
              href={`/package/${parcel.packageId}`}
              target="_blank"
              className="p-2"
            >
              <li className="flex justify-between items-center px-4 py-2 border gap-x-6 rounded-md">
                <span>{parcel.title}</span>
                <span>{parcel.packageId}</span>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No packages found</p>
      )}
    </main>
  );
}
