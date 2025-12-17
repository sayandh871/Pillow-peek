import { getProductReviews } from "@/lib/actions/product";
import { StarRating } from "./StarRating";
import { User } from "lucide-react";

export async function ReviewSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);

  if (reviews.length === 0) {
    return (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">No Reviews Yet</h3>
            <p className="text-gray-500">Be the first to review this mattress.</p>
        </div>
    );
  }

  // Calculate stats for summary (optional, but nice)
  const average = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
        Customer Reviews
      </h2>
      
      <div className="grid gap-10 lg:grid-cols-12">
          {/* Summary Column */}
          <div className="lg:col-span-4 space-y-4">
               <div className="flex items-end gap-4">
                   <div className="text-5xl font-bold text-gray-900">{average.toFixed(1)}</div>
                   <div className="pb-2">
                       <StarRating rating={average} />
                       <p className="text-sm text-gray-500 mt-1">{reviews.length} Reviews</p>
                   </div>
               </div>
          </div>

          {/* List Column */}
          <div className="lg:col-span-8 space-y-8">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-8 last:border-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        {review.user?.name ? (
                            <span className="font-semibold text-sm">{review.user.name[0].toUpperCase()}</span>
                        ) : (
                            <User className="h-5 w-5" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">{review.user?.name || "Anonymous"}</h4>
                        <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} size={14} />
                            <span className="text-xs text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                  </div>
                  <div className="prose prose-sm text-gray-600">
                      <p>{review.comment}</p>
                  </div>
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}
