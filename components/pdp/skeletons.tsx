export function ReviewsSkeleton() {
    return (
        <div className="mt-16 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
            <div className="grid gap-10 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <div className="h-64 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="lg:col-span-8 space-y-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="space-y-4">
                             <div className="flex gap-4">
                                 <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                                 <div className="space-y-2">
                                     <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                     <div className="h-3 w-20 bg-gray-200 rounded"></div>
                                 </div>
                             </div>
                             <div className="h-16 bg-gray-100 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="mt-24 border-t pt-16 animate-pulse">
             <div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
             <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
                 {[1, 2, 3, 4].map(i => (
                     <div key={i} className="space-y-4">
                         <div className="aspect-square bg-gray-200 rounded-lg"></div>
                         <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                         <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
                     </div>
                 ))}
             </div>
        </div>
    );
}
