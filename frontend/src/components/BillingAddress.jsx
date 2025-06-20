import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function BillingAddress() {
    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        for (const key in formData) {
            if (!formData[key]) {
                setError(`Please fill out the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
                setLoading(false);
                return;
            }
        }
        
        try {
            const res = await fetch('http://localhost:5000/api/cart/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ shippingAddress: formData }),
            });
            const data = await res.json();
            
            if (res.ok) {
                alert('Purchase successful!');
                navigate('/profile');
            } else {
                throw new Error(data.error || 'Checkout failed');
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-black via-blue-950 to-cyan-700 min-h-screen flex flex-col">
            <Navbar />
            <div className="container mx-auto text-white p-4 flex-grow flex items-center justify-center">
                <div className="bg-black bg-opacity-60 p-8 rounded-lg shadow-lg w-full max-w-md">
                    <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Billing Information</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                        <input type="text" name="address" placeholder="Street Address" onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                        <input type="text" name="city" placeholder="City" onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                        <div className="flex gap-4">
                            <input type="text" name="state" placeholder="State / Province" onChange={handleChange} className="w-1/2 px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                            <input type="text" name="zipCode" placeholder="ZIP / Postal Code" onChange={handleChange} className="w-1/2 px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"/>
                        </div>
                        <select name="country" value={formData.country} onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                            <option value="Canada">Canada</option>
                        </select>
                        
                        {error && <p className="text-red-400 text-center">{error}</p>}

                        <button type="submit" disabled={loading} className="w-full bg-cyan-400 text-black py-3 rounded-lg font-semibold hover:bg-cyan-300 transition disabled:opacity-50">
                            {loading ? 'Processing...' : 'Confirm Purchase'}
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default BillingAddress; 