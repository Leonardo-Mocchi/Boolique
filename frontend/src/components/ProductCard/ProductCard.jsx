import { Link } from "react-router-dom"; // Import Link for navigation
import "./ProductCards.css";

const ProductCards = ({ name, description, price, image, slug, discount }) => {    /*     { console.log(`Product ${name} - discount:`, discount, typeof discount); } */

    const discountedPrice = discount ? price - (price * discount / 100) : price;
    const numericPrice = Number(price);

    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };

    const formatDiscount = (discount) => {
        const num = Number(discount);
        return Number.isInteger(num) ? num : num.toFixed(0);
    };

    return (

        <div className="col  card-container d-flex justify-content-center align-items-center  ">
            <div className="card custom-card mx-0">                {discount > 0 && (
                <p className="position-absolute discounted-tag rounded-pill bg-warning px-3"><span className="h6">- </span>{formatDiscount(discount)}%</p>
            )}
                <img
                    src={image}
                    alt={name}
                    className="card-imges"
                />
                <div className="card-hover">
                    <div className="card-hover-content ">
                        <h5 className="card-title py-2 ">{name}</h5>
                        <p className="card-description">{description}</p>
                        {discount > 0 ? (
                            <>
                                <div>
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
                        <Link to={`/product/${slug}`} className="btn card-link mt-3">Details</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCards;