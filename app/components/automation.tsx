"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase-config";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Automation() {
  useEffect(() => {
    const fetchCourierStatus = async () => {
      const response = await fetch(
        "/api/get-package-status?trackingId=81958668024"
      );

      const responseData = await response.json();

      console.log(responseData);
    };
    fetchCourierStatus();
  }, []);

  useEffect(() => {
    const fetchPackageStatusFromDb = async () => {
      const packageId = "81958668024";

      const packageRef = doc(db, "packages", packageId);

      const packageDoc = await getDoc(packageRef);

      if (packageDoc.exists()) {
        console.log("Document data:", packageDoc.data());
      } else {
        // doc.data() will be undefined in this case
        console.log("Create a new document");

        // Add a new document
        await setDoc(doc(db, "packages", packageId), {
          status: "In transit",
        });
      }
    };

    fetchPackageStatusFromDb();
  }, []);

  return (
    <div>
      <h1>Automation</h1>
    </div>
  );
}
