"use client";

import { useEffect } from "react";

export default function Automation() {
  useEffect(() => {
    const fetchCourierStatus = async () => {
      const response = await fetch(
        "/api/get-package-status?trackingNo=81958668024"
      );

      const responseData = await response.json();

      console.log(responseData);
    };
    fetchCourierStatus();
  }, []);

  return (
    <div>
      <h1>Automation</h1>
    </div>
  );
}
