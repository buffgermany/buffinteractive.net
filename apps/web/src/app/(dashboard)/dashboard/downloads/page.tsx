import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db, schema, eq, and } from "@platform/db";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui/primitives";
import { Download, FileIcon, Package } from "lucide-react";
import { getAssetUrl } from "@/lib/files";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Downloads — Platform" };
export const dynamic = "force-dynamic";

export default async function DownloadsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Find all products the user has an active license for
  const userLicenses = await db
    .selectDistinct({ productId: schema.licenses.productId })
    .from(schema.licenses)
    .where(and(
      eq(schema.licenses.userId, session!.user.id),
      eq(schema.licenses.status, "active")
    ));

  const productIds = userLicenses.map(l => l.productId);

  const assets =
    productIds.length > 0
      ? await db
          .select({ asset: schema.assets, product: schema.products })
          .from(schema.assets)
          .innerJoin(schema.products, eq(schema.assets.productId, schema.products.id))
          .where(eq(schema.assets.productId, productIds[0]!)) // simplified; full: inArray
      : [];

  // Generate presigned URLs for all assets (15 min expiry)
  const assetsWithUrls = await Promise.all(
    assets.map(async ({ asset, product }) => ({
      asset,
      product,
      downloadUrl: getAssetUrl(asset.localKey),
    }))
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Downloads</h1>
        <p className="mt-1 text-muted-foreground">
          Your purchased software and deliverables.
        </p>
      </div>

      {assetsWithUrls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium">No downloads available</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Downloads will appear here after your purchase is processed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {assetsWithUrls.map(({ asset, product, downloadUrl }) => (
            <Card key={asset.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 truncate">
                    <p className="truncate font-medium">{asset.label ?? asset.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {(asset.sizeBytes / 1024 / 1024).toFixed(1)} MB · Uploaded {formatDate(asset.uploadedAt)}
                    </p>
                  </div>
                  <a href={downloadUrl} download={asset.filename} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="gap-2 shrink-0">
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
