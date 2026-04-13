"use client";

import { useState } from "react";
import { Key, Ban, Search, AlertTriangle, MonitorX } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

interface LicenseData {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  licenseKey: string;
  hardwareId: string | null;
  status: string;
  activatedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  revokeReason: string | null;
  createdAt: string;
}

export function AdminLicensesClient({ initialLicenses, total }: { initialLicenses: LicenseData[], total: number }) {
  const [licenses, setLicenses] = useState(initialLicenses);
  const [search, setSearch] = useState("");
  const [revoking, setRevoking] = useState<LicenseData | null>(null);

  const filtered = licenses.filter(l => 
    l.licenseKey.toLowerCase().includes(search.toLowerCase()) || 
    (l.hardwareId || "").toLowerCase().includes(search.toLowerCase())
  );

  async function handleRevoke(reason: string) {
    if (!revoking) return;
    
    try {
      const res = await fetch(`/api/admin/licenses/${revoking.id}/revoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (!json.success || !res.ok) throw new Error(json.error?.message || "Failed to revoke");
      
      setLicenses(prev => prev.map(l => l.id === revoking.id ? { ...l, status: "revoked", revokedAt: new Date().toISOString(), revokeReason: reason } : l));
      setRevoking(null);
      toast({ title: "License revoked", variant: "success" });
    } catch (err: any) {
      toast({ title: "Revocation failed", description: err.message, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Licenses</h1>
          <p className="text-sm text-muted-foreground">Manage issues and hardware limits ({total} total)</p>
        </div>
        <div className="flex w-full sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Search by license key or HWID..." 
                className="pl-9 w-full rounded-r-none" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="button" variant="secondary" className="rounded-l-none border-l-0">Search</Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs font-semibold text-muted-foreground">
                  <th className="px-4 py-3 font-medium">License Key</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Product / User</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Status</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Hardware ID</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Key className="h-8 w-8 opacity-20" />
                        <p>No licenses found matching "{search}"</p>
                      </div>
                    </td>
                  </tr>
                ) : (filtered.map(license => (
                  <tr key={license.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3 font-mono text-xs">
                      {license.licenseKey}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                      <div>Product: {license.productId.slice(0, 8)}...</div>
                      <div>User: {license.userId.slice(0, 8)}...</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={license.status === "active" ? "success" : license.status === "revoked" ? "destructive" : "secondary"}>
                        {license.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs hidden lg:table-cell text-muted-foreground">
                      {license.hardwareId || "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {license.status === "active" && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setRevoking(license)}>
                            Revoke
                          </Button>
                      )}
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Revoke Modal */}
      {revoking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Revoke License</h2>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              You are about to permanently revoke license <span className="font-mono text-foreground font-semibold">{revoking.licenseKey}</span>. 
              This will immediately terminate all active sessions and block future uses.
            </p>

            <div className="flex gap-3">
               <Button variant="outline" className="flex-1" onClick={() => setRevoking(null)}>Cancel</Button>
               <Button variant="destructive" className="flex-1 gap-2" onClick={() => handleRevoke("TOS_VIOLATION")}>
                 <Ban className="h-4 w-4" />
                 Revoke Now
               </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
