import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';

function Wishlist() {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/user/wishlist", { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setWishlist(data.wishlist);
            } else {
                throw new Error('Failed to fetch wishlist');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (itemId) => {
        try {
            await fetch('http://localhost:5000/api/user/wishlist/toggle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itemId }),
            });
            setWishlist(wishlist.filter(item => item._id !== itemId));
        } catch (err) {
            console.error("Error removing from wishlist:", err);
        }
    };

    const handleMoveToCart = async (itemId) => {
        try {
            await fetch('http://localhost:5000/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ itemId, quantity: 1 }),
            });
            // After moving to cart, remove from wishlist
            handleRemove(itemId);
        } catch (err) {
            console.error("Error moving to cart:", err);
        }
    };

    if (loading) {
        return <div className="text-center text-white py-10">Loading...</div>;
    }

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto text-white p-4 flex-grow">
                <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Wishlist</h1>
                {error && <p className="text-red-400">{error}</p>}
                {wishlist.length === 0 ? (
                    <div className="text-center">
                        <p className="text-xl text-gray-400">Your wishlist is empty.</p>
                        <button onClick={() => navigate('/')} className="mt-4 bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition">
                            Find Items
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map(item => (
                            <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-4 flex flex-col justify-between">
                                <img src={item.image.url} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4"/>
                                <h3 className="text-xl font-semibold text-cyan-300">{item.name}</h3>
                                <p className="text-lg text-white font-bold my-2">₹{item.price}</p>
                                <div className="flex justify-between items-center mt-4">
                                    <button onClick={() => handleMoveToCart(item._id)} className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded hover:bg-cyan-400 transition">
                                        <FaShoppingCart />
                                        Move to Cart
                                    </button>
                                    <button onClick={() => handleRemove(item._id)} className="text-red-500 hover:text-red-400">
                                        <FaTrash size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Wishlist; 