import React, { useRef, useState } from 'react'
import './cart.css'
import { Link } from 'react-router'
import { useGlobal } from '../../contexts/GlobalContext'
import { useEffect } from 'react'
const Cart = () => {
    const { products, cartItems, setCartItems, groupedProducts, bottom, randomProducts } = useGlobal()

    const [isOpen, setIsOpen] = useState(false)
    const cartRef = useRef(null)

    const handleClose = () => setIsOpen(false)

    // useEffect per ascoltare i click fuori dalla modale
    useEffect(() => {
        const handleClickOut = (e) => {
            // Se la modale è aperta E il clic NON è dentro la modale
            if (isOpen && cartRef.current && !cartRef.current.contains(e.target)) {
                handleClose(); // Chiudiamo la modale
            }
        };

        document.addEventListener("mousedown", handleClickOut);

        return () => {
            document.removeEventListener("mousedown", handleClickOut);
        };
    }, [isOpen]);


    const toggleCart = () => {
        setIsOpen(!isOpen)
    }
    const handleRemoveItems = (index) => {

        setCartItems(cartItems.filter((item, idx) => idx !== index))
    }
    const handleIncrement = (thisProduct, functionality) => {
        const thisProductIndex = cartItems.indexOf(thisProduct)
        let updatedCart = [...cartItems];
        if (functionality === 'add' && thisProduct.quantità <= thisProduct.variations.stock) {

            updatedCart[thisProductIndex].quantità += 1;
        } else if (functionality === 'minus' && thisProduct.quantità > 1) {
            updatedCart[thisProductIndex].quantità -= 1;


        }
        setCartItems(updatedCart)

    }


    function calculateTotal(items) {
        let total = 0
        items.forEach(item => {
            const thisItemsPrice = item.price * item.quantità


            total += thisItemsPrice;
        })
        return total

    }



    return (
        <div className='cartContainer'>
            {cartItems.length > 0 && (<div className='circle'>{cartItems.length}</div>)}
            <div className='cart' onClick={toggleCart}>
                <i className='fa-solid fa-cart-shopping'></i>
            </div>

            {isOpen && (
                <div ref={cartRef} className='cartPopup'>
                    <div className='cartHeader'>
                        <h3>Your Cart</h3>
                        <button onClick={toggleCart}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className={`cartContent ${cartItems.length > 0 ? '' : 'align-items-center'}`}>
                        {cartItems.length > 0 ? (
                            <div className='cartItems'>
                                {cartItems.map((item, index) => (
                                    <div key={index} className='cartItem'>
                                        <div>
                                            <img className='itemImage' src={`http://localhost:3000/imgs/${item.images[0].url}`} alt={item.name} />
                                        </div>
                                        <div className='cartItemContent'>
                                            <div className='pe-3 d-flex justify-content-between align-items-center'>
                                                <div className='text-danger'>

                                                    {item.name}
                                                </div>
                                                <div>
                                                    {item.price}€
                                                </div>
                                            </div>
                                            <div className='cartInfo flex-wrap mt-2'>
                                                <div className='small'>{item.variations.size} </div>
                                                <div className='small '>{item.variations.color} </div>
                                                <div className='d-flex w-50 align-items-center gap-2 mt-3 h6'>

                                                    <i
                                                        onClick={() => handleIncrement(item, 'minus')}
                                                        className={`fa-solid fa-minus cartIcon ${item.quantità !== 1 ? '' : 'disabled'}`}
                                                    ></i>

                                                    {item.quantità}
                                                    <i
                                                        onClick={() => handleIncrement(item, 'add')}
                                                        className={`fa-solid fa-plus cartIcon ${item.quantità <= item.variations.stock ? '' : 'disabled'} `}
                                                    ></i>

                                                </div>
                                            </div>
                                        </div>
                                        <div onClick={() => handleRemoveItems(index)} ><i className='fa-solid fa-xmark'></i></div>

                                    </div>
                                ))}
                                <div className='total'>
                                    Sub Total : <span>{calculateTotal(cartItems)}€</span>
                                </div>
                            </div>
                        ) : (
                            <p className='emptyCart'>You cart is empty</p>
                        )}
                    </div>

                    <div className='cartFooter'>
                        <Link onClick={toggleCart} to="/carello">Go to your cart <span><i className='fa-solid fa-arrow-right'></i></span></Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart
