import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { db, schema, eq, and } from "@platform/db";
import { formatDate } from "@/lib/utils";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui/primitives";
import { Key, Cpu, Calendar, Shield, Server, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";

interface PageProps { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: "License Detail — Platform" };
export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  active: "success", suspended: "warning", expired: "secondary", revoked: "destructive",
};

export default async function LicenseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [row] = await db
    .select({ license: schema.licenses, product: schema.products })
    .from(schema.licenses)
    .innerJoin(schema.products, eq(schema.licenses.productId, schema.products.id))
    .where(and(eq(schema.licenses.id, id), eq(schema.licenses.userId, session!.user.id)))
    .limit(1);

  if (!row) notFound();

  const { license, product } = row;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">License #{license.id.slice(0, 8)}</p>
        </div>
        <Badge variant={STATUS_BADGE[license.status] ?? "secondary"} className="ml-auto">
          {license.status}
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* License Key */}
        <Card className="sm:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Key className="h-4 w-4" />License key</CardTitle></CardHeader>
          <CardContent>
            <code className="block w-full select-all rounded-lg bg-muted px-4 py-3 font-mono text-sm text-foreground">
              {license.licenseKey}
            </code>
            {product.type === "self_hosted" && (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Use this key in your application. It will be hardware-locked on first connection.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Hardware Lock */}
        {product.type === "self_hosted" && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Cpu className="h-4 w-4" />Hardware binding</CardTitle></CardHeader>
            <CardContent>
              {license.hardwareId ? (
                <div>
                  <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs">{license.hardwareId}</code>
                  <p className="mt-2 text-xs text-muted-foreground">Permanently bound. Contact support to transfer.</p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <p className="text-sm text-muted-foreground">
                    Not yet bound. Will lock to your hardware on first WebSocket connection.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" />Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(license.createdAt)}</span>
            </div>
            {license.activatedAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Activated</span>
                <span>{formatDate(license.activatedAt)}</span>
              </div>
            )}
            {license.expiresAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span>{formatDate(license.expiresAt)}</span>
              </div>
            )}
            {license.revokedAt && (
              <div className="flex justify-between text-destructive">
                <span>Revoked</span>
                <span>{formatDate(license.revokedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connection info */}
        {product.type === "self_hosted" && (
          <Card className="sm:col-span-2">
            <CardHeader><CardTitle className="flex items-center gap-2 text-sm"><Server className="h-4 w-4" />WebSocket connection</CardTitle></CardHeader>
            <CardContent>
              <code className="block rounded-md bg-muted px-3 py-2 font-mono text-xs">
                wss://{typeof window !== "undefined" ? window.location.host : "api.yourdomain.com"}/v1/license/connect
              </code>
              <p className="mt-2 text-xs text-muted-foreground">
                Your application must maintain a persistent WebSocket connection. A 5-minute grace period applies if disconnected.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Revoke reason */}
        {license.revokeReason && (
          <Card className="sm:col-span-2 border-destructive/30">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{license.revokeReason}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
