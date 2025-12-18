"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Search, User, Mail, Calendar, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportToCSV } from "@/lib/utils/export";

interface CustomerTableProps {
  customers: any[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const handleExport = () => {
    const exportData = customers.map(c => {
      const totalSpent = c.orders.reduce((acc: number, o: any) => acc + (parseFloat(o.totalAmount) || 0), 0);
      return {
        Name: c.name,
        Email: c.email,
        "Total Orders": c.orders.length,
        "Total Spent": `$${totalSpent.toFixed(2)}`,
        Joined: new Date(c.createdAt).toLocaleDateString(),
      };
    });
    exportToCSV(exportData, "customers_export");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <Input 
            placeholder="Search customers..." 
            className="pl-9 bg-white border-light-300 rounded-xl"
          />
        </div>
        <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-light-300 text-dark-600 rounded-xl"
        >
            <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="rounded-xl border border-light-300 bg-white shadow-sm overflow-hidden overflow-x-auto">
        <Table>
          <TableHeader className="bg-light-100">
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-dark-500">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const totalSpent = customer.orders.reduce((acc: number, o: any) => acc + (parseFloat(o.totalAmount) || 0), 0);
                
                return (
                  <TableRow key={customer.id} className="group hover:bg-light-100/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-light-200 text-dark-400 group-hover:bg-dark-900 group-hover:text-light-100 transition-colors">
                            {customer.image ? <img src={customer.image} className="h-full w-full rounded-full object-cover" /> : <User size={18} />}
                        </div>
                        <div>
                            <div className="font-medium text-dark-900">{customer.name}</div>
                            <div className="text-footnote text-dark-500">{customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-dark-700 font-medium font-mono">
                      {customer.orders.length}
                    </TableCell>
                    <TableCell className="text-dark-900 font-bold">
                      ${totalSpent.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-dark-500">
                      {new Date(customer.createdAt).toLocaleDateString()}
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
