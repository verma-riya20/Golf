import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  listCharitiesRequest
} from "../api/golf";

const LOCAL_CHARITIES = [
  {
    id: "local-charity-1",
    name: "Youth Golf Foundation",
    description: "Supports youth golf training, coaching camps, and equipment grants.",
    supporters: 120,
    totalContributed: 540000
  },
  {
    id: "local-charity-2",
    name: "Green Earth Course Initiative",
    description: "Funds sustainable golf course maintenance and water-saving projects.",
    supporters: 86,
    totalContributed: 410000
  },
  {
    id: "local-charity-3",
    name: "Community Sports Access",
    description: "Provides sports scholarships for underrepresented local communities.",
    supporters: 202,
    totalContributed: 720000
  }
];

export const SubscriptionPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [planType, setPlanType] = useState("MONTHLY");
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [charityPercentage, setCharityPercentage] = useState(10);

  const { data: charities, isLoading: charitiesLoading } = useQuery({
    queryKey: ["charities"],
    queryFn: () => listCharitiesRequest()
  });

  const monthlyPrice = 29.99;
  const yearlyPrice = 299.90;
  const yearlySavings = monthlyPrice * 12 - yearlyPrice;

  const displayCharities = useMemo(() => {
    if (Array.isArray(charities) && charities.length > 0) {
      return charities;
    }
    return LOCAL_CHARITIES;
  }, [charities]);

  useEffect(() => {
    const preselected = location.state?.selectedCharityId;
    if (preselected) {
      setSelectedCharity(preselected);
    }
  }, [location.state]);

  const charityAmount = planType === "MONTHLY"
    ? (monthlyPrice * charityPercentage) / 100
    : (yearlyPrice * charityPercentage) / 100;

  const handleSubscribe = () => {
    if (!selectedCharity) {
      alert("Please select a charity");
      return;
    }

    const selectedCharityData = displayCharities.find(
      (charity) => (charity._id ?? charity.id) === selectedCharity
    );

    navigate("/checkout", {
      state: {
        planType,
        charityId: selectedCharity,
        charityName: selectedCharityData?.name || "Selected Charity",
        charityPercentage,
        amount: planType === "MONTHLY" ? monthlyPrice : yearlyPrice,
        charityAmount
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        <p className="text-gray-600">
          Join thousands of golf enthusiasts supporting charities through play
        </p>
      </div>

      {/* Plan Selection */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Monthly Plan */}
        <div
          onClick={() => setPlanType("MONTHLY")}
          className={`p-8 rounded-xl border-2 cursor-pointer transition ${
            planType === "MONTHLY"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-white hover:border-green-300"
          }`}
        >
          <h3 className="text-2xl font-bold mb-2">Monthly</h3>
          <div className="mb-6">
            <span className="text-4xl font-bold text-green-600">${monthlyPrice}</span>
            <span className="text-gray-600">/month</span>
          </div>
          <ul className="space-y-3 mb-8 text-gray-700">
            <li className="flex items-center">
              <span className="mr-3 text-green-600">✓</span>
              Monthly draw participation
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-green-600">✓</span>
              Golf score tracking
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-green-600">✓</span>
              Charity selection
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-green-600">✓</span>
              Prize eligibility
            </li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
          >
            Choose Plan
          </button>
        </div>

        {/* Yearly Plan */}
        <div
          onClick={() => setPlanType("YEARLY")}
          className={`p-8 rounded-xl border-2 cursor-pointer transition relative ${
            planType === "YEARLY"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            Save 10%!
          </div>
          <h3 className="text-2xl font-bold mb-2">Yearly</h3>
          <div className="mb-2">
            <span className="text-4xl font-bold text-blue-600">${yearlyPrice}</span>
            <span className="text-gray-600">/year</span>
          </div>
          <p className="text-green-600 font-semibold mb-6 text-sm">
            Save ${yearlySavings.toFixed(2)} per year!
          </p>
          <ul className="space-y-3 mb-8 text-gray-700">
            <li className="flex items-center">
              <span className="mr-3 text-blue-600">✓</span>
              12 monthly draws
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-blue-600">✓</span>
              Unlimited golf scores
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-blue-600">✓</span>
              Fixed charity commitment
            </li>
            <li className="flex items-center">
              <span className="mr-3 text-blue-600">✓</span>
              Priority winner support
            </li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            Choose Plan
          </button>
        </div>
      </div>

      {/* Charity Selection */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-xl space-y-6">
        <h2 className="text-2xl font-bold">Select Your Charity</h2>
        <p className="text-gray-700">
          Minimum 10% will always go to your selected charity. You can increase this percentage!
        </p>

        {charitiesLoading ? (
          <p>Loading charities...</p>
        ) : (
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {displayCharities.map((charity) => (
                <div
                  key={charity._id ?? charity.id}
                  onClick={() => setSelectedCharity(charity._id ?? charity.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedCharity === (charity._id ?? charity.id)
                      ? "border-purple-500 bg-purple-100"
                      : "border-gray-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <p className="font-bold">{charity.name}</p>
                  <p className="text-sm text-gray-600">{charity.description}</p>
                </div>
              ))}
            </div>

            {(!charities || charities.length === 0) && (
              <p className="text-xs text-amber-700">
                Showing local demo charities because no charities were returned from backend.
              </p>
            )}

            {/* Charity Percentage */}
            <div className="bg-white p-6 rounded-lg border-2 border-purple-200 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Charity Contribution: {charityPercentage}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={charityPercentage}
                  onChange={(e) => setCharityPercentage(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-gray-600 mt-2">
                  ${charityAmount.toFixed(2)} per {planType === "MONTHLY" ? "month" : "year"} goes to charity
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-8 rounded-xl space-y-4 border-2 border-gray-200">
        <h2 className="text-xl font-bold">Subscription Summary</h2>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Plan:</span>
            <span className="font-semibold">{planType}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-semibold">
              ${planType === "MONTHLY" ? monthlyPrice : yearlyPrice}
            </span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>To Charity ({charityPercentage}%):</span>
            <span className="font-semibold">${charityAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Selected Charity:</span>
            <span className="font-semibold">
              {displayCharities.find((c) => (c._id ?? c.id) === selectedCharity)?.name || "Not selected"}
            </span>
          </div>
          <div className="flex justify-between pt-4 border-t-2 border-gray-300 text-lg font-bold">
            <span>Total:</span>
            <span>${planType === "MONTHLY" ? monthlyPrice : yearlyPrice}</span>
          </div>
        </div>
        {selectedCharity && (
          <button
            onClick={handleSubscribe}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition mt-6 disabled:opacity-50"
          >
            Proceed to Payment
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
