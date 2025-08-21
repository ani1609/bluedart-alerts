"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shipment } from "@/types/shipment";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteShipment, fetchAllShipments } from "@/lib/utils";
import { toast } from "sonner";
import { set } from "mongoose";

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);

      try {
        const shipmentRes = await fetchAllShipments();

        setShipments(shipmentRes.data.shipments);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleCopy = async ({ trackingId }: { trackingId: string }) => {
    if (!trackingId) {
      toast("No Tracking ID: Tracking ID is not available.");
      return;
    }

    try {
      await navigator.clipboard.writeText(trackingId);
      toast("Tracking ID copied to clipboard.");
    } catch (err) {
      toast.error("Copy failed: Unable to copy Tracking ID.");
      console.error("Clipboard copy failed:", err);
    }
  };

  const handleDeletePackage = async ({
    trackingId,
  }: {
    trackingId: string;
  }) => {
    try {
      toast.promise(deleteShipment({ trackingId }), {
        loading: "Deleting package...",
        success: "Package has been deleted",
        error: "Error deleting package",
      });

      setShipments((prevShipments) =>
        prevShipments.filter((shipment) => shipment.trackingId !== trackingId)
      );
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

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
              <li className="flex justify-between items-center px-4 py-2 border gap-x-10 rounded-md">
                <h1 className="font-medium">{shipment.title}</h1>

                <div
                  className="flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Popover>
                    <PopoverTrigger className="p-1">
                      <EllipsisVertical className="size-5" />
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      className="w-auto p-0 flex flex-col overflow-hidden"
                    >
                      <Button
                        variant="ghost"
                        className="rounded-none"
                        onClick={() =>
                          handleCopy({ trackingId: shipment.trackingId })
                        }
                      >
                        Copy Tracking ID
                      </Button>
                      <Button
                        variant="destructive"
                        className="rounded-none"
                        onClick={() =>
                          handleDeletePackage({
                            trackingId: shipment.trackingId,
                          })
                        }
                      >
                        Delete Package
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
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
