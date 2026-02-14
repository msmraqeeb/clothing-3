
import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const CartSidebar: React.FC = () => {
  const { cart, isCartOpen, closeCart, removeFromCart } = useStore();
  const navigate = useNavigate();

  const total = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * item.quantity), 0);

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col font-sans">
        {/* Header */}
        <div className="p-5 flex items-center justify-between bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-none">{cart.length}</span>
          </div>
          <button onClick={closeCart} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
              <svg className="w-24 h-24 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm">Add some healthy foods!</p>
            </div>
          ) : (
            cart.map((item) => {
              const cartItemId = item.selectedVariantId ? `${item.id}-${item.selectedVariantId}` : item.id;
              return (
                <div key={cartItemId} className="flex gap-4 group">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center p-2 shrink-0">
                    <img src={item.selectedVariantImage || item.images?.[0] || ''} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-semibold text-gray-800 text-sm mb-0.5 truncate">{item.name}</h4>
                    {item.selectedVariantName && (
                      <span className="text-[10px] font-bold text-black uppercase tracking-widest mb-1">{item.selectedVariantName}</span>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-black font-bold">{item.quantity} x ৳{(Number(item.price) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(cartItemId)}
                    className="self-start text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-5 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-800">৳{(total || 0).toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleViewCart}
                className="w-full bg-gray-100 hover:bg-white text-gray-800 hover:text-emerald-500 font-bold py-3.5 rounded-full transition-colors flex justify-center items-center gap-2 border border-transparent hover:border-emerald-500"
              >
                View Full Cart
              </button>
              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-500 hover:bg-white text-white hover:text-emerald-500 font-bold py-3.5 rounded-full transition-colors flex justify-center items-center gap-2 shadow-lg shadow-emerald-200 border border-transparent hover:border-emerald-500"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
