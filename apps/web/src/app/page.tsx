import { Suspense } from "react";
import { HomeSession } from "@/components/home/home-session";
import { homeSessionFallback } from "@/components/home/home-session-fallback";

export default function Home() {
  return (
    <main>
      <Suspense fallback={homeSessionFallback}>
        <HomeSession />
      </Suspense>
    </main>
  );
}
