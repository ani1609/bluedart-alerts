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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [selectedTrackingId, setSelectedTrackingId] = useState<string | null>(
    null,
  );

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

  const handleConfirmDelete = async () => {
    if (!selectedTrackingId) return;

    const promise = deleteShipment({
      trackingId: selectedTrackingId,
      authToken: authToken.trim(),
    });

    toast.promise(promise, {
      loading: "Deleting package...",
      success: "Package deleted",
      error: "Invalid auth token or delete failed",
    });

    try {
      await promise;
      setShipments((prev) =>
        prev.filter((s) => s.trackingId !== selectedTrackingId),
      );
      setOpen(false);
      setAuthToken("");
    } catch (error) {
      console.error("Error deleting package:", error);
    }
  };

  return (
    <main className="size-full flex justify-center items-center px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <p>Loading packages...</p>
      ) : shipments && shipments.length > 0 ? (
        <ul className="flex flex-col gap-y-2">
          {shipments.map((shipment, index) => (
            <Link
              key={index}
              href={`/shipment/${shipment.trackingId}`}
              // target="_blank"
              className="p-1"
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
                        onClick={() => {
                          setSelectedTrackingId(shipment.trackingId);
                          setOpen(true);
                        }}
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Enter auth token to delete this package.
            </DialogDescription>
          </DialogHeader>

          <Input
            type="password"
            placeholder="Auth token"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            className="mt-4"
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setAuthToken("");
              }}
            >
              Cancel
            </Button>

            <Button variant="destructive" onClick={handleConfirmDelete}>
              Confirm Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
