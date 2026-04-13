"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Shield, User, X, ShieldAlert } from "lucide-react";
import { Button, Input, Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { useSession } from "@/lib/auth-client";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export function AdminUsersClient({ initialUsers, total }: { initialUsers: UserData[], total: number }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<UserData | null>(null);
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
      }
    } catch {
      toast({ title: "Failed to search", variant: "destructive" });
    }
  }

  async function handleSaveRole(newRole: string) {
    if (!editing) return;
    if (editing.id === session?.user.id) {
        toast({ title: "Cannot change your own role", variant: "destructive" });
        return;
    }
    
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        });
        const json = await res.json();
        if (!json.success || !res.ok) throw new Error(json.error?.message || "Failed to update");
        
        setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, role: newRole } : u));
        setEditing({ ...editing, role: newRole });
        toast({ title: "User role updated", variant: "success" });
      } catch (err: any) {
        toast({ title: "Update failed", description: err.message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage platform users ({total} total)</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex w-full sm:max-w-sm relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
                placeholder="Search by name or email..." 
                className="pl-9 w-full rounded-r-none" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" variant="secondary" className="rounded-l-none border-l-0">Search</Button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50 text-left text-xs font-semibold text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Role</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <User className="h-8 w-8 opacity-20" />
                        <p>No users found matching "{search}"</p>
                      </div>
                    </td>
                  </tr>
                ) : (users.map(user => (
                  <tr key={user.id} className="transition-colors hover:bg-secondary/20">
                    <td className="px-4 py-3">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px] uppercase tracking-wider">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(user)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
        </div>
      </div>

      {/* Edit User Drawer */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditing(null)}
            />
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-sm overflow-y-auto border-l border-border bg-background/95 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                   <h2 className="text-xl font-bold">Manage User</h2>
                   <p className="text-sm text-muted-foreground">{editing.email}</p>
                </div>
                <button onClick={() => setEditing(null)} className="rounded-lg p-1 hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-6">
                 <div>
                    <h3 className="text-sm font-semibold mb-3 tracking-wide text-foreground">Account Details</h3>
                    <div className="space-y-1 text-sm bg-secondary/30 p-4 rounded-xl border border-border">
                        <p><span className="text-muted-foreground">ID: </span> <span className="font-mono text-xs">{editing.id}</span></p>
                        <p><span className="text-muted-foreground">Name: </span> {editing.name}</p>
                        <p><span className="text-muted-foreground">Joined: </span> {new Date(editing.createdAt).toLocaleString()}</p>
                    </div>
                 </div>

                 <div>
                    <h3 className="text-sm font-semibold mb-3 tracking-wide text-foreground flex items-center gap-2">
                        {editing.role === "admin" ? <ShieldAlert className="h-4 w-4 text-primary" /> : <Shield className="h-4 w-4 text-muted-foreground" />}
                        Role Management
                    </h3>
                    
                    {session?.user.id === editing.id ? (
                        <p className="text-xs text-muted-foreground italic">You cannot change your own role.</p>
                    ) : (
                        <div className="flex gap-2">
                            <Button 
                                variant={editing.role === "user" ? "default" : "outline"} 
                                className="flex-1"
                                onClick={() => handleSaveRole("user")}
                                disabled={editing.role === "user" || isPending}
                                loading={isPending}
                            >
                                Standard User
                            </Button>
                            <Button 
                                variant={editing.role === "admin" ? "default" : "outline"} 
                                className={editing.role === "admin" ? "flex-1 glow-primary-sm" : "flex-1"}
                                onClick={() => handleSaveRole("admin")}
                                disabled={editing.role === "admin" || isPending}
                                loading={isPending}
                            >
                                Administrator
                            </Button>
                        </div>
                    )}
                 </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
