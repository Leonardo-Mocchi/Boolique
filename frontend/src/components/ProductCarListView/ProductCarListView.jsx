import React from "react";
import { Link } from "react-router-dom";
import "./ProductCardListView.css";

const ProductCardListView = ({ name, description, price, image, slug, discount }) => {

    const discountedPrice = discount ? price - (price * discount / 100) : price;
    const numericPrice = Number(price);

    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };

    return (
        <div className="product-list-card">
            <div className="product-image ">
                <img
                    src={image}
                    alt={name}
                />                {discount > 0 && (
                    <span className="discount-badge">-{Math.round(discount)}%</span>
                )}
            </div>
            <div className="product-details">
                <h4 className="product-name">{name}</h4>
                <p className="product-description">{description}</p>
                {discount > 0 ? (
                    <>
                        <div className="d-flex ">
                            <span className="original-price text-decoration-line-through text-secondary">
                                €{formatPrice(numericPrice)}</span>
                            <span className="discounted-price ps-3">
                                €{formatPrice(discountedPrice)}
                            </span>

                        </div>
                    </>
                ) : (
                    <div>€{formatPrice(numericPrice)}</div>
                )}
                <div>

                    <Link to={`/product/${slug}`} className="product-button">
                        Details
                        <i className="fa-solid fa-arrow-right"></i>

                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCardListView;
