export const ProductCard = ({ product, onAdd }) => {
  return (
    <article className="surface overflow-hidden">
      <div className="h-44 w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-lg font-bold text-ink">{product.name}</h3>
        <p className="text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-pine">${(product.priceCents / 100).toFixed(2)}</p>
          <button onClick={() => onAdd(product)} className="btn-primary">
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};
