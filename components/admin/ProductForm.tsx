"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productFormSchema, type ProductFormValues } from "@/lib/schemas/admin";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichText } from "./RichText";
import { ImageUpload } from "./ImageUpload";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createProduct } from "@/lib/actions/admin";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  metadata: {
    categories: any[];
    sizes: any[];
    firmness: any[];
    materials: any[];
  };
}

export function ProductForm({ initialData, metadata }: ProductFormProps) {
  const router = useRouter();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "",
      basePrice: initialData?.basePrice || "",
      isPublished: initialData?.isPublished ?? false,
      images: initialData?.images || [],
      variants: initialData?.variants || [
        {
          sizeId: "",
          firmnessId: "",
          materialId: "",
          price: "",
          stockQuantity: 0,
          sku: "",
          weight: ""
        }
      ]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants"
  });

  const onSubmit = async (data: ProductFormValues) => {
    try {
      await createProduct(data);
      toast.success("Product saved successfully!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Section: Basics */}
        <div className="space-y-8">
          <div className="border-b border-light-200 pb-4">
            <h2 className="text-xl font-semibold text-dark-900">Basic Information</h2>
            <p className="text-body-small text-dark-500">Core details about your product.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Cloud Sleeper" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {metadata.categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price ($)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>The primary price shown in listings.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col gap-6">
               <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border border-light-200 p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-body-medium font-bold">Published Status</FormLabel>
                      <FormDescription>
                        Make this product visible to customers.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Gallery</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value} 
                        onChange={field.onChange}
                        onRemove={(url) => field.onChange(field.value.filter((val) => val !== url))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Description</FormLabel>
                <FormControl>
                  <RichText 
                    value={field.value || ""} 
                    onChange={field.onChange} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section: Variants */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-light-200 pb-4">
            <div>
              <h2 className="text-xl font-semibold text-dark-900">Product Variants</h2>
              <p className="text-body-small text-dark-500">Manage size, firmness, and stock for each variation.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ 
                sizeId: "", 
                firmnessId: "", 
                materialId: "", 
                price: "", 
                stockQuantity: 0, 
                sku: "", 
                weight: "" 
              })}
              className="border-dark-900 text-dark-900 hover:bg-dark-900 hover:text-light-100"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div 
                key={field.id} 
                className="group relative grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 rounded-2xl border border-light-200 bg-light-50 p-6 transition-all hover:bg-white hover:shadow-md"
              >
                <FormField
                  control={form.control}
                  name={`variants.${index}.sizeId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metadata.sizes.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.firmnessId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">Firmness</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Firmness" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metadata.firmness.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.materialId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">Material</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="Material" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {metadata.materials.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">Price ($)</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.stockQuantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">Stock</FormLabel>
                      <FormControl>
                        <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            className="bg-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`variants.${index}.sku`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-footnote font-bold text-dark-400">SKU</FormLabel>
                      <FormControl>
                        <Input placeholder="SKU" {...field} className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                   control={form.control}
                   name={`variants.${index}.weight`}
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel className="text-footnote font-bold text-dark-400">Weight (kg)</FormLabel>
                       <FormControl>
                         <Input placeholder="0.00" {...field} className="bg-white" />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                />

                <div className="flex items-end pb-1.5 justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t border-light-200 pt-8">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="rounded-xl px-8 h-12"
            >
                Cancel
            </Button>
            <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="bg-dark-900 text-light-100 hover:bg-dark-700 rounded-xl px-12 h-12 shadow-lg"
            >
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData?.id ? "Update Product" : "Create Product"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
