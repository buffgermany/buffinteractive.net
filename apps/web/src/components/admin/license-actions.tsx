"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ban, MessageSquare, ChevronDown, AlertTriangle, Send } from "lucide-react";
import { Button, Badge, Textarea, Label } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

interface AdminLicenseActionsProps {
  licenseId: string;
  licenseKey: string;
  currentStatus: string;
}

export function AdminLicenseActions({ licenseId, licenseKey, currentStatus }: AdminLicenseActionsProps) {
  const [open, setOpen] = useState<"revoke" | "message" | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [severity, setSeverity] = useState<"info" | "warning" | "critical">("info");

  async function handleRevoke() {
    setRevokeLoading(true);
    try {
      const res = await fetch(`/api/admin/licenses/${licenseId}/revoke`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "TOS_VIOLATION", message: "License revoked by admin." }),
      });
      if (!res.ok) throw new Error("Revoke failed");
      const data = await res.json() as { sessionTerminated: boolean };
      toast({
        title: "License revoked",
        description: data.sessionTerminated
          ? "Active WS session was terminated."
          : "License revoked. No active session found.",
        variant: "success",
      });
      setOpen(null);
    } catch {
      toast({ title: "Revoke failed", variant: "destructive" });
    } finally {
      setRevokeLoading(false);
    }
  }

  async function handleSendMessage() {
    if (!messageText.trim()) return;
    setMessageLoading(true);
    try {
      const res = await fetch(`/api/admin/licenses/${licenseId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, severity }),
      });
      if (!res.ok) throw new Error("Message failed");
      const data = await res.json() as { delivered: boolean };
      toast({
        title: data.delivered ? "Message delivered" : "Message not delivered",
        description: data.delivered
          ? "Pushed to active session."
          : "License not currently connected.",
        variant: data.delivered ? "success" : "warning",
      });
      setOpen(null);
      setMessageText("");
    } catch {
      toast({ title: "Failed to send message", variant: "destructive" });
    } finally {
      setMessageLoading(false);
    }
  }

  if (currentStatus === "revoked") return <span className="text-xs text-muted-foreground">—</span>;

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs"
          onClick={() => setOpen(open === "message" ? null : "message")}
        >
          <MessageSquare className="h-3 w-3" />
          Message
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
          onClick={() => setOpen(open === "revoke" ? null : "revoke")}
        >
          <Ban className="h-3 w-3" />
          Revoke
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card shadow-xl"
          >
            {open === "revoke" ? (
              <div className="p-4">
                <div className="mb-3 flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div>
                    <p className="text-sm font-semibold">Revoke license?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This will immediately revoke access and terminate any active WS session. This cannot be undone.
                    </p>
                    <code className="mt-1 block text-xs text-muted-foreground/60">{licenseKey.slice(0, 20)}…</code>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(null)}>Cancel</Button>
                  <Button size="sm" variant="destructive" className="flex-1" loading={revokeLoading} onClick={handleRevoke}>
                    Revoke
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                <p className="text-sm font-semibold">Send message</p>
                <div>
                  <Label className="mb-1.5 block text-xs">Severity</Label>
                  <div className="flex gap-2">
                    {(["info", "warning", "critical"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeverity(s)}
                        className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                          severity === s
                            ? s === "critical" ? "border-destructive bg-destructive/10 text-destructive"
                            : s === "warning" ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                            : "border-primary/50 bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  placeholder="Message to display in the running application…"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen(null)}>Cancel</Button>
                  <Button size="sm" className="flex-1 gap-1" loading={messageLoading} onClick={handleSendMessage}>
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(null)} />}
    </div>
  );
}
