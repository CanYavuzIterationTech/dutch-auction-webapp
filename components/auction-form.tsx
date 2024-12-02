"use client";
import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Camera,
  Calendar,
  DollarSign,
  Coins,
  HelpCircle,
  Layout,
  Eye,
  Sun,
  Heart,
  Home,
  LucideIcon,
  X,
} from "lucide-react";
import { UploadRequestBody } from "@/backend/types";

interface PricePreview {
  totalSeconds: number;
  dropPerSecond: number;
  dropPercentagePerSecond: number;
  finalPrice: number;
  totalDropPercentage: number;
}

interface FieldLabelProps {
  icon: LucideIcon;
  label: string;
  explanation: string;
}

interface PropertyDescriptionSectionProps {
  icon: LucideIcon;
  title: string;
  name1: string;
  name2: string;
  placeholder1: string;
  placeholder2: string;
}

const AuctionCreationForm: React.FC = () => {
  const [formData, setFormData] = useState<UploadRequestBody>({
    startDate: "",
    endDate: "",
    startingPrice: "",
    minimumPrice: "",
    tokenCount: "",
    layout1: "",
    layout2: "",
    views1: "",
    views2: "",
    outdoor1: "",
    outdoor2: "",
    wellness1: "",
    wellness2: "",
    interior1: "",
    interior2: "",
    image: "",
  });

  const [previewPrice, setPreviewPrice] = useState<PricePreview | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (
      name === "endDate" ||
      name === "startDate" ||
      name === "minimumPrice" ||
      name === "startingPrice"
    ) {
      calculatePriceDrop({
        ...formData,
        [name]: value,
      });
    }
  };

  const calculatePriceDrop = (data: UploadRequestBody): void => {
    if (
      data.startDate &&
      data.endDate &&
      data.minimumPrice &&
      data.startingPrice
    ) {
      const startTime = new Date(data.startDate).getTime();
      const endTime = new Date(data.endDate).getTime();
      const totalSeconds = (endTime - startTime) / 1000;

      if (totalSeconds > 0) {
        const startPrice = parseFloat(data.startingPrice);
        const minPrice = parseFloat(data.minimumPrice);
        const totalDrop = startPrice - minPrice;
        const dropPercentage = (totalDrop / startPrice) * 100;
        const dropPerSecond = totalDrop / totalSeconds;
        const dropPercentagePerSecond = dropPercentage / totalSeconds;

        setPreviewPrice({
          totalSeconds,
          dropPerSecond,
          dropPercentagePerSecond,
          finalPrice: minPrice,
          totalDropPercentage: dropPercentage,
        });
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Convert dates to ISO format
    const formDataWithISODates = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
    };

    console.log("formData", formDataWithISODates);
    setErrors([]);
    console.log("Form submitted:", formDataWithISODates);
    console.log("Price calculations:", previewPrice);

    // Create hash of the form data
    const formDataBuffer = new TextEncoder().encode(JSON.stringify(formDataWithISODates));
    const hashBuffer = await crypto.subtle.digest('SHA-256', formDataBuffer);
    const auctionHashString = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    try {
      const response = await fetch("/api/upload-rwa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auctionData: formDataWithISODates,
          auctionHash: auctionHashString,
          transactionHash: "0x0", // Add a placeholder transaction hash
          id: "0",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload auction data");
      }

      // Handle successful submission
    } catch (error) {
      console.error("Error uploading auction data:", error);
      setErrors([typeof error === 'string' ? error : "Failed to create auction. Please try again."]);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPEG, PNG and WebP images are allowed");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        image: base64String,
      }));
    };
    reader.readAsDataURL(file);
  };

  const FieldLabel: React.FC<FieldLabelProps> = ({
    icon: Icon,
    label,
    explanation,
  }) => (
    <div className="group relative">
      <span className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        {label}
        <HelpCircle className="w-4 h-4 text-slate-400" />
      </span>
      <div className="invisible group-hover:visible absolute left-0 top-6 bg-slate-700 p-3 rounded-lg text-sm w-64 z-10 shadow-lg">
        {explanation}
      </div>
    </div>
  );

  const PropertyDescriptionSection: React.FC<
    PropertyDescriptionSectionProps
  > = ({ icon: Icon, title, name1, name2, placeholder1, placeholder2 }) => (
    <div className="space-y-4 md:col-span-2">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name={name1}
          value={formData[name1 as keyof UploadRequestBody]}
          onChange={handleInputChange}
          placeholder={placeholder1}
          className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
        />
        <input
          type="text"
          name={name2}
          value={formData[name2 as keyof UploadRequestBody]}
          onChange={handleInputChange}
          placeholder={placeholder2}
          className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
        />
      </div>
    </div>
  );

  const validateForm = (): string[] => {
    const errors: string[] = [];
    const now = new Date();
    now.setSeconds(0, 0); // Reset seconds and milliseconds for fairer comparison
    const startTime = new Date(formData.startDate).getTime();
    const endTime = new Date(formData.endDate).getTime();
    const startPrice = parseFloat(formData.startingPrice);
    const minPrice = parseFloat(formData.minimumPrice);

    if (!formData.image) {
      errors.push("Property image is required");
    }

    if (!formData.startDate) {
      errors.push("Start date is required");
    } else if (startTime < now.getTime()) {
      errors.push("Start date must be in the future");
    }

    if (!formData.endDate) {
      errors.push("End date is required");
    } else if (endTime <= startTime) {
      errors.push("End date must be after start date");
    }

    if (!formData.startingPrice) {
      errors.push("Starting price is required");
    } else if (startPrice <= 0) {
      errors.push("Starting price must be greater than 0");
    }

    if (!formData.minimumPrice) {
      errors.push("Minimum price is required");
    } else if (minPrice <= 0) {
      errors.push("Minimum price must be greater than 0");
    } else if (minPrice >= startPrice) {
      errors.push("Minimum price must be less than starting price");
    }

    if (!formData.tokenCount) {
      errors.push("Number of tokens is required");
    } else if (parseInt(formData.tokenCount) <= 0) {
      errors.push("Number of tokens must be greater than 0");
    }

    return errors;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Create Real Estate Auction</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-slate-600">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            {formData.image ? (
              <div className="relative w-full max-w-md">
                <img
                  src={formData.image}
                  alt="Property preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, image: "" }))
                  }
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Camera className="w-12 h-12 text-slate-400 mb-4" />
                <div className="text-center">
                  <label
                    htmlFor="image-upload"
                    className="text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                  >
                    Upload Property Photo
                  </label>
                  <p className="text-sm text-slate-400 mt-2">
                    PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <FieldLabel
                  icon={Calendar}
                  label="Start Date"
                  explanation="The date and time when your Dutch auction will begin - the price starts at its highest point at this moment."
                />
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <FieldLabel
                  icon={Calendar}
                  label="End Date"
                  explanation="The date and time when your auction will finish - the price will reach its lowest point at this moment."
                />
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <FieldLabel
                  icon={DollarSign}
                  label="Starting Price"
                  explanation="The initial selling price of your property when the auction begins - this will gradually decrease until reaching your minimum price."
                />
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <FieldLabel
                  icon={DollarSign}
                  label="Minimum Price"
                  explanation="The lowest price you're willing to accept for your property - the auction will end if this price is reached."
                />
                <input
                  type="number"
                  name="minimumPrice"
                  value={formData.minimumPrice}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
                  min="0"
                  step="0.01"
                />
              </label>
            </div>

            <div className="space-y-4 md:col-span-2">
              <label className="block">
                <FieldLabel
                  icon={Coins}
                  label="Number of Tokens"
                  explanation="The total number of shares your property will be divided into - each token represents partial ownership of the property."
                />
                <input
                  type="number"
                  name="tokenCount"
                  value={formData.tokenCount}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 rounded-lg p-3 border border-slate-600"
                  min="1"
                />
              </label>
            </div>

            <PropertyDescriptionSection
              icon={Layout}
              title="Layout"
              name1="layout1"
              name2="layout2"
              placeholder1="Enter layout description 1"
              placeholder2="Enter layout description 2"
            />

            <PropertyDescriptionSection
              icon={Eye}
              title="Views"
              name1="views1"
              name2="views2"
              placeholder1="Enter views description 1"
              placeholder2="Enter views description 2"
            />

            <PropertyDescriptionSection
              icon={Sun}
              title="Outdoor"
              name1="outdoor1"
              name2="outdoor2"
              placeholder1="Enter outdoor description 1"
              placeholder2="Enter outdoor description 2"
            />

            <PropertyDescriptionSection
              icon={Heart}
              title="Wellness"
              name1="wellness1"
              name2="wellness2"
              placeholder1="Enter wellness description 1"
              placeholder2="Enter wellness description 2"
            />

            <PropertyDescriptionSection
              icon={Home}
              title="Interior"
              name1="interior1"
              name2="interior2"
              placeholder1="Enter interior description 1"
              placeholder2="Enter interior description 2"
            />
          </div>

          {previewPrice && (
            <div className="bg-slate-800 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-semibold mb-4">Price Drop Preview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Duration</div>
                  <div className="font-mono">
                    {Math.floor(previewPrice.totalSeconds / 3600)}h{" "}
                    {Math.floor((previewPrice.totalSeconds % 3600) / 60)}m
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Drop Per Second</div>
                  <div className="font-mono">
                    ${previewPrice.dropPerSecond.toFixed(6)}
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Total Drop</div>
                  <div className="font-mono">
                    {previewPrice.totalDropPercentage.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-sm text-slate-400">Final Price</div>
                  <div className="font-mono">
                    ${previewPrice.finalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
              <ul className="list-disc list-inside text-red-500">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-4 font-medium transition-colors"
          >
            Create Auction
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuctionCreationForm;
