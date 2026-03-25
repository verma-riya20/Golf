import { Link } from "react-router-dom";

export const CheckoutCancelPage = () => {
  return (
    <section className="mx-auto max-w-xl surface p-8 text-center">
      <h1 className="text-3xl font-bold text-ember">Payment Cancelled</h1>
      <p className="mt-2 text-slate-600">No problem. Your plan selection is not lost, you can try again anytime.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link className="btn-primary" to="/subscription">
          Back to Subscription
        </Link>
        <Link className="btn-secondary" to="/">
          Back to Home
        </Link>
      </div>
    </section>
  );
};
