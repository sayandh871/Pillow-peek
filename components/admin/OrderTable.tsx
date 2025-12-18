"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Download, Eye, Truck, CheckCircle, XCircle, Search, Filter } from "lucide-react";
import { updateOrderStatus, bulkUpdateOrders } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/utils/export";

interface OrderTableProps {
  orders: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100" },
  processing: { label: "Processing", color: "text-blue-700", bg: "bg-blue-100" },
  shipped: { label: "Shipped", color: "text-purple-700", bg: "bg-purple-100" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
};

export function OrderTable({ orders }: OrderTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const onUpdateStatus = async (id: string, status: string) => {
    startTransition(async () => {
      try {
        await updateOrderStatus(id, status);
        toast.success(`Order set to ${status}`);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update status");
      }
    });
  };

  const onBulkUpdateStatus = async (status: string) => {
    startTransition(async () => {
      try {
        await bulkUpdateOrders(selectedIds, status);
        toast.success(`${selectedIds.length} orders updated to ${status}`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update orders");
      }
    });
  };

  const handleExport = () => {
    const exportData = orders.map(o => ({
      ID: o.id,
      Customer: o.user?.name || "Guest",
      Email: o.user?.email || "N/A",
      Total: o.totalAmount,
      Status: o.status,
      Date: new Date(o.createdAt).toLocaleDateString(),
    }));
    exportToCSV(exportData, "orders_export");
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <Input 
            placeholder="Search orders..." 
            className="pl-9 bg-white border-light-300 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                onClick={handleExport}
                className="border-light-300 text-dark-600 rounded-xl"
            >
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" className="border-light-300 text-dark-600 rounded-xl">
                <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
        </div>
      </div>

      {/* Bulk Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 bg-dark-900 text-light-100 px-6 py-4 rounded-2xl shadow-2xl">
            <span className="font-bold border-r border-dark-700 pr-4">{selectedIds.length} selected</span>
            <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => onBulkUpdateStatus('processing')} className="text-light-100">Process</Button>
                <Button variant="ghost" size="sm" onClick={() => onBulkUpdateStatus('shipped')} className="text-light-100">Ship</Button>
                <Button variant="ghost" size="sm" onClick={() => onBulkUpdateStatus('delivered')} className="text-light-100">Deliver</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="text-dark-400">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-light-300 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-light-100">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-dark-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                return (
                  <TableRow key={order.id} className={cn(selectedIds.includes(order.id) && "bg-light-100")}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-footnote text-dark-600 truncate max-w-[120px]">
                      {order.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-dark-900">{order.user?.name || "Guest"}</div>
                      <div className="text-footnote text-dark-500">{order.user?.email || "N/A"}</div>
                    </TableCell>
                    <TableCell className="font-bold text-dark-900">${order.totalAmount}</TableCell>
                    <TableCell>
                      <Badge className={cn("rounded-full px-2.5 py-0.5", config.bg, config.color)}>
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-dark-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-light-200">
                          <DropdownMenuLabel className="text-footnote text-dark-400">Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'processing')}>Processing</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'shipped')}>Shipped</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'delivered')}>Delivered</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(order.id, 'cancelled')} className="text-red-600">Cancel</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
