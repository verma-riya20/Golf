import { useQuery } from "@tanstack/react-query";
import { listMyOrdersRequest } from "../api/orders";

export const OrdersPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: listMyOrdersRequest
  });

  if (isLoading) {
    return <div className="text-slate-600">Loading your orders...</div>;
  }

  if (error) {
    return <div className="text-red-600">Unable to load orders.</div>;
  }

  if (!data?.length) {
    return <div className="surface p-6 text-slate-600">No orders yet.</div>;
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Order History</h1>

      {data.map((order) => (
        <article key={order.id} className="surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">Order #{order.id.slice(-8)}</p>
            <p className="text-sm font-semibold text-tide">{order.status}</p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {new Date(order.createdAt).toLocaleString()} - ${(order.totalCents / 100).toFixed(2)}
          </p>

          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span>
                  {item.product.name} x {item.quantity}
                </span>
                <span>${(item.lineTotal / 100).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
};
