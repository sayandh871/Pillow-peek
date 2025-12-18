import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardStats, getRecentOrders, getAuditLogs } from "@/lib/actions/admin";
import { Badge } from "@/components/ui/badge";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const [statsData, recentOrders, auditLogs] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getAuditLogs(10)
  ]);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${statsData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Based on paid orders",
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      title: "Active Orders",
      value: statsData.activeOrders.toString(),
      icon: ShoppingCart,
      description: "Pending delivery",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Low Stock Alert",
      value: statsData.lowStock.toString(),
      icon: AlertTriangle,
      description: "Variants under 10 units",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Top Seller",
      value: statsData.topSelling?.name || "None",
      icon: TrendingUp,
      description: statsData.topSelling ? `${statsData.topSelling.totalSold} units sold` : "No sales data",
      color: "text-purple-600",
      bg: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight text-dark-900">Dashboard</h1>
            <p className="text-body-medium text-dark-500">
            Real-time insights and operational overview.
            </p>
        </div>
        <Button asChild className="bg-dark-900 text-light-100 hover:bg-dark-700 shadow-sm">
            <Link href="/admin/products/create">
                New Product
            </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-light-200 shadow-sm overflow-hidden transition-all hover:shadow-md group">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-footnote font-bold text-dark-400 uppercase tracking-wider">
                {stat.title}
              </CardTitle>
              <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon size={18} className={stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-900">{stat.value}</div>
              <p className="text-footnote text-dark-500 mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         {/* Recent Orders */}
         <Card className="lg:col-span-2 border-light-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-body-large font-bold">Recent Orders</CardTitle>
                    <CardDescription>Latest customer transactions.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-dark-400 hover:text-dark-900">
                    <Link href="/admin/orders">View all</Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {recentOrders.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-dark-400">
                            No orders found.
                        </div>
                    ) : (
                        recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-light-100 text-dark-400 group-hover:bg-dark-900 group-hover:text-light-100 transition-colors">
                                        <ShoppingCart size={18} />
                                    </div>
                                    <div>
                                        <div className="text-body-medium font-bold text-dark-900">
                                            {order.user?.name || "Guest User"}
                                        </div>
                                        <div className="text-footnote text-dark-500">
                                            {order.items.length} items • ${order.totalAmount}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge 
                                        variant="outline" 
                                        className={cn(
                                            "capitalize",
                                            order.status === 'delivered' ? "bg-green-50 text-green-700 border-green-200" :
                                            order.status === 'cancelled' ? "bg-red-50 text-red-700 border-red-200" : "bg-blue-50 text-blue-700 border-blue-200"
                                        )}
                                    >
                                        {order.status}
                                    </Badge>
                                    <div className="text-footnote text-dark-400 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
         </Card>

         {/* Audit Feed */}
         <Card className="border-light-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-body-large font-bold">Activity Log</CardTitle>
                <CardDescription>Recent administrative actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <ActivityFeed logs={auditLogs} />
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
