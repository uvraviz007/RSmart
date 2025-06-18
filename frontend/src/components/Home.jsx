import React, { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Home() {
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Categories for the slider
  const categories = [
    { name: "Electronics", icon: "💻" },
    { name: "Fashion", icon: "👕" },
    { name: "Home", icon: "🏠" },
    { name: "Sports", icon: "⚽" },
    { name: "Books", icon: "📚" },
    { name: "Beauty", icon: "💄" },
    { name: "Toys", icon: "🎮" },
    { name: "Health", icon: "💊" },
  ];

  useEffect(() => {
    // Fetch products from backend
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/item/allitems");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.items);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      setSliderWidth(sliderRef.current.scrollWidth / 2);
    }
  }, [products]); // Recalculate when products change

  return (
    <div>
      <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700">
        <div className="min-h-screen text-white container mx-auto">
          <Navbar />
          
          {/* Hero Section */}
          <section className="my-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-cyan-400 drop-shadow-lg mb-4 text-center">
              Exclusive Deals for Newcomers
            </h2>
            <p className="text-center text-lg text-cyan-100 mb-2">
              Unlock special prices and offers on your first purchase!
            </p>
          </section>

          {/* Categories Slider */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">
              Shop by Category
            </h3>
            <div className="overflow-x-hidden whitespace-nowrap py-4 px-2 scrollbar-hide">
              <div
                className="inline-flex gap-8"
                style={{
                  width: sliderWidth ? `${sliderWidth * 2}px` : "auto",
                  animation: sliderWidth
                    ? `slide-circular ${sliderWidth / 60}s linear infinite`
                    : "none",
                }}
                ref={sliderRef}
              >
                {[...categories, ...categories].map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-black bg-opacity-40 rounded-xl shadow-lg p-4 min-w-[180px] flex flex-col items-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                  >
                    <span className="text-4xl mb-2">{category.icon}</span>
                    <span className="text-cyan-200 font-semibold">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* All Products Section */}
          <section className="mb-10">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4 text-center">
              All Products
            </h3>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
              </div>
            ) : error ? (
              <div className="text-red-400 text-center">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-black bg-opacity-40 rounded-xl shadow-lg p-4 hover:scale-105 transition-transform duration-300"
                  >
                    <img
                      src={product.image.url}
                      alt={product.name}
                      className="rounded-lg mb-4 w-full h-48 object-cover"
                    />
                    <h4 className="text-xl font-semibold text-cyan-200 mb-2">
                      {product.name}
                    </h4>
                    <p className="text-gray-300 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">
                        ${product.price}
                      </span>
                      <button className="bg-cyan-400 text-black px-4 py-2 rounded hover:bg-cyan-300 transition">
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <Footer />
        <style>
          {`
            @keyframes slide-circular {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
      </div>
    </div>
  );
}

export default Home;
