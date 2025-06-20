import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { FaTrash } from 'react-icons/fa';

function Cart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantityErrors, setQuantityErrors] = useState({});
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            setLoading(true);
            const res = await fetch("http://localhost:5000/api/cart", { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
            } else {
                throw new Error('Failed to fetch cart');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (itemId, newValue) => {
        const newErrors = { ...quantityErrors };
        delete newErrors[itemId]; // Clear previous error for this item

        if (newValue === '') {
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.map(item =>
                    item.itemId._id === itemId ? { ...item, quantity: '' } : item
                )
            }));
            setQuantityErrors(newErrors);
            return;
        }

        const quantity = Number(newValue);

        if (isNaN(quantity) || !Number.isInteger(quantity)) {
            setQuantityErrors(newErrors);
            return;
        }

        if (quantity < 1) {
            setQuantityErrors(newErrors);
            return handleRemoveItem(itemId);
        }

        const cartItem = cart.items.find(p => p.itemId._id === itemId);
        if (cartItem && quantity > cartItem.itemId.count) {
            newErrors[itemId] = `Only ${cartItem.itemId.count} in stock`;
            setCart(prevCart => ({
                ...prevCart,
                items: prevCart.items.map(item =>
                    item.itemId._id === itemId ? { ...item, quantity: cartItem.itemId.count } : item
                )
            }));
            setQuantityErrors(newErrors);
            // Still make the API call to update the backend to the max value
            newValue = cartItem.itemId.count;
        } else {
             setQuantityErrors(newErrors);
        }

        try {
            const res = await fetch(`http://localhost:5000/api/cart/update/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ quantity: Number(newValue) }),
            });
            const data = await res.json();
            if (res.ok) {
                setCart(data.cart);
            } else {
                alert(data.error);
                fetchCart(); // Re-sync with server on failure
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const res = await fetch(`http://localhost:5000/api/cart/remove/${itemId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
             const data = await res.json();
            if (res.ok) {
                setCart(data.cart);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckout = () => {
        navigate('/billing-address');
    };

    const subtotal = cart?.items.reduce((acc, item) => acc + item.itemId.price * (Number(item.quantity) || 0), 0) || 0;
    // const isCheckoutDisabled = Object.keys(quantityErrors).length > 0 || cart?.items.some(item => item.quantity === '' || item.quantity < 1);

    if (loading) return <div className="text-center text-white py-10">Loading Cart...</div>;

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto text-white p-4 flex-grow">
                <h1 className="text-3xl font-bold text-cyan-400 mb-8">My Cart</h1>
                {error && <p className="text-red-400">{error}</p>}
                {!cart || cart.items.length === 0 ? (
                    <div className="text-center">
                        <p className="text-xl text-gray-400">Your cart is empty.</p>
                        <button onClick={() => navigate('/')} className="mt-4 bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-cyan-300 transition">
                            Shop Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cart.items.map(({ itemId: item, quantity }) => (
                                <div key={item._id} className="bg-black bg-opacity-60 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between">
                                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                        <img src={item.image.url} alt={item.name} className="w-24 h-24 object-cover rounded-lg"/>
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-semibold text-cyan-300">{item.name}</h3>
                                            <p className="text-white">₹{item.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleUpdateQuantity(item._id, quantity - 1)} disabled={(quantity <= 1 && quantity !== '') || item.count === 0} className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={quantity}
                                                onChange={(e) => handleUpdateQuantity(item._id, e.target.value.replace(/[^0-9]/g, ''))}
                                                onBlur={(e) => { if (e.target.value === '') handleUpdateQuantity(item._id, 1); }}
                                                className={`w-16 bg-gray-800 text-white text-center rounded h-8 focus:outline-none focus:ring-2 ${quantityErrors[item._id] ? 'ring-red-500' : 'ring-cyan-400'}`}
                                            />
                                            <button onClick={() => handleUpdateQuantity(item._id, (Number(quantity) || 0) + 1)} disabled={quantity >= item.count} className="bg-gray-700 w-8 h-8 rounded font-bold text-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                            <button onClick={() => handleRemoveItem(item._id)} className="text-red-500 hover:text-red-400 ml-4">
                                                <FaTrash size={20} />
                                            </button>
                                        </div>
                                        {quantityErrors[item._id] && <p className="text-red-400 text-xs mt-1">{quantityErrors[item._id]}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-1 bg-black bg-opacity-60 rounded-lg p-6 h-fit">
                            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Order Summary</h2>
                            <div className="flex justify-between mb-2">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span>Shipping</span>
                                <span>FREE</span>
                            </div>
                            <hr className="border-gray-700 my-4"/>
                            <div className="flex justify-between font-bold text-xl mb-6">
                                <span>Total</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className="w-full bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Proceed to Checkout
                            </button>
                            {/* {isCheckoutDisabled && <p className="text-red-400 text-center text-sm mt-2">Please fix quantity errors before checkout.</p>} */}
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
}

export default Cart; 