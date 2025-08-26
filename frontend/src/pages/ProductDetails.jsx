import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ProductDetail.css";
import { useGlobal } from "../contexts/GlobalContext";
import Slider from "../components/Slider/Slider";
import ProductCards from "../components/ProductCard/ProductCard";

const ProductDetails = () => {
    const { slug } = useParams();
    const { cartItems, setCartItems, wishlistItems, toggleWishlist, isInWishlist, setIsInWishlist } = useGlobal()

    const [product, setProduct] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [addToCart, setAddToCart] = useState(false)
    const [showTooltip, setShowTooltip] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    console.log('cart items', cartItems);
    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')
    console.log(wishlistItems);


    useEffect(() => {
        if (!product) return;
        const inWishlist = wishlistItems?.some(item =>
            item.product_id === product.id || item.id === product.id
        );
        setIsInWishlist(inWishlist);
    }, [wishlistItems, product]);



    useEffect(() => {
        fetch(`http://localhost:3000/api/v1/products/${slug}`)
            .then((res) => res.json())
            .then((data) => {
                setProduct(data);
                // Imposta l'immagine corrente con il primo URL dell'array
                if (data.images && data.images.length > 0) {
                    setCurrentImage(`http://localhost:3000/imgs/${data.images[0].url}`);
                }
            })
            .catch((err) => console.error("Error:", err));
    }, [slug]);
    console.log(product);


    useEffect(() => {
        if (product && product.id) {
            // Fetch related products from the same category, excluding current product
            fetch(`http://localhost:3000/api/v1/products/random?exclude=${product.id}&category_id=${product.category_id}&limit=8`)
                .then(res => res.json())
                // Add after the fetch
                .then(data => {
                    console.log("Related products data:", data);
                    setRelatedProducts(data);
                })
                .catch(error => console.error("Error fetching related products:", error));
        }
    }, [product]);


    const thisProductInCart = cartItems.find(item =>
        item?.id === product?.id && item?.variations?.id === selectedVariation?.id
    );


    const handleAddCart = (thisProduct) => {
        const variationIndex = thisProduct.variations.indexOf(selectedVariation)
        const rightVariation = thisProduct.variations[variationIndex]
        const discountedPrice = () => {
            const discount = Number(thisProduct.discount)
            const price = Number(thisProduct.price)
            let discountedPrice;
            if (discount > 0) {
                const newPrice = price - price * discount / 100
                return newPrice

            } else {

                return price
            }
        }


        const existingProduct = cartItems.find(item =>
            item.id === thisProduct.id && item.variations.id === rightVariation.id
        );
        const existingProductIndex = cartItems.indexOf(existingProduct)
        let updatedCart;
        if (existingProduct) {
            updatedCart = [...cartItems]
            updatedCart[existingProductIndex].quantità += 1;
            updatedCart[existingProductIndex].price = discountedPrice()

        } else {
            updatedCart = [...cartItems, { ...thisProduct, quantità: 1, variations: rightVariation, price: discountedPrice() }]
        }
        setCartItems(updatedCart)
        setAddToCart(false); // resetta subito
        setTimeout(() => {
            setAddToCart(true); // ora cambia, quindi lo useEffect si attiva
        }, 0);

    }

    console.log(addToCart);

    const handleRemoveItems = (index) => {
        setCartItems(cartItems.filter((item, idx) => idx !== index));
    };
    console.log(cartItems.indexOf(thisProductInCart), 'index');
    console.log(isInWishlist, 'isInWishlist');


    // Raggruppa le variazioni per colore
    const getUniqueColors = (variations) => {
        const uniqueColors = [];
        variations.forEach(variant => {
            if (!uniqueColors.find(c => c.color === variant.color)) {
                uniqueColors.push({
                    color: variant.color,
                    color_hex: variant.color_hex
                });
            }
        });
        return uniqueColors;
    };

    // Filtra le variazioni per il colore selezionato
    const getVariationsForColor = (variations, color) => {
        return variations.filter(variant => variant.color === color);
    };
    useEffect(() => {
        if (addToCart) {
            setTimeout(() => {
                setAddToCart(false)

            }, 2000);
        }
    }, [addToCart])

    const alredyInCart = () => {
        if (!selectedVariation || !product?.variations) return false;

        const variationIndex = product.variations.indexOf(selectedVariation);
        if (variationIndex === -1) return false;

        const rightVariation = product.variations[variationIndex];
        if (!rightVariation) return false;

        const existingProduct = cartItems.find(item =>
            item?.id === product?.id && item?.variations?.id === rightVariation.id
        );

        return !!existingProduct;
    };

    const handleIncrement = (functionality) => {
        const cartProductIndex = cartItems.findIndex(item =>
            item.id === product.id && item.variations.id === selectedVariation.id
        );

        if (cartProductIndex === -1) return;

        let updatedCart = [...cartItems];
        if (functionality === 'add') {
            updatedCart[cartProductIndex].quantità += 1;
        } else if (functionality === 'minus' && updatedCart[cartProductIndex].quantità > 1) {
            updatedCart[cartProductIndex].quantità -= 1;
        }

        setCartItems(updatedCart);
    };
    const isButtonDisabled = thisProductInCart?.quantità >= selectedVariation?.stock


    const formatPrice = (price) => {
        const num = Number(price);
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };


    if (!product) return <div>Loading...</div>;

    const availableColors = getUniqueColors(product.variations);


    /* useEffect(() => {

        


    }, [wishlistItems]) */
    const handleRemoveWishList = () => {
        const itemId = wishlistItems.find(item => item.product_id === product?.id)?.product_id
        const wishlistProduct = {
            ...product,
            selectedColor,
            selectedVariation,
            selectedImage: currentImage
        };
        toggleWishlist(wishlistProduct)
        if (user?.id && token) {

            fetch(`http://localhost:3000/api/v1/wishlist/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    console.log(data.message || data.error)
                    setIsInWishlist(false)

                }
                )
        }


    }
    console.log('isInWishlist', isInWishlist);






    const handleWishlistAdd = () => {



        const wishlistProduct = {
            ...product,
            selectedColor,
            selectedVariation,
            selectedImage: currentImage
        };

        toggleWishlist(wishlistProduct);

        if (user?.id && token) {
            fetch('http://localhost:3000/api/v1/wishlist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    "productId": wishlistProduct.id
                })

            })
                .then(res => res.json())
                .then(data => setIsInWishlist(true)
                )
        }

    };


    const handleWishlist = () => {
        if (isInWishlist) {
            handleRemoveWishList()
        }
        else {
            handleWishlistAdd()
        }
    }


    // Right before your return statement
    console.log("Product with category:", product);
    console.log("Related products:", relatedProducts);
    return (
        <div className="container">
            <section className="product row position-relative justify-content-center mx-auto">
                {addToCart && (
                    <div className="position-absolute end-0 bottom-0 bg-success p-3 rounded-4">Aggiunto al carrello <span className="ms-2"><i className="fa-solid fa-check"></i></span></div>
                )}

                <div className="product__photo">
                    <div className="photo-container">
                        <div className="photo-main">                            <div className="controls">
                            <div className="wishlist-button-container">
                                <button
                                    className={`btn wishlist-btn ${isInWishlist ? 'in-wishlist' : ''}`}
                                    onClick={handleWishlist}
                                    aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                    <i className={`bi bi-heart${isInWishlist ? '-fill' : ''}`}></i>
                                </button>
                                {showTooltip && (
                                    <div className="wishlist-tooltip">
                                        {!selectedColor
                                            ? 'Please select a color first'
                                            : !selectedVariation
                                                ? 'Please select a size first'
                                                : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                            <img
                                className="img_main"
                                src={currentImage}
                                alt={product.name}
                            />
                        </div>
                        <div className="photo-album">
                            <ul>
                                {product.images.map((image, index) => (
                                    <li key={index} onClick={() => setCurrentImage(`http://localhost:3000/imgs/${image.url}`)}>
                                        <img
                                            src={`http://localhost:3000/imgs/${image.url}`}
                                            alt={`${product.name} view ${index + 1}`}
                                            className={currentImage === `http://localhost:3000/imgs/${image.url}` ? 'active' : ''}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="product__info">
                    <div className="title">
                        <h1>{product.name}</h1>
                    </div>
                    {/* // Replace the current price display with this */}                    <div className="price d-flex align-items-center">
                        {product.discount > 0 ? (
                            <>
                                <span className="original-price">
                                    € {formatPrice(product.price)}
                                </span>
                                <span className="discounted-price">
                                    € {formatPrice(product.price - (product.price * Number(product.discount) / 100))}
                                </span>
                                <span className="discount-badge">
                                    &minus; {formatPrice(product.discount)} %
                                </span>
                            </>
                        ) : (
                            <>€ <span className="ms-2">{formatPrice(product.price)}</span></>
                        )}
                    </div>
                    <div className="variant">
                        <h3>SELECT A COLOR</h3>
                        <ul className="color-list">
                            {availableColors.map((colorOption) => (
                                <li
                                    key={colorOption.color}
                                    className={selectedColor === colorOption.color ? 'active' : ''}
                                    onClick={() => {
                                        setSelectedColor(colorOption.color);
                                        setSelectedVariation(null);
                                    }}
                                >                                        <div
                                        className="color-preview"
                                        style={{ backgroundColor: colorOption.color_hex }}
                                    />
                                    <span>{colorOption.color}</span>
                                </li>
                            ))}
                        </ul>

                        {selectedColor && (
                            <>
                                <h3>SELECT A SIZE</h3>
                                <ul className="size-list">
                                    {getVariationsForColor(product.variations, selectedColor).map((variation) => (
                                        <div key={variation.id}>
                                            <li

                                                className={selectedVariation?.id === variation.id ? 'active' : ''}
                                                onClick={() => setSelectedVariation(variation)}
                                            >
                                                {variation.size}
                                            </li>
                                            {selectedVariation === variation && (

                                                <div className="small text-secondary">{variation.stock > 0 ? `${variation.stock} left` : 'Out of stock'}  </div>
                                            )}

                                        </div>
                                    ))}
                                </ul>
                                <Link to={'/size-table'} className="m-0 text-secondary  small">Size guide </Link>
                            </>
                        )}
                    </div>
                    <div className="description">
                        <h3>DESCRIPTION</h3>
                        <p>{product.description}</p>
                        <p>{product.long_description}</p>

                    </div>
                    {alredyInCart() ? (
                        <div className="quantity-selector">
                            {thisProductInCart?.quantità === 1 ? (
                                <button onClick={() => handleRemoveItems(cartItems.indexOf(thisProductInCart))} className="icon-quantity">
                                    <i className="fa-solid fa-trash"></i>

                                </button>

                            ) : (
                                <button onClick={() => handleIncrement('minus')} className="icon-quantity">
                                    <i className="fa-solid fa-minus"></i>
                                </button>)}

                            <div>{thisProductInCart?.quantità}</div>
                            <button disabled={isButtonDisabled} onClick={() => handleIncrement('add')} className={`icon-quantity ${isButtonDisabled ? 'disabled' : ''}`}>
                                <i className="fa-solid fa-plus"> </i>
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleAddCart(product)}
                            className="buy--btn"
                            disabled={!selectedVariation || selectedVariation.stock === 0}
                        >
                            {!selectedColor ? 'SELECT A COLOR' :
                                !selectedVariation ? 'SELECT A SIZE' :
                                    selectedVariation.stock === 0 ? 'OUT OF STOCK' :
                                        'ADD TO CART'}
                        </button>
                    )}
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="related-products mt-5">
                        <h2 className="text-center mb-4">You May Also Like</h2>
                        <Slider>
                            {relatedProducts.map((product) => (
                                <ProductCards
                                    key={product.id}
                                    name={product.name}
                                    description={product.description}
                                    price={product.price}
                                    image={`http://localhost:3000/imgs/${product.images[0].url}`}
                                    slug={product.slug}
                                    {...(product.discount > 0 ? { discount: product.discount } : {})}
                                />
                            ))}
                        </Slider>
                    </div>
                )}

            </section >
        </div>
    );
};

export default ProductDetails;