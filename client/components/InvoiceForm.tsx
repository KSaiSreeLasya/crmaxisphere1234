import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronRight, Loader2 } from "lucide-react";

interface Package {
  id: string;
  name: string;
  price_inr: number;
  description: string;
  features: string[];
  success_metrics: Record<string, string>;
}

interface InvoiceFormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_company: string;
  package_id: string;
  selected_features: string[];
  gst_percentage: number;
  notes: string;
}

interface InvoiceFormProps {
  onSuccess?: (invoiceId: string) => void;
  onCancel?: () => void;
}

export default function InvoiceForm({ onSuccess, onCancel }: InvoiceFormProps) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    customer_company: "",
    package_id: "",
    selected_features: [],
    gst_percentage: 18,
    notes: "",
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (selectedPackageId && packages.length > 0) {
      const pkg = packages.find((p) => p.id === selectedPackageId);
      setSelectedPackage(pkg || null);
      setFormData((prev) => ({
        ...prev,
        package_id: selectedPackageId,
        selected_features: pkg?.features || [],
      }));
    }
  }, [selectedPackageId, packages]);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase.from("packages").select("*");
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      toast.error("Failed to load packages");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      selected_features: prev.selected_features.includes(feature)
        ? prev.selected_features.filter((f) => f !== feature)
        : [...prev.selected_features, feature],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name || !formData.customer_email) {
      toast.error("Customer name and email are required");
      return;
    }

    if (!selectedPackageId) {
      toast.error("Please select a package");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .insert({
          ...formData,
          created_by: user?.id,
          package_id: selectedPackageId,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Invoice created successfully");
      if (onSuccess) {
        onSuccess(data.id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create invoice",
      );
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Customer Information Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Customer Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="customer_name" className="text-sm font-medium">
              Full Name *
            </Label>
            <Input
              id="customer_name"
              name="customer_name"
              placeholder="John Doe"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="customer_email" className="text-sm font-medium">
              Email Address *
            </Label>
            <Input
              id="customer_email"
              name="customer_email"
              type="email"
              placeholder="john@example.com"
              value={formData.customer_email}
              onChange={handleInputChange}
              required
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="customer_phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              placeholder="+91 XXXXX XXXXX"
              value={formData.customer_phone}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="customer_company" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="customer_company"
              name="customer_company"
              placeholder="Your Company (Optional)"
              value={formData.customer_company}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Package Selection Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Select Package
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                selectedPackageId === pkg.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ₹{pkg.price_inr.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
              <div className="mt-3 flex items-center text-blue-600 font-medium text-sm">
                {selectedPackageId === pkg.id && (
                  <>
                    Selected <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Selection Section */}
      {selectedPackage && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Scope / Features
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select features from {selectedPackage.name} to include in this
            invoice
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedPackage.features.map((feature, idx) => (
              <div key={idx} className="flex items-start">
                <Checkbox
                  id={`feature-${idx}`}
                  checked={formData.selected_features.includes(feature)}
                  onCheckedChange={() => handleFeatureToggle(feature)}
                  className="mt-1"
                />
                <Label
                  htmlFor={`feature-${idx}`}
                  className="ml-3 text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {feature}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing & Payment Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Pricing & Payment
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gst_percentage" className="text-sm font-medium">
                GST Percentage (%)
              </Label>
              <Input
                id="gst_percentage"
                name="gst_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.gst_percentage}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            {selectedPackage && (
              <div>
                <Label className="text-sm font-medium block">
                  Total Amount
                </Label>
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-lg font-bold text-gray-900">
                    ₹
                    {(
                      selectedPackage.price_inr +
                      (selectedPackage.price_inr * formData.gst_percentage) /
                        100
                    ).toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Additional Information
        </h3>
        <div>
          <Label htmlFor="notes" className="text-sm font-medium">
            Additional Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Add any additional notes for the invoice..."
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="mt-2"
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Invoice...
            </>
          ) : (
            "Create & View Invoice"
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="px-6 py-2"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
