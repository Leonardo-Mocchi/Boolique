import { Link } from 'react-router-dom';
import { useGlobal } from '../contexts/GlobalContext';
import './Wishlist.css'; // Create this file for custom styles
import { useEffect, useState } from 'react';

export default function Wishlist() {
    const { wishlistItems, toggleWishlist, setIsInWishlistPage } = useGlobal();
    const [removedItems, setRemovedItems] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')

    useEffect(() => {
        // Aggiorna la lista di ID dei prodotti nella wishlist
        setIsInWishlistPage(wishlistItems.map(item => {
            return item.product_id || item.id
        }));
    }, [wishlistItems, setIsInWishlistPage])

    const handleRemoveWishList = (item) => {
        // Aggiungi l'id alla lista degli elementi rimossi (per effetti UI)
        setRemovedItems(prev => [...prev, item.id]);

        // Rimuovi dalla wishlist usando toggleWishlist dal contesto
        toggleWishlist(item);

        // Se l'utente è autenticato, rimuovi anche dal backend
        if (user?.id && token) {
            const itemId = item.product_id || item.id;

            fetch(`http://localhost:3000/api/v1/wishlist/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data.message || data.error);
                })
                .catch(err => {
                    console.error("Error removing from wishlist:", err);
                });
        }
    }











    return (
        <div className="container py-5">
            <h2 className="mb-4">My Wishlist</h2>

            {wishlistItems.length === 0 ? (
                <div className="text-center">
                    <p>Your wishlist is empty</p>
                    <Link to="/search" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            ) : (<div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-2">
                {wishlistItems?.map((item) => (
                    <div key={item.id} className="col">
                        <div className={`card h-100 wishlist-card ${removedItems.includes(item.id) ? 'fadeOut' : ''}`}>
                            <div className="wishlist-img-container">
                                <img
                                    src={item.selectedImage || `http://localhost:3000/imgs/${item.images[0].url}`}
                                    className="card-img-top wishlist-img"
                                    alt={item.name}
                                />
                            </div>
                            <div className="card-body">
                                <h5 className="card-title text-truncate">{item.name}</h5>

                                <p className="card-text ">€ {item.price}</p>
                                <div className="d-flex justify-content-between align-items-center">
                                    <Link
                                        to={`/product/${item.slug}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        View Details
                                    </Link>
                                    <button
                                        className="btn wishlist-btn in-wishlist"
                                        onClick={() => handleRemoveWishList(item)}
                                        aria-label="Remove from wishlist"
                                    >
                                        <i className="bi bi-heart-fill"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            )}
        </div>
    );
}