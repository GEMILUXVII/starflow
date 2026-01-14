import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StarsClient } from "./client";

export default async function StarsPage() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return <StarsClient user={session.user} />;
}
