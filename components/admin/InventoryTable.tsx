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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Plus, Pencil, Trash2, ExternalLink, Archive, CheckCircle, Search, X } from "lucide-react";
import Link from "next/link";
import { deleteProduct, bulkDeleteProducts, bulkUpdatePublishStatus } from "@/lib/actions/admin";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";

interface InventoryTableProps {
  products: any[];
}

export function InventoryTable({ products }: InventoryTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const onDelete = async () => {
    if (!productToDelete) return;
    startTransition(async () => {
      try {
        await deleteProduct(productToDelete);
        toast.success("Product deleted successfully");
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete product");
      } finally {
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    });
  };

  const onBulkDelete = async () => {
    startTransition(async () => {
      try {
        await bulkDeleteProducts(selectedIds);
        toast.success(`${selectedIds.length} products deleted`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        toast.error("Failed to delete products");
      } finally {
        setIsBulkDeleteDialogOpen(false);
      }
    });
  };

  const onBulkStatusUpdate = async (published: boolean) => {
    startTransition(async () => {
      try {
        await bulkUpdatePublishStatus(selectedIds, published);
        toast.success(`Updated ${selectedIds.length} products`);
        setSelectedIds([]);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update products");
      }
    });
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <Input 
            placeholder="Search products..." 
            className="pl-9 bg-white border-light-300 rounded-xl"
            defaultValue={searchParams.get("query")?.toString()}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="border-light-300 text-dark-600 rounded-xl">
                Filter
            </Button>
            <Button asChild className="bg-dark-900 text-light-100 hover:bg-dark-700 shadow-md rounded-xl">
                <Link href="/admin/products/create">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Link>
            </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-4 bg-dark-900 text-light-100 px-6 py-4 rounded-2xl shadow-2xl border border-dark-700">
            <span className="text-body-medium font-bold border-r border-dark-700 pr-4">
              {selectedIds.length} selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onBulkStatusUpdate(true)}
                disabled={isPending}
                className="text-light-100 hover:bg-dark-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" /> Publish
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onBulkStatusUpdate(false)}
                disabled={isPending}
                className="text-light-100 hover:bg-dark-700"
              >
                <Archive className="mr-2 h-4 w-4" /> Archive
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsBulkDeleteDialogOpen(true)}
                disabled={isPending}
                className="text-red-400 hover:bg-red-900/20 hover:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedIds([])}
                className="text-dark-400 hover:text-light-100"
              >
                <X className="h-4 w-4" />
              </Button>
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
                  checked={selectedIds.length === products.length && products.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-dark-500">
                  No products found. Start by adding one!
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const totalStock = product.variants?.reduce((acc: number, v: any) => acc + v.stockQuantity, 0) || 0;
                const mainImage = product.images?.[0]?.url;

                return (
                  <TableRow 
                    key={product.id} 
                    className={cn(
                        "group transition-colors hover:bg-light-100/50",
                        selectedIds.includes(product.id) && "bg-light-100"
                    )}
                  >
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(product.id)}
                        onCheckedChange={() => toggleSelect(product.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg border border-light-300 bg-light-200 overflow-hidden shadow-sm">
                        {mainImage ? (
                          <img src={mainImage} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-dark-300">
                             <Plus size={16} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-dark-900">{product.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.isPublished ? "default" : "secondary"}
                        className={product.isPublished 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-light-300 text-dark-600"
                        }
                      >
                        {totalStock === 0 ? "Out of Stock" : product.isPublished ? "Active" : "Archived"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-dark-700">${product.basePrice}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "font-medium",
                        totalStock === 0 ? "text-red-500" : totalStock < 10 ? "text-amber-500" : "text-dark-700"
                      )}>
                        {totalStock} in stock
                      </span>
                    </TableCell>
                    <TableCell className="text-dark-600">{product.category?.name || "Uncategorized"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-light-200 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl shadow-lg border-light-200">
                          <DropdownMenuLabel className="px-3 py-2 text-footnote font-bold text-dark-400 uppercase tracking-wider">Product Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer transition-colors focus:bg-light-200">
                            <Link href={`/admin/products/${product.id}`} className="flex items-center">
                              <Pencil className="mr-2 h-4 w-4 text-dark-500" /> Edit Product
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer transition-colors focus:bg-light-200">
                            <Link href={`/mattresses/${product.id}`} target="_blank" className="flex items-center">
                              <ExternalLink className="mr-2 h-4 w-4 text-dark-500" /> View Live
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-light-200" />
                          <DropdownMenuItem 
                            onClick={() => {
                                setProductToDelete(product.id);
                                setIsDeleteDialogOpen(true);
                            }}
                            className="rounded-lg text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer transition-colors"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Product
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

      {/* Single Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              and all its associated variants and images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={onDelete}
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
            >
                {isPending ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} products?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove all selected products and their data. 
              This action is IRREVERSIBLE.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={onBulkDelete}
                className="bg-red-600 text-white hover:bg-red-700 rounded-xl"
            >
                {isPending ? "Deleting..." : "Delete All Selected"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
