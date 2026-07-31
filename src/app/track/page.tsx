import { Suspense } from "react";
import TrackPage from "@/components/track-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order | Hulu Store",
  description: "Track your Hulu Store package status in real-time.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAFA" }}>
          <div className="shimmer h-8 w-48 rounded-xl" />
        </div>
      }
    >
      <TrackPage />
    </Suspense>
  );
}
