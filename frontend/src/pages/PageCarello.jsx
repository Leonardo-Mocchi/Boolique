import React from "react";
import { useGlobal } from "../contexts/GlobalContext";
import { Link } from "react-router-dom";
import './pageCarrello.css'

const Cart = () => {
    const { cartItems, setCartItems } = useGlobal();

    const subtotal = calculateSubTotal(cartItems);
    // Correctly extract the 22% IVA from price that already includes it
    const ivaAmount = Number((subtotal - (subtotal / 1.22)).toFixed(2));
    const shipPrice = subtotal >= 500 ? 0 : 30;

    // Format a number to display as currency (with comma as decimal separator)
    const formatCurrency = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };

    const handleRemoveItems = (index) => {
        setCartItems(cartItems.filter((item, idx) => idx !== index));
    };

    function calculateSubTotal(items) {
        let total = 0;
        items.forEach(item => {
            const thisItemsPrice = item.price * item.quantità;
            total += thisItemsPrice;
        });
        // WARNING: This is a frontend calculation only. 
        // Final prices are recalculated server-side for security.
        // A malicious user could modify prices in browser dev tools.
        return total;
    }

    function calculateTotal() {
        return calculateSubTotal(cartItems) + shipPrice;
    }

    const handleIncrement = (thisProduct, functionality) => {
        const thisProductIndex = cartItems.indexOf(thisProduct);
        let updatedCart = [...cartItems];
        if (functionality === 'add') {
            updatedCart[thisProductIndex].quantità += 1;
        } else if (functionality === 'minus' && thisProduct.quantità > 1) {
            updatedCart[thisProductIndex].quantità -= 1;
        }
        setCartItems(updatedCart);
    };

    const calculateOriginalPrice = (item, discountedPrice, discountPercentage, quantity) => {
        if (Number(item.discount) > 0) {
            const discountFactor = 1 - discountPercentage / 100;
            const originalPrice = (discountedPrice / discountFactor) * quantity;
            return formatCurrency(originalPrice);
        }
    };

    console.log('Cart Items', cartItems);

    return (
        <div className="main-container cart-wrapper">
            <div className="container py-4">
                <div className="row">
                    {/* Products column */}
                    <div className="col-lg-8">
                        <h4>Item</h4>
                        <hr />
                        {cartItems.map((item, index) => (
                            <div key={`${item.id}-${item.variations.id}-${index}`} className="d-flex gap-3 mb-4 border-bottom pb-3 cart-product">
                                <div>
                                    <img src={`http://localhost:3000/imgs/${item.images[0].url}`} alt={item.name} className=" product-image" />
                                    <div className="quantity-selector">
                                        {item.quantità === 1 ? (
                                            <button onClick={() => handleRemoveItems(index)} className="icon-quantity">
                                                <i className="fa-solid fa-trash"></i>

                                            </button>

                                        ) : (
                                            <button onClick={() => handleIncrement(item, 'minus')} className="icon-quantity">
                                                <i className="fa-solid fa-minus"></i>
                                            </button>)}

                                        <div>{item.quantità}</div>
                                        <button disabled={item.quantità === item.variations.stock} onClick={() => handleIncrement(item, 'add')} className="icon-quantity">
                                            <i className="fa-solid fa-plus"> </i>
                                        </button>
                                    </div>

                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between flex-column-reverse flex-sm-row">

                                        <strong className="text-danger">{item.name}</strong>
                                        <div>

                                            {item.discount > 0 && (
                                                <small className="text-secondary text-decoration-line-through me-2">
                                                    {calculateOriginalPrice(item, Number(item.price), Number(item.discount), Number(item.quantità))} €
                                                </small>
                                            )}
                                            <strong>{formatCurrency(item.price * item.quantità)} €</strong>
                                        </div>

                                    </div>
                                    <div className=" mt-2 d-flex flex-column gap-3">
                                        <div className="text-secondary small">{item.description}</div>
                                        <div className="text-secondary small">{item.variations.size}</div>
                                        <div className="text-secondary small d-flex gap-2">
                                            <div>
                                                {item.variations.color}
                                            </div>
                                            <div style={{ backgroundColor: item.variations.color_hex }} className="circle-color">

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary column */}
                    <div className="col-lg-4">
                        <div className=" rounded p-4 summary-column">
                            <h4 className="text-center">Summary</h4>
                            <p className="d-flex w-100 justify-content-between">
                                <span>Subtotal</span> {formatCurrency(subtotal)} €
                            </p>
                            <p className="d-flex w-100 justify-content-between">
                                <span>IVA included</span> {formatCurrency(ivaAmount)} €
                            </p>
                            <p className="d-flex w-100 justify-content-between">
                                <span>Shipping</span> {formatCurrency(shipPrice)} €
                            </p>
                            {shipPrice === 0 ? (
                                <p className="text-success">Shipping is FREE!</p>
                            ) : (
                                <p className="text-secondary small">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Spend {cartItems.length > 0 ? (`${formatCurrency(500 - subtotal)} € more `) : (`at least ${formatCurrency(500)}`)}  to get free shipping.
                                </p>
                            )}
                            <hr />
                            {cartItems.length > 0 && (
                                <div>
                                    <h5><strong>Order total: {formatCurrency(calculateTotal())} €</strong></h5>
                                    <button
                                        disabled={cartItems.length === 0}
                                        className="btn btn-success w-100 mt-3 cta-button">
                                        <Link className="text-decoration-none text-white" to={'/checkout'}>
                                            Proceed to Checkout
                                        </Link>
                                    </button>
                                </div>

                            )}
                        </div>
                    </div>
                </div>
            </div >
        </div >);
};

export default Cart;
