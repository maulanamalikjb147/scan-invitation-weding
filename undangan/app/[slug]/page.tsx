import { notFound } from "next/navigation";
import { WeddingInvitation } from "@/components/invitation/WeddingInvitation";
import { fetchWeddingContent } from "@/lib/wedding-content";
import { getWeddingGuest } from "@/lib/guest";

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [guest, content] = await Promise.all([
    getWeddingGuest(decodeURIComponent(slug)),
    fetchWeddingContent(),
  ]);

  if (!guest) notFound();

  return <WeddingInvitation guest={guest} content={content} />;
}
