"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase-config";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function Home() {
  const [packageIds, setPackageIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchPackages = async () => {
      // Fetch packages from firestore

      const packageRef = await getDocs(collection(db, "packages"));

      setPackageIds(packageRef.docs.map((doc) => doc.id));
    };

    fetchPackages();
  }, []);

  return (
    <main className="size-full flex justify-center items-center">
      {packageIds && packageIds.length > 0 ? (
        <ul>
          {packageIds.map((packageId) => (
            <Link
              key={packageId}
              href={`/package/${packageId}`}
              target="_blank"
            >
              <li key={packageId}>{packageId}</li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No packages found</p>
      )}
    </main>
  );
}
