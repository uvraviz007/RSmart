import React, { useState } from 'react';
import { FaTimes, FaHeart, FaRegHeart } from 'react-icons/fa';

function ItemModal({ item, onClose, onAddToCart, onBuyNow, onToggleWishlist, isWishlisted, userData }) {
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const handleAddToCart = () => {
    onAddToCart(item._id, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    onBuyNow(item._id, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 text-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <FaTimes size={24} />
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <img src={item.image.url} alt={item.name} className="w-full h-auto object-cover rounded-lg" />
          </div>
          <div className="md:w-1/2 flex flex-col">
            <h2 className="text-3xl font-bold text-cyan-400 mb-2">{item.name}</h2>
            <p className="text-gray-400 mb-4">{item.category}</p>
            <p className="text-gray-300 mb-4 flex-grow">{item.description}</p>
            
            {item.count > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-cyan-400">₹{item.price.toFixed(2)}</span>
                  <span className="bg-green-900 text-green-400 px-2 py-1 rounded text-sm">
                    In Stock: {item.count}
                  </span>
                </div>
                {!userData?.isSeller && (
                  <div className="flex items-center gap-4 mb-4">
                    <label htmlFor="quantity" className="text-gray-400">Quantity:</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                        disabled={quantity <= 1} 
                        className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '') {
                            setQuantity('');
                          } else {
                            const num = Math.min(Number(val), item.count);
                            setQuantity(num);
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '' || Number(e.target.value) < 1) {
                            setQuantity(1);
                          }
                        }}
                        className="bg-gray-800 text-white px-3 py-1 rounded w-16 text-center focus:outline-none focus:ring-2 focus:ring-cyan-400 h-8"
                        disabled={item.count === 0}
                      />
                      <button 
                        onClick={() => setQuantity(q => Math.min(item.count, (Number(q) || 0) + 1))} 
                        disabled={quantity >= item.count} 
                        className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center my-8">
                <p className="text-2xl font-bold text-red-500">Out of Stock</p>
                <p className="text-gray-400">This item is currently unavailable.</p>
              </div>
            )}

            {!userData?.isSeller ? (
              <div className="flex gap-4 mt-auto">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-cyan-400 text-black font-bold py-2 rounded hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={item.count === 0 || quantity > item.count || quantity < 1}
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={item.count === 0 || quantity > item.count || quantity < 1}
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => onToggleWishlist(item._id)}
                  className="p-2 text-red-500 hover:text-red-400"
                >
                  {isWishlisted ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                </button>
              </div>
            ) : (
              <div className="mt-auto text-center">
                <p className="text-gray-400 text-sm">Seller View - No purchase options available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemModal; 
