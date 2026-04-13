"use client";

import { useState } from "react";
import { ShoppingBag, Search } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui/primitives";
import { formatCurrency } from "@/lib/utils";

interface OrderData {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  paymentType: string;
  externalOrderId: string;
  status: string;
  amountCents: number;
  currency: string;
  createdAt: string;
}

export function AdminOrdersClient({ initialOrders, total }: { initialOrders: OrderData[], total: number }) {
  const [orders, setOrders] = useState(initialOrders);
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o => 
    o.externalOrderId.toLowerCase().includes(search.toLowerCase()) || 
    o.userEmail.toLowerCase().includes(search.toLowerCase()) || 
    o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">Transaction history ({total} total)</p>
        </div>
        <div className="flex w-full sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Search by ID, external ID, or email..." 
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
                  <th className="px-4 py-3 font-medium">Order ID</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Product</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShoppingBag className="h-8 w-8 opacity-20" />
                        <p>No orders found matching "{search}"</p>
                      </div>
                    </td>
                  </tr>
                ) : (filtered.map(order => (
                  <tr key={order.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-foreground font-medium">{order.id.slice(0, 12)}...</div>
                      <div className="font-mono text-[10px] text-muted-foreground truncate max-w-24">Ext: {order.externalOrderId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-xs truncate max-w-32">{order.userName}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-32">{order.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground font-mono">
                      {order.productId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.status === "paid" ? "success" : order.status === "failed" ? "destructive" : "secondary"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold">{formatCurrency(order.amountCents, order.currency)}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">{order.paymentType}</div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
