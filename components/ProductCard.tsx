
import React from 'react';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { Link, useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'scroll';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  const { addToCart, wishlist, toggleWishlist, user, reviews } = useStore();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const isInWishlist = wishlist.includes(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to use wishlist");
      return;
    }
    toggleWishlist(product.id);
  };

  // Image Rotation Logic
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && product.images && product.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
      }, 1200);
    } else {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, product.images]);

  const currentImage = product.images && product.images.length > 0 ? product.images[currentImageIndex] : '';

  // Discount Logic
  const isDiscounted = product.originalPrice !== undefined && product.originalPrice > product.price;

  // Calculate Rating
  const productReviews = reviews.filter(r => r.productId === product.id);
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
    : 0;

  return (
    <div
      className="group bg-white border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        to={`/product/${product.slug}`}
        className={`block relative overflow-hidden mb-3 ${variant === 'scroll' ? 'flex-1 w-full bg-white' : 'aspect-[3/4] bg-gray-100'}`}
      >
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full transition-transform duration-700 group-hover:scale-105 ${variant === 'scroll' ? 'object-contain object-center' : 'object-cover'}`}
        />
        {/* Discount Badge */}
        {isDiscounted && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
            Sale
          </div>
        )}
      </Link>

      {/* Content */}
      <div className={`flex flex-col px-1 ${variant === 'scroll' ? 'flex-shrink-0' : 'flex-1'}`}>
        <Link to={`/product/${product.slug}`} className="block mb-1">
          <h3 className="text-[15px] font-medium text-gray-800 leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-lg text-emerald-700">
            ৳{product.price.toLocaleString()}
          </span>
          {isDiscounted && (
            <span className="text-sm text-gray-400 line-through">
              ৳{product.originalPrice!.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4 mt-auto">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={12}
                fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                className={star <= Math.round(averageRating) ? "" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({productReviews.length})</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.variants && product.variants.length > 0) {
                navigate(`/product/${product.slug}`);
              } else {
                addToCart(product);
              }
            }}
            className="flex-1 flex items-center justify-center gap-2 border border-gray-300 hover:border-emerald-500 hover:text-emerald-500 text-gray-700 py-2 rounded-[4px] text-sm font-bold transition-colors"
          >
            <ShoppingCart size={16} /> Add to Cart
          </button>
          <button
            onClick={handleToggleWishlist}
            className={`w-10 flex-shrink-0 flex items-center justify-center border border-gray-300 hover:border-emerald-500 rounded-[4px] transition-colors ${isInWishlist ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-400 hover:text-emerald-500'}`}
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
