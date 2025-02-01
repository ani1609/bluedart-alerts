"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PackageEvent {
  date: string;
  time: string;
  location: string;
  details: string;
}

export default function PackageDetails({
  params,
}: {
  params: Promise<{ packageId: string }>;
}) {
  const { packageId } = use(params);
  const [packageEvents, setPackageEvents] = useState<PackageEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastNumberOfEvents, setLastNumberOfEvents] = useState<number>(0);

  useEffect(() => {
    if (packageEvents.length > lastNumberOfEvents) {
      if (Notification.permission === "granted") {
        new Notification(`New event added to your package ${packageId}!`, {
          body: "Check your package details for the latest event.",
          icon: "https://images.jdmagicbox.com/comp/kolkata/s8/033pxx33.xx33.160721120133.p3s8/catalogue/blue-dart-express-ltd-east-kolkata-township-kolkata-courier-services-blue-dart-o5rxwzarvv.jpg",
        });
      }

      setLastNumberOfEvents(packageEvents.length);
    }
  }, [packageEvents, lastNumberOfEvents, packageId]);

  const fetchPackageDetails = useCallback(async () => {
    if (!packageId) return;

    setIsLoading(true);
    try {
      const responseResponse = await fetch(
        `/api/get-package-status?trackingId=${packageId}`
      );

      if (!responseResponse.ok) {
        console.error("Error fetching package details");
        return;
      }

      const responseData = await responseResponse.json();

      if (responseData.status === "Not found") {
        console.error("Package not found");
        return;
      }

      setPackageEvents(responseData.data.events);
    } catch (error) {
      console.error("Error fetching package details", error);
    } finally {
      setIsLoading(false);
    }
  }, [packageId]);

  useEffect(() => {
    fetchPackageDetails();

    const intervalId = setInterval(() => {
      fetchPackageDetails();
    }, 300000); // 1 minute

    return () => clearInterval(intervalId);
  }, [fetchPackageDetails]);

  return (
    <main className="size-full flex justify-center items-start px-6">
      {!isLoading ? (
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <p>Package ID: {packageId}</p>
            <p>Total events- {packageEvents ? packageEvents.length : "N/A"}</p>
          </div>

          {packageEvents && packageEvents.length > 0 ? (
            <div className="flex flex-wrap gap-4 max-h-[calc(100dvh-12.814rem)] pr-1 overflow-auto  [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
              {packageEvents.map((event, index) => (
                <Card key={index} className="w-full sm:w-96 flex-grow">
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
