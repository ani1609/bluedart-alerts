"use client";

import { use, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shipment } from "@/types/shipment";
import { fetchShipment } from "@/lib/utils";

export default function PackageDetails({
  params,
}: {
  params: Promise<{ trackingId: string }>;
}) {
  const { trackingId } = use(params);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!trackingId) return;

      setIsLoading(true);
      try {
        const fetchShipmentRes = await fetchShipment({ trackingId });

        setShipment(fetchShipmentRes.data.shipment);
      } catch (error) {
        console.error("Error fetching package details", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackageDetails();
  }, [trackingId]);

  return (
    <main className="size-full flex justify-center items-start px-6">
      {!isLoading ? (
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <p>Package ID: {trackingId}</p>
            <p>Total events- {shipment ? shipment.events.length : "N/A"}</p>
          </div>

          {shipment && shipment.events.length > 0 ? (
            <div className="flex flex-wrap gap-4 max-h-[calc(100dvh-12.814rem)] pr-1 overflow-auto  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              {shipment.events.map((event, index) => (
                <Card key={index} className="w-full sm:w-96 grow">
                  <CardHeader className="p-4">
                    <CardTitle>
                      {event.date} {event.time}
                    </CardTitle>
                    <CardDescription>{event.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p>{event.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <p>No events found</p>
            </div>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
