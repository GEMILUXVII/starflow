import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsClient } from "./client";

export default async function StatsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <StatsClient />;
}
