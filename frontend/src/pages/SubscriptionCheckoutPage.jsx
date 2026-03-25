import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createSubscriptionRequest, setDemoSubscriptionStatus } from "../api/golf";
import { useState } from "react";

export const SubscriptionCheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const planType = location.state?.planType;
  const charityName = location.state?.charityName;
  const charityPercentage = location.state?.charityPercentage;
  const amount = location.state?.amount;
  const charityAmount = location.state?.charityAmount;
  const charityId = location.state?.charityId;

  if (!planType || !charityName || !amount) {
    return <Navigate to="/subscription" replace />;
  }

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const data = await createSubscriptionRequest(planType, charityId, charityPercentage);
      const renewalDate = data?.subscription?.renewalDate;
      const now = new Date();
      const daysRemaining = renewalDate
        ? Math.ceil((new Date(renewalDate) - now) / (1000 * 60 * 60 * 24))
        : planType === "YEARLY"
        ? 365
        : 30;

      queryClient.setQueryData(["subscriptionStatus"], {
        isSubscribed: true,
        status: "ACTIVE",
        daysRemaining,
        subscription: {
          ...data.subscription,
          charityName
        }
      });
    } catch (error) {
      const backendMessage = error?.response?.data?.message;

      // Fallback for local demo mode if backend payment setup is unavailable.
      const demoSubscription = setDemoSubscriptionStatus({
        planType,
        charityName,
        charityPercentage,
        amount
      });
      queryClient.setQueryData(["subscriptionStatus"], demoSubscription);

      if (backendMessage) {
        setSubmitError(backendMessage);
      }
    } finally {
      setIsSubmitting(false);
    }

    navigate("/checkout/success", {
      state: {
        planType,
        charityName,
        amount,
        charityAmount,
        charityPercentage
      }
    });
  };

  const handleCancel = () => {
    navigate("/checkout/cancel", {
      state: {
        planType,
        charityName
      }
    });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div className="surface p-8">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="mt-2 text-slate-600">
          Demo payment mode is active. No Stripe or Razorpay integration is required for this flow.
        </p>

        <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Plan</span>
            <span className="font-semibold">{planType}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Amount</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Charity</span>
            <span className="font-semibold">{charityName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Contribution</span>
            <span className="font-semibold">
              {charityPercentage}% (${charityAmount.toFixed(2)})
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60"
          >
            {isSubmitting ? "Confirming..." : "Confirm Payment"}
          </button>
          <button
            onClick={handleCancel}
            className="rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-800 transition hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
        {submitError && <p className="mt-3 text-sm text-amber-700">{submitError}</p>}
      </div>

      <div className="text-center">
        <Link className="text-sm font-semibold text-blue-700 hover:underline" to="/subscription">
          Back to plan selection
        </Link>
      </div>
    </section>
  );
};
