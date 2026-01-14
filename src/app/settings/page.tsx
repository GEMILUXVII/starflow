import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return <SettingsClient user={session.user} />;
}
