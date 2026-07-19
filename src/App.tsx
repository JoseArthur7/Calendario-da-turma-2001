import { useState } from "react";
import { Toaster } from "sonner";
import Calendar from "./Calendar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Calendar />
      <Toaster />
    </div>
  );
}
