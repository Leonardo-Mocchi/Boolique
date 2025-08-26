import React, { useState, useEffect } from 'react'
import './checkout.css'
import { useGlobal } from '../../contexts/GlobalContext'
import { useAuth } from '../../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const Checkout = () => {
    const { cartItems, setCartItems } = useGlobal()
    const { currentUser, updateProfile } = useAuth()
    const isAuthenticated = !!currentUser
    const stripe = useStripe()
    const elements = useElements()
    const [clientSecret, setClientSecret] = useState('')
    const [formData, setFormData] = useState({})
    const [formStatus, setFormStatus] = useState(null)
    const [formCheck, setFormCheck] = useState(null)    // Stato per il messaggio di aggiornamento del profilo
    const [updateMessage, setUpdateMessage] = useState('')    // Precompila i dati del form con le informazioni dell'utente loggato
    const [isLoading, setIsLoading] = useState(false)
    const [cartSummary, setCartSummary] = useState([]) // Stato per memorizzare i dati del carrello dal localStorage
    const [isAccordionOpen, setIsAccordionOpen] = useState(false) // Stato per il toggle dell'accordion
    const [cardComplete, setCardComplete] = useState(false) // New state to track card completion
    const [cardError, setCardError] = useState('') // New state to track card errors


    useEffect(() => {
        console.log("Cart items:", cartItems);
        const totalAmount = cartItems.reduce((acc, item) => {
            return acc + item.price * item.quantità;
        }, 0);

        console.log("Total amount:", totalAmount);

        const amountInCents = Math.round(totalAmount * 100);
        console.log("Amount in cents:", amountInCents);

        if (amountInCents > 0) {
            fetch('http://localhost:3000/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: amountInCents }),
            })
                .then(res => res.json())
                .then(data => setClientSecret(data.clientSecret));
        } else {
            console.warn("Amount is zero or invalid, skipping payment intent creation.");
        }
    }, [cartItems]);



    useEffect(() => {
        console.log("CurrentUser:", currentUser);

        if (isAuthenticated && currentUser) {
            setFormData({
                first_name: currentUser.first_name || '',
                last_name: currentUser.last_name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                address: currentUser.address || '',
                city: currentUser.city || '',
                state: currentUser.state || '',
                postal_code: currentUser.postal_code || '',
                country: currentUser.country || ''
            })
        }
    }, [isAuthenticated, currentUser])

    const handleFormData = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }    // Funzione per aggiornare il profilo utente con i dati del checkout
    const handleUpdateProfile = async () => {
        try {
            // Verifica quali campi aggiornare
            const profileData = {}

            // Aggiungi al profileData solo i campi che hanno un valore e che sono diversi da quelli dell'utente
            const fieldsToCheck = ['first_name', 'last_name', 'address', 'city', 'state', 'postal_code', 'country', 'phone']
            fieldsToCheck.forEach(field => {
                if (formData[field] && formData[field] !== currentUser[field]) {
                    profileData[field] = formData[field]
                }
            })

            // Se ci sono campi da aggiornare
            if (Object.keys(profileData).length > 0) {
                await updateProfile(profileData)
                setUpdateMessage('Profile data updated successfully!')

                // Resetta il messaggio dopo 3 secondi
                setTimeout(() => {
                    setUpdateMessage('')
                }, 3000)
            } else {
                setUpdateMessage('No data to update')
                setTimeout(() => {
                    setUpdateMessage('')
                }, 3000)
            }
        } catch (error) {
            setUpdateMessage(`Error during update: ${error.message}`)
            setTimeout(() => {
                setUpdateMessage('')
            }, 3000)
        }
    }
    console.log('Form status', formStatus);


    const itemsForOrder = cartItems.map(item => {
        return {
            "product_id": item.id,
            "product_variation_id": item.variations.id,
            "quantity": item.quantità
            // Removed price field for security
        }
    })

    // Handler for CardElement change events - translate Italian error messages if needed
    const handleCardChange = (event) => {
        setCardComplete(event.complete);

        // Handle error message and translate from Italian if needed
        if (event.error) {
            let errorMessage = event.error.message;

            // Translate common Italian error messages to English if they occur
            if (errorMessage.includes("Il numero della carta è incompleto")) {
                errorMessage = "The card number is incomplete";
            } else if (errorMessage.includes("La data di scadenza è incompleta")) {
                errorMessage = "The expiry date is incomplete";
            } else if (errorMessage.includes("Il codice di sicurezza è incompleto")) {
                errorMessage = "The security code is incomplete";
            } else if (errorMessage.includes("incompleto") || errorMessage.includes("invalido")) {
                errorMessage = "Please check your card information";
            }

            setCardError(errorMessage);
        } else {
            setCardError('');
        }
    };

    // Modify the handleSubmit function to handle form validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check form validity using Bootstrap validation
        if (!e.target.checkValidity()) {
            e.preventDefault();
            e.stopPropagation();
            e.target.classList.add('was-validated');
            return;
        }

        // Check if card details are complete
        if (!cardComplete) {
            setCardError('Please fill in all required card information.');
            return;
        }

        // Continue with existing submission logic
        const requiredFields = ['first_name', 'last_name', 'email', 'address', 'city', 'postal_code', 'country', 'phone', 'state'];
        const missingFields = requiredFields.filter(field => !formData[field]);

        if (missingFields.length > 0) {
            setFormStatus({
                error: `The following fields are required: ${missingFields.join(', ')}`
            });
            return;
        }

        if (!stripe || !elements) {
            setFormStatus({ error: 'Stripe is not ready' });
            return;
        }

        setIsLoading(true)
        const cardElement = elements.getElement(CardElement);
        const paymentResult = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: `${formData.first_name} ${formData.last_name}`,
                    email: formData.email,
                    address: {
                        line1: formData.address,
                        city: formData.city,
                        postal_code: formData.postal_code,
                        country: formData.country,
                    },
                },
            },
        });

        if (paymentResult.error) {
            setFormStatus({ error: paymentResult.error.message })
            setIsLoading(false)
            return;
        }

        if (paymentResult.paymentIntent.status === 'succeeded') {
            console.log('Payment successful');


            // continua con invio ordine come già fai
            const headers = {
                'Content-type': 'application/json',
                ...(isAuthenticated && {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                })
            };

            const customerInfo = {
                ...formData,
                ...(isAuthenticated
                    ? { user_id: currentUser?.id }
                    : {
                        password: Math.random().toString(36).slice(-8),
                        is_guest: true,
                    }),
            };

            fetch('http://localhost:3000/api/v1/orders', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    customer_info: customerInfo,
                    items: itemsForOrder,
                    discount: 0
                }),
            })
                .then(res => res.json())
                .then(data => {
                    setFormStatus(data);
                    setIsLoading(false)
                    if (!data.error) {
                        setCartItems([]);
                        localStorage.setItem('lastOrder', JSON.stringify({
                            order_id: data.order_id,
                            email: formData.email

                        }));
                        setIsLoading(false)
                    }
                })
                .catch(err => {
                    setFormStatus({ error: 'Error during order creation.' });
                    if (isLoading) {
                        setIsLoading(false)
                    }
                });

        }
    };
    console.log('Loading', isLoading);

    // Funzione per calcolare il totale del carrello
    const calculateCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantità), 0).toFixed(2);
    }

    if (cartItems.length === 0 && !formStatus?.message) {
        return (
            <div className="checkout-container my-5 text-center">
                <h3>Your cart is empty</h3>
                <p>Add products to your cart before proceeding to checkout.</p>
                <Link to="/search" className="btn btn-primary">Continue shopping</Link>
            </div>
        )
    }// Carica il carrello da localStorage
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                if (parsedCart && Array.isArray(parsedCart) && parsedCart.length > 0) {
                    setCartSummary(parsedCart);
                    // Se cartItems è vuoto, carica anche lì i dati
                    if (cartItems.length === 0) {
                        setCartItems(parsedCart);
                    }
                }
            }
        } catch (error) {
            console.error('Errore nel caricare il carrello da localStorage:', error);
        }
    }, []);

    useEffect(() => {
        if (formStatus?.order_id) {
            const handleFormCheck = async () => {
                const response = await fetch(`http://localhost:3000/api/v1/orders/${formStatus.order_id}`)
                    .then(res => res.json())
                    .then(data => setFormCheck(data))


            }
            handleFormCheck()
        }
    }, [formStatus])
    return (
        <div className="checkout-container my-5">
            {/* Accordion Cart Summary */}
            {cartItems.length > 0 && (
                <div className="cart-accordion mb-4">
                    <div
                        className="accordion-header"
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                    >
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">
                                <i className="fa-solid fa-shopping-cart me-2"></i>
                                Order Summary ({cartItems.length} items)
                            </h5>
                            <span className="accordion-toggle">
                                <i className={`fa-solid ${isAccordionOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </span>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <span>Total:</span>
                            <strong>{calculateCartTotal()}€</strong>
                        </div>
                    </div>

                    <div className={`accordion-content ${isAccordionOpen ? 'open' : ''}`}>
                        {cartItems.map((item, index) => (
                            <div key={index} className="cart-item-row">
                                <div className="cart-item-details">
                                    <div className="cart-item-title">{item.name}</div>
                                    <div className="cart-item-variant">
                                        <small>Color: {item.variations.color}, Size: {item.variations.size}</small>
                                    </div>
                                </div>
                                <div className="cart-item-price">
                                    <div className="quantity">{item.quantità} x {item.price.toFixed(2)}€</div>
                                    <div className="subtotal">{(item.price * item.quantità).toFixed(2)}€</div>
                                </div>
                            </div>
                        ))}

                        <div className="cart-summary-footer">
                            <div className="d-flex justify-content-between">
                                <span>Subtotal:</span>
                                <span>{calculateCartTotal()}€</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <div className="d-flex justify-content-between total-row">
                                <strong>Total:</strong>
                                <strong>{calculateCartTotal()}€</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isAuthenticated && (
                <div className="mb-4 p-3 border rounded bg-light">
                    <p>Already registered? <Link to="/login?redirect=checkout">Log in</Link> for faster checkout and to save your shipping information.</p>
                </div>
            )}

            <form className="needs-validation" noValidate onSubmit={handleSubmit}>
                <div className={`${!formStatus && !isLoading ? '' : 'd-none'}`}>
                    <h3 className="mb-4">Shipping Information</h3>

                    {/* Required fields notice */}
                    <div className="alert alert-info py-2 mb-4">
                        <i className="fa-solid fa-circle-info me-2"></i>
                        All fields in this form are required
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="first_name" className="form-label">First Name</label>
                            <input
                                onChange={handleFormData}
                                type="text"
                                className="form-control"
                                name="first_name"
                                id="first_name"
                                aria-describedby="firstNameHelp"
                                placeholder="Your first name..."
                                value={formData.first_name || ''}
                                required
                                pattern="[A-Za-z\s]{2,50}"
                            />
                            <div className="invalid-feedback">
                                Please provide your first name (2-50 characters, letters only).
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="last_name" className="form-label">Last Name</label>
                            <input
                                onChange={handleFormData}
                                type="text"
                                className="form-control"
                                name="last_name"
                                id="last_name"
                                aria-describedby="lastNameHelp"
                                placeholder="Your last name..."
                                value={formData.last_name || ''}
                                required
                                pattern="[A-Za-z\s]{2,50}"
                            />
                            <div className="invalid-feedback">
                                Please provide your last name (2-50 characters, letters only).
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="form-label">Payment Information</label>
                        <div className={`p-3 border rounded bg-white ${cardError && 'border-danger'}`}>
                            <CardElement
                                options={{
                                    hidePostalCode: true,
                                    style: {
                                        base: {
                                            fontSize: '16px',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                            },
                                        },
                                    }
                                }}
                                onChange={handleCardChange}
                            />
                            {cardError && (
                                <div className="text-danger mt-2 small">
                                    <i className="fa-solid fa-exclamation-circle me-1"></i>
                                    {cardError}
                                </div>
                            )}
                        </div>
                        <small className="text-muted">All card fields are required</small>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            onChange={handleFormData}
                            type="email"
                            className="form-control"
                            name="email"
                            id="email"
                            aria-describedby="emailHelp"
                            placeholder="example@email.com"
                            value={formData.email || ''}
                            required
                        />
                        <div className="invalid-feedback">
                            Please provide a valid email address.
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="address" className="form-label">Address</label>
                        <input
                            onChange={handleFormData}
                            type="text"
                            className="form-control"
                            name="address"
                            id="address"
                            aria-describedby="addressHelp"
                            placeholder="Your address..."
                            value={formData.address || ''}
                            required
                            minLength="5"
                        />
                        <div className="invalid-feedback">
                            Please provide your address (minimum 5 characters).
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="postal_code" className="form-label">ZIP Code</label>
                            <input
                                onChange={handleFormData}
                                type="text"
                                className="form-control"
                                name="postal_code"
                                id="postal_code"
                                aria-describedby="postalCodeHelp"
                                placeholder="ZIP Code"
                                value={formData.postal_code || ''}
                                required
                                pattern="[0-9A-Za-z\s-]{3,10}"
                            />
                            <div className="invalid-feedback">
                                Please provide a valid ZIP/postal code.
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label">Phone</label>
                            <input
                                onChange={handleFormData}
                                type="tel"
                                className="form-control"
                                name="phone"
                                id="phone"
                                aria-describedby="phoneHelp"
                                placeholder="Enter phone number"
                                value={formData.phone || ''}
                                pattern="[0-9+\s()-]{7,20}"
                                required
                            />
                            <div className="invalid-feedback">
                                Please provide a valid phone number (digits, +, spaces, and parentheses allowed).
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="country" className="form-label">Country</label>
                            <select
                                onChange={handleFormData}
                                className="form-select"
                                name="country"
                                id="country"
                                value={formData.country || ''}
                                required
                            >
                                <option value="" disabled>Select your country</option>
                                <option value="IT">IT</option>
                                <option value="DE">DE</option>
                                <option value="FR">FR</option>
                                <option value="ES">ES</option>
                                <option value="GB">GB</option>
                                <option value="US">US</option>
                            </select>
                            <div className="invalid-feedback">
                                Please select a country.
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="city" className="form-label">City</label>
                            <input
                                onChange={handleFormData}
                                type="text"
                                className="form-control"
                                name="city"
                                id="city"
                                aria-describedby="cityHelp"
                                placeholder="Your city..."
                                value={formData.city || ''}
                                required
                                pattern="[A-Za-z\s-]{2,50}"
                            />
                            <div className="invalid-feedback">
                                Please provide a valid city name.
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="state" className="form-label">State/Province</label>
                        <input
                            onChange={handleFormData}
                            type="text"
                            className="form-control"
                            name="state"
                            id="state"
                            aria-describedby="stateHelp"
                            placeholder="Enter state or province"
                            value={formData.state || ''}
                            pattern="[A-Za-z\s-]{2,50}"
                            required
                        />
                        <div className="invalid-feedback">
                            Please provide a valid state/province (letters, spaces and hyphens only).
                        </div>
                    </div>

                    {isAuthenticated && (
                        <div className="mt-3 mb-4 text-center">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={handleUpdateProfile}
                            >
                                <i className="fa-solid fa-user me-2"></i>
                                Save this information to your profile
                            </button>
                            {updateMessage && (
                                <div className="alert mt-2 p-2 alert-success">
                                    {updateMessage}
                                </div>
                            )}
                        </div>
                    )}

                    <div className='w-100 d-flex justify-content-between'>
                        <Link to="/carello" className="btn btn-outline-secondary">
                            <i className="fa-solid fa-arrow-left me-2"></i>
                            Back to cart
                        </Link>

                        <button
                            disabled={isLoading}
                            className='form-button'
                            type="submit"
                        >
                            Confirm order
                            <div className='icon-button'>
                                <i className='fa-solid fa-arrow-right'></i>
                            </div>
                        </button>
                    </div>
                </div>
                {formStatus ? (
                    <div className={`${formStatus.error ? 'bg-danger' : 'bg-success'}  m-auto p-5 text-center text-white h5 position-relative`}>
                        {formStatus.error ? (
                            <>
                                <div onClick={() => setFormStatus(null)} className="position-absolute start-0 top-0 p-3 text-white">
                                    <i className='fa-solid fa-arrow-left'></i>
                                </div>
                                <p className="h4">{formStatus.error.replace("Errore durante la creazione dell'ordine.", "Error during order creation.")}</p>
                            </>
                        ) : (
                            <>

                                <div>

                                    <i className="fa-solid fa-check-circle fs-1 mb-3"></i>
                                    <p className='h4'>{formStatus.message}</p>
                                    {formCheck?.id && (
                                        <div className="text-start mt-5 bg-white text-dark rounded-2 p-4">
                                            <h5 className="mb-3">🧾 Order Summary #{formCheck.numeric_id}</h5>
                                            <p><strong>Name:</strong> {formCheck.first_name} {formCheck.last_name}</p>
                                            <p><strong>Email:</strong> {formCheck.email}</p>
                                            <p><strong>Phone:</strong> {formCheck.phone}</p>
                                            <p><strong>Address:</strong> {formCheck.address}, {formCheck.postal_code}, {formCheck.city}, {formCheck.state}, {formCheck.country}</p>
                                            <hr />
                                            <h6 className="mt-3 mb-2">📦 Products</h6>
                                            <ul className="list-unstyled">
                                                {formCheck.items.map((item, index) => (
                                                    <li key={index} className="mb-2">
                                                        <strong>{item.product_name}</strong> - {item.quantity} × {item.price}€ <br />
                                                        <small>Variant: {item.color}, Size: {item.size}</small>
                                                    </li>
                                                ))}
                                            </ul>
                                            <hr />
                                            <p><strong>Total:</strong> {formCheck.total}€</p>
                                            {parseFloat(formCheck.discount) > 0 && (
                                                <p><strong>Discount:</strong> {formCheck.discount}€</p>
                                            )}
                                            <p><strong>Order status:</strong> {formCheck.status}</p>
                                        </div>
                                    )}
                                </div>

                            </>
                        )}
                    </div>
                ) : isLoading ? (
                    <div className="loader-container">
                        <div className="spinner "></div>
                        <p className='text-center d-block'>We are processing your order...</p>
                    </div>

                ) : (
                    <>
                    </>
                )}
            </form>
        </div>
    )


}

export default Checkout
