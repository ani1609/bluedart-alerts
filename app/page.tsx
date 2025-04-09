"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shipment } from "@/types/shipment";
import { ShipmentsResponse } from "@/types/shipment";
import axios from "axios";

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);

      try {
        const response = await axios.get("/api/shipments");

        const responseData: ShipmentsResponse = response.data;

        if (responseData.status === "error") {
          console.error("Error fetching packages");
          return;
        }

        setShipments(responseData.data.shipments);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  return (
    <main className="size-full flex justify-center items-center">
      {isLoading ? (
        <p>Loading packages...</p>
      ) : shipments && shipments.length > 0 ? (
        <ul className="flex flex-col gap-y-2">
          {shipments.map((shipment, index) => (
            <Link
              key={index}
              href={`/shipment/${shipment.trackingId}`}
              // target="_blank"
              className="p-2"
            >
              <li className="flex justify-between items-center px-4 py-2 border gap-x-6 rounded-md">
                <span>{shipment.title}</span>
                <span>{shipment.trackingId}</span>
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
