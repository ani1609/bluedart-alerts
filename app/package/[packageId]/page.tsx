"use client";

import { use, useEffect, useState } from "react";
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

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!packageId) {
        return;
      }

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

        console.log(responseData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching package details", error);
      }
    };

    fetchPackageDetails();
  }, [packageId]);

  return (
    <main className="size-full flex justify-center items-start px-6">
      {!isLoading ? (
        <div className="flex flex-col gap-y-6">
          <div className="flex flex-col gap-y-2">
            <p>Package ID: {packageId}</p>
            <p>Total events- {packageEvents ? packageEvents.length : "N/A"}</p>
          </div>

          {packageEvents && packageEvents.length > 0 ? (
            <div className="flex flex-wrap gap-4">
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
