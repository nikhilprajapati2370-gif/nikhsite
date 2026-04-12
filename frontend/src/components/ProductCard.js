import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  return (
    <Link to={`/products/${product.id}`} data-testid={`product-card-${product.id}`}>
      <div className="product-card relative bg-card border border-white/10 rounded-lg overflow-hidden group cursor-pointer h-full flex flex-col">
        {/* Featured badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 badge-accent text-xs font-bold px-2 py-0.5 rounded-full">
            <Zap size={10} />
            Featured
          </div>
        )}

        {/* Stock badge */}
        {product.stock < 20 && (
          <div className="absolute top-2 right-2 z-10 bg-destructive/20 text-destructive border border-destructive/30 text-xs font-bold px-2 py-0.5 rounded-full">
            Low Stock
          </div>
        )}

        {/* Image */}
        <div className="relative overflow-hidden bg-black/40 aspect-square">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&q=60"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.brand}</p>
            <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[1, 2, 3, 4, 5].map(i => (
                <Star
                  key={i}
                  size={10}
                  className={i <= Math.round(product.rating) ? "text-primary fill-primary" : "text-gray-700"}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviews_count})</span>
          </div>

          {/* Price + Cart */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
            <span className="price-tag text-lg">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-black text-xs font-bold px-3 py-1.5 rounded-md transition-all duration-200 border border-primary/30 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid={`add-to-cart-${product.id}`}
            >
              <ShoppingCart size={12} />
              {product.stock === 0 ? "Out" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
