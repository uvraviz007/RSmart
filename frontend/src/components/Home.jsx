import React, { useRef, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Home() {
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    search: ""
  });

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/item/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data.categories);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch products with filters
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.minPrice) queryParams.append('minPrice', parseFloat(filters.minPrice));
        if (filters.maxPrice) queryParams.append('maxPrice', parseFloat(filters.maxPrice));
        if (filters.search) queryParams.append('search', filters.search);

        const res = await fetch(`http://localhost:5000/api/item/allitems?${queryParams}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.items || []);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load products. Please try again later.");
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const updateWidths = () => {
      if (sliderRef.current) {
        const sliderWidth = sliderRef.current.scrollWidth;
        const containerWidth = sliderRef.current.parentElement.clientWidth;
        setSliderWidth(sliderWidth);
        setContainerWidth(containerWidth);
      }
    };

    updateWidths();
    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, [categories]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // Ensure price values are valid numbers
    if (name === 'minPrice' || name === 'maxPrice') {
      if (value === '' || (!isNaN(value) && parseFloat(value) >= 0)) {
        setFilters(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

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

          {/* Search and Filters */}
          <section className="mb-10 px-4">
            <div className="bg-black bg-opacity-40 rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  name="search"
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="bg-gray-800 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            </div>
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
                  width: sliderWidth > containerWidth ? `${sliderWidth * 2}px` : '100%',
                  animation: sliderWidth > containerWidth
                    ? `slide-circular ${sliderWidth / 60}s linear infinite`
                    : 'none',
                  justifyContent: sliderWidth <= containerWidth ? 'center' : 'flex-start'
                }}
                ref={sliderRef}
              >
                {(sliderWidth > containerWidth ? [...categories, ...categories] : categories).map((category, idx) => (
                  <div
                    key={idx}
                    className="bg-black bg-opacity-40 rounded-xl shadow-lg p-4 min-w-[180px] flex flex-col items-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setFilters(prev => ({ ...prev, category }))}
                  >
                    <span className="text-4xl mb-2">
                      {category === 'Electronics' ? '💻' :
                       category === 'Fashion' ? '👕' :
                       category === 'Home' ? '🏠' :
                       category === 'Sports' ? '⚽' :
                       category === 'Books' ? '📚' :
                       category === 'Beauty' ? '💄' :
                       category === 'Toys' ? '🎮' :
                       category === 'Health' ? '💊' : '🏷️'}
                    </span>
                    <span className="text-cyan-200 font-semibold">
                      {category}
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
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-cyan-300">{product.category}</span>
                      <span className="text-cyan-400 font-bold">₹{product.price}</span>
                    </div>
                    <h4 className="text-xl font-semibold text-cyan-200 mb-2">
                      {product.name}
                    </h4>
                    <p className="text-gray-300 mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <button className="w-full bg-cyan-400 text-black px-4 py-2 rounded hover:bg-cyan-300 transition">
                      Buy Now
                    </button>
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
