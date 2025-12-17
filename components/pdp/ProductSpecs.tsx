
import { 
    Truck, 
    ShieldCheck, 
    Scale 
} from "lucide-react";

interface ProductSpecsProps {
    description: string;
    materials?: string[];
}

export function ProductSpecs({ description, materials = [] }: ProductSpecsProps) {
    return (
        <div className="space-y-8 border-t pt-8 mt-8">
            {/* Description */}
            <div className="prose prose-sm text-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About this Mattress</h3>
                <p>{description}</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-900 mb-3">
                        <Truck className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-gray-900">Free Shipping</h4>
                    <p className="text-xs text-gray-500 mt-1">Direct to your door in 3-5 days.</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 text-green-900 mb-3">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-gray-900">10-Year Warranty</h4>
                    <p className="text-xs text-gray-500 mt-1">Guaranteed against defects.</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-900 mb-3">
                        <Scale className="h-5 w-5" />
                    </div>
                    <h4 className="font-semibold text-gray-900">100-Night Trial</h4>
                    <p className="text-xs text-gray-500 mt-1">Sleep on it, risk-free.</p>
                </div>
            </div>

            {/* Technical Specs */}
             <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Construction & Materials</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                    {materials.length > 0 ? (
                        materials.map((material, idx) => (
                            <li key={idx}>{material}</li>
                        ))
                    ) : (
                        <li>No specific material information available.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
