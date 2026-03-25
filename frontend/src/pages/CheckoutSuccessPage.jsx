import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

export const CheckoutSuccessPage = () => {
  const location = useLocation();
  const planType = location.state?.planType || "MONTHLY";
  const charityName = location.state?.charityName || "your selected charity";

  return (
    <section className="mx-auto max-w-xl surface p-8 text-center">
      <h1 className="text-3xl font-bold text-pine">Subscription Confirmed</h1>
      <p className="mt-2 text-slate-600">
        Demo payment completed for your {planType.toLowerCase()} plan. Contributions will go to {charityName}.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link className="btn-primary" to="/dashboard">
          Go to Dashboard
        </Link>
        <Link className="btn-secondary" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  );
};
