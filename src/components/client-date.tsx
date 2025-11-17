"use client";

import { useState, useEffect } from "react";

type ClientDateProps = {
  dateString: string;
  format: "locale" | "date";
};

export function ClientDate({ dateString, format }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    const date = new Date(dateString);
    if (format === "locale") {
      setFormattedDate(date.toLocaleString());
    } else {
      setFormattedDate(date.toLocaleDateString());
    }
  }, [dateString, format]);

  if (!formattedDate) {
    // Render null on the server and initial client render to avoid mismatch
    return null;
  }

  return <>{formattedDate}</>;
}
