import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createCheckoutSessionRequest } from "../api/orders";
import { useAuth } from "../providers/AuthProvider";

export const CartPage = ({ cart }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createCheckoutSessionRequest(
        cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      ),
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    }
  });

  const onCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/cart" } } });
      return;
    }
    checkoutMutation.mutate();
  };

  if (cart.items.length === 0) {
    return <div className="surface p-6 text-slate-600">Your cart is empty.</div>;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="surface p-5">
        <h1 className="text-2xl font-bold">Your Cart</h1>
        <div className="mt-4 space-y-4">
          {cart.items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-slate-600">${(item.unitPrice / 100).toFixed(2)} each</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="input w-20"
                  type="number"
                  min={1}
                  max={99}
                  value={item.quantity}
                  onChange={(e) => cart.updateQuantity(item.productId, Number(e.target.value))}
                />
                <button onClick={() => cart.removeItem(item.productId)} className="btn-secondary">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="surface p-5">
        <h2 className="text-lg font-bold">Summary</h2>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-slate-600">Total</span>
          <span className="text-2xl font-bold text-pine">${(cart.totalCents / 100).toFixed(2)}</span>
        </div>

        <button className="btn-primary mt-5 w-full" onClick={onCheckout} disabled={checkoutMutation.isPending}>
          {checkoutMutation.isPending ? "Redirecting..." : "Checkout with Stripe"}
        </button>

        {checkoutMutation.isError ? (
          <p className="mt-3 text-sm text-red-600">
            {checkoutMutation.error?.response?.data?.message || "Checkout failed. Try again."}
          </p>
        ) : null}
      </aside>
    </section>
  );
};
