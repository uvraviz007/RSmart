import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function MyListedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Fetching seller items...");
        const res = await fetch("http://localhost:5000/api/item/seller-items", {
          credentials: "include",
        });

        console.log("Response status:", res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch items");
        }

        const data = await res.json();
        console.log("Fetched data:", data);
        setItems(data.items || []);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError(err.message || "Failed to load your listed items");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleEdit = (itemId) => {
    navigate(`/edit-item/${itemId}`);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/item/delete/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      // Remove the item from the list
      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item");
    }
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
            <h1 className="text-3xl font-bold text-cyan-400">My Listed Items</h1>
            <button
              onClick={() => navigate("/additem")}
              className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
            >
              Add New Item
            </button>
          </div>

          {error && (
            <div className="bg-red-900 bg-opacity-30 border border-red-400 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No items listed yet</p>
              <button
                onClick={() => navigate("/additem")}
                className="bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition"
              >
                Add Your First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-6 border border-gray-700 hover:border-cyan-400 transition">
                  <img
                    src={item.image.url}
                    alt={item.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold text-cyan-400 mb-2">{item.name}</h3>
                  <p className="text-gray-300 mb-2 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-white">${item.price}</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      item.count > 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                    }`}>
                      Stock: {item.count}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item._id)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default MyListedItems; 