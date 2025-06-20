import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/user/purchases", {
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch purchases");
        }

        const data = await res.json();
        setPurchases(data.purchases || []);
        setItems(data.items || []);
      } catch (err) {
        console.error("Error fetching purchases:", err);
        setError("Failed to load your purchase history");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  // Create a map of items by ID for easy lookup
  const itemsMap = items.reduce((acc, item) => {
    acc[item._id] = item;
    return acc;
  }, {});

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen">
        <div className="text-white container mx-auto">
          <Navbar />
          <div className="flex justify-center items-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
      <div className="text-white container mx-auto flex-1">
        <Navbar />
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-cyan-400">Purchase History</h1>
            <button
              onClick={() => navigate("/")}
              className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
            >
              Continue Shopping
            </button>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-400 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {purchases.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No purchases yet</p>
              <button
                onClick={() => navigate("/")}
                className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {purchases.map((purchase) => {
                const item = itemsMap[purchase.itemId];
                if (!item) return null;

                return (
                  <div key={purchase._id} className="bg-black bg-opacity-60 rounded-lg p-6 border border-gray-700">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={item.image.url}
                        alt={item.name}
                        className="w-full md:w-48 h-48 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-cyan-400 mb-2">{item.name}</h3>
                        <p className="text-gray-300 mb-4">{item.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-gray-400">Quantity:</span>
                            <p className="text-white font-semibold">{purchase.count}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Price per item:</span>
                            <p className="text-white font-semibold">${item.price}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Total:</span>
                            <p className="text-cyan-400 font-bold text-lg">${purchase.totalPrice}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">
                            Purchased on: {formatDate(purchase.date)}
                          </span>
                          <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm">
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PurchaseHistory; 