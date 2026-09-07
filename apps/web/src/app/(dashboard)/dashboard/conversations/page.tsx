import { ConversationsPage } from "@/components/portal/conversations";
export const dynamic = "force-dynamic";
export default function Page(props: { searchParams: Promise<{ page?: string }> }) { return <ConversationsPage {...props} />; }
