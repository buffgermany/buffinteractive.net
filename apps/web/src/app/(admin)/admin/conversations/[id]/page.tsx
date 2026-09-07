import { ConversationPage } from "@/components/portal/conversations";
export const dynamic = "force-dynamic";
export default function Page(props: { params: Promise<{ id: string }> }) { return <ConversationPage {...props} isAdmin />; }
