import { notFound } from "next/navigation";
import { WeddingInvitation } from "@/components/invitation/WeddingInvitation";
import { getWeddingGuest } from "@/lib/guest";

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guest = await getWeddingGuest(decodeURIComponent(slug));

  if (!guest) notFound();

  return <WeddingInvitation guest={guest} />;
}
