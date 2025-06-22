import React from 'react';
import { FaTimes } from 'react-icons/fa';

function PurchaseDetailModal({ purchase, onClose }) {
    if (!purchase) return null;

    const { itemId: item, count, totalPrice, date, shippingAddress } = purchase;
    const sellerName = item.creatorId ? `${item.creatorId.firstName} ${item.creatorId.lastName || ''}`.trim() : 'N/A';
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-gradient-to-r from-gray-900 via-blue-950 to-gray-900 text-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <FaTimes size={24} />
                </button>
                <h2 className="text-2xl font-bold text-cyan-400 mb-4">Purchase Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column: Item Info */}
                    <div>
                        <img src={item.image.url} alt={item.name} className="w-full h-48 object-cover rounded-lg mb-4"/>
                        <h3 className="text-xl font-semibold text-cyan-300">{item.name}</h3>
                        <p className="text-gray-400">Sold by: {sellerName}</p>
                    </div>

                    {/* Right Column: Purchase & Shipping Info */}
                    <div>
                        <div className="bg-black bg-opacity-40 rounded-lg p-4 space-y-3">
                            <p><strong>Purchase Date:</strong> {new Date(date).toLocaleString()}</p>
                            <p><strong>Quantity:</strong> {count}</p>
                            <p><strong>Total Price:</strong> ₹{totalPrice.toFixed(2)}</p>
                            <div>
                                <h4 className="font-bold mt-2">Shipping Address:</h4>
                                <p>{shippingAddress.fullName}</p>
                                <p>{shippingAddress.address}</p>
                                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
                                <p>{shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PurchaseDetailModal;

 