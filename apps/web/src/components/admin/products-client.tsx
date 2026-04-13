"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, X, Server, Zap, Users, Eye, EyeOff
} from "lucide-react";
import {
  Button, Input, Label, Textarea, Badge,
  Card, CardContent, CardHeader, CardTitle, Skeleton
} from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  priceCents: number;
  currency: string;
  type: string;
  paymentType: string;
  isActive: boolean;
  isFeatured: boolean;
  localImageKey: string | null;
  lemonSqueezyVariantId: string | null;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  priceCents: string;
  currency: string;
  type: string;
  paymentType: string;
  lemonSqueezyVariantId: string;
  isActive: boolean;
  isFeatured: boolean;
  localImageKey: string;
}

const EMPTY_FORM: ProductFormData = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  priceCents: "",
  currency: "EUR",
  type: "self_hosted",
  paymentType: "digital_goods",
  lemonSqueezyVariantId: "",
  localImageKey: "",
  isActive: true,
  isFeatured: false,
};

export function AdminProductsClient({ initial }: { initial: Product[] }) {
  const [products, setProducts] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: "",
      priceCents: String(p.priceCents / 100),
      currency: p.currency,
      type: p.type,
      paymentType: p.paymentType,
      lemonSqueezyVariantId: p.lemonSqueezyVariantId ?? "",
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      localImageKey: p.localImageKey ?? "",
    });
    setShowModal(true);
  }

  async function handleFileUpload(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "image");

      const res = await fetch("/api/admin/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setForm(prev => ({ ...prev, localImageKey: data.localKey }));
      toast({ title: "Image uploaded", variant: "success" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    }
  }

  async function handleSave() {
    startTransition(async () => {
      try {
        const body = {
          ...form,
          priceCents: Math.round(Number(form.priceCents) * 100),
          slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        };

        const res = await fetch(editing ? `/api/admin/products/${editing.id}` : "/api/admin/products", {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        const json = await res.json();
        if (!json.success || !res.ok) throw new Error(json.error?.message || "Save failed");
        
        const saved = json.data as Product;

        setProducts(prev =>
          editing
            ? prev.map(p => (p.id === saved.id ? saved : p))
            : [saved, ...prev]
        );
        setShowModal(false);
        toast({ title: editing ? "Product updated" : "Product created", variant: "success" });
      } catch (err: any) {
        toast({ title: "Save failed", description: err.message, variant: "destructive" });
      }
    });
  }

  async function handleToggleActive(product: Product) {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      const json = await res.json();
      if (!json.success || !res.ok) throw new Error(json.error?.message || "Update failed");
      const updated = json.data as Product;
      
      setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      toast({ title: `Product ${updated.isActive ? "published" : "unpublished"}`, variant: "success" });
    } catch {
      toast({ title: "Update failed", variant: "destructive" });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success || !res.ok) throw new Error(json.error?.message || "Delete failed");
      
      setProducts(prev => prev.filter(p => p.id !== id));
      setShowModal(false);
      toast({ title: "Product deleted", variant: "success" });
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    }
  }

  const Icon: Record<string, React.ElementType> = { saas: Zap, self_hosted: Server, human_service: Users };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New product
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map(product => {
          const PIcon = Icon[product.type] ?? Zap;
          return (
            <Card key={product.id} className={product.isActive ? "" : "opacity-60"}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <PIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm">{product.name}</CardTitle>
                  </div>
                  <Badge variant={product.isActive ? "success" : "secondary"} className="shrink-0 text-xs">
                    {product.isActive ? "Live" : "Draft"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground truncate">{product.description.slice(0, 80)}…</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {(product.priceCents / 100).toFixed(2)} {product.currency}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleToggleActive(product)}>
                      {product.isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(product)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-lg overflow-y-auto border-l border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">{editing ? "Edit product" : "New product"}</h2>
                    <p className="text-sm text-muted-foreground">{editing ? "Manage product details" : "Create a new offering"}</p>
                </div>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label required>Name</Label>
                    <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Product name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug</Label>
                    <Input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} placeholder="auto-generated" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label required>Description</Label>
                  <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Full product description" />
                </div>

                <div className="space-y-1.5">
                  <Label>Short description</Label>
                  <Input value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} placeholder="One-line summary for product cards" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label required>Price (in currency units)</Label>
                    <Input type="number" step="0.01" value={form.priceCents} onChange={e => setForm({...form, priceCents: e.target.value})} placeholder="99.00" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Currency</Label>
                    <Input value={form.currency} onChange={e => setForm({...form, currency: e.target.value.toUpperCase()})} placeholder="EUR" maxLength={3} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Product type</Label>
                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                      className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="self_hosted">Self-hosted</option>
                      <option value="saas">SaaS</option>
                      <option value="human_service">Human Service</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Payment type</Label>
                    <select value={form.paymentType} onChange={e => setForm({...form, paymentType: e.target.value})}
                      className="flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="digital_goods">Digital Goods (LS)</option>
                      <option value="human">Human Service (Stripe)</option>
                    </select>
                  </div>
                </div>

                {form.paymentType === "digital_goods" && (
                  <div className="space-y-1.5">
                    <Label>Lemon Squeezy Variant ID</Label>
                    <Input value={form.lemonSqueezyVariantId} onChange={e => setForm({...form, lemonSqueezyVariantId: e.target.value})} placeholder="12345" />
                  </div>
                )}

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive: e.target.checked})} className="rounded" />
                    <span className="text-sm">Active (visible in storefront)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="rounded" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <Label>Product image</Label>
                  <div className="flex flex-col gap-2">
                    {form.localImageKey && (
                      <div className="relative h-24 w-32 overflow-hidden rounded-lg border border-border">
                        <img 
                          src={`/api/files/${form.localImageKey}`} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
                    />
                    <p className="text-[10px] text-muted-foreground">Internal disk path: {form.localImageKey || "none"}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-6">
                  {editing && (
                    <Button variant="destructive" size="icon" className="shrink-0 group relative overflow-hidden" 
                      onClick={(e) => { e.preventDefault(); handleDelete(editing.id); }}>
                      <span className="absolute inset-0 bg-destructive/10 transition-colors group-hover:bg-destructive/20" />
                      <Trash2 className="h-4 w-4 relative z-10" />
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button className="flex-1 shadow-md shadow-primary/20" loading={isPending} onClick={handleSave}>
                    {editing ? "Save changes" : "Create product"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
