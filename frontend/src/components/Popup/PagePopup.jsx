import { useState, useEffect } from "react";
import './PagePopup.css';

export default function WelcomePopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isFading, setIsFading] = useState(false);    // Function to check if the popup should be shown
    function checkLastVisit() {
        const lastVisit = localStorage.getItem("lastVisitDate");
        const today = new Date().toDateString();
        return !lastVisit || lastVisit !== today;
    }

    useEffect(() => {
        // Show the popup if it's a new day, but after a delay
        if (checkLastVisit()) {
            // Delay showing the popup by 1 second for better user experience
            setTimeout(() => {
                setShowPopup(true);
                localStorage.setItem("lastVisitDate", new Date().toDateString());
            }, 700);
        }
    }, []);

    // Rimuovi la data per far riapparire il popup
    /*  localStorage.removeItem("lastVisitDate"); */
    // Gestione chiusura popup
    function handleClose() {
        setIsFading(true);
        setTimeout(() => {
            setShowPopup(false);
            setIsFading(false);
        }, 750);
    }

    // Gestione form submission
    function handleSubmit(e) {
        e.preventDefault();

        fetch("http://localhost:3000/api/v1/newsletter/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email })
        })
            .then(response => {
                if (!response.ok) {
                    if (response.status === 409) {
                        throw new Error('Email already registered');
                    }
                    throw new Error('Request error');
                }
                return response.json();
            })
            // Modifica il messaggio di successo per includere il link di disiscrizione
            .then(() => {
                setMessage([
                    "Welcome to Boolique's exclusive community.",
                    "Confirmation sent. Subscription details in your inbox."
                ]);
                setTimeout(() => {
                    setIsFading(true);
                    setTimeout(() => {
                        setShowPopup(false);
                        setMessage("");
                        setIsFading(false);
                    }, 750);
                }, 3000);
            })
            .catch(error => {
                console.error('Error:', error);
                setMessage(error.message || "An error occurred during subscription");
            });
    }

    return (
        <>
            {showPopup && (
                <div className={`popup-overlay ${isFading ? 'fading' : ''}`}>
                    <div className={`popup-content card ${isFading ? 'fading' : ''}`}>
                        <button
                            className="popup-close"
                            onClick={handleClose}
                            aria-label="Close"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <div className="popup-grid">
                            <div className="popup-left">
                                <img src="/img/imgpopup.png" alt="Newsletter" className="popup-image" />
                            </div>
                            <div className="popup-right">
                                <div className="card-body text-center" style={{ marginTop: "4rem" }}>
                                    {/* d-flex flex-column justify-content-center mb-3*/}                                    <h2 className="card-title mb-4">Welcome!</h2>
                                    <p className="card-text mb-4">
                                        Subscribe to our newsletter to receive exclusive offers
                                    </p>
                                    {message ? (
                                        <div className="alert alert-success mt-3" role="alert">
                                            {Array.isArray(message) ? (
                                                message.map((line, index) => (
                                                    <p key={index} className={index > 0 ? 'mb-0' : 'mb-2'}>
                                                        {line}
                                                    </p>
                                                ))
                                            ) : message}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="newsletter-form">
                                            <div className="form-floating mb-3">
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    id="emailInput"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email"
                                                    required
                                                />
                                                <label htmlFor="emailInput">Email</label>
                                            </div>
                                            <button type="submit" className="btn button w-100">
                                                {/* here in case we like the logo on the button
                                                  <span className="d-flex align-items-center justify-content-center"><img src="/img/logo.svg" alt="Boolique's Logo" height={30} /> Subscribe</span> */}
                                                Subscribe
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}