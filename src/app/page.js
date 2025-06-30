"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingScreen from "../components/loading/loadingscreen";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    router.replace("/auth/login");
    // Keep loading true until redirect
  }, [router]);

  return <LoadingScreen />;
}
