export default function Contacts() {
    return (
        <div className="main-container d-flex align-items-center" style={{ minHeight: '80vh' }}>
            <section className="container ">
                <div className="mx-auto" style={{
                    maxWidth: '800px',
                    minHeight: '50vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {/* Title */}
                    <h2 className="text-center fw-semibold display-6 mb-3" style={{ color: 'black' }}>Contact Us</h2>

                    {/* Subtitle */}
                    <p className="text-center fst-italic" style={{ color: 'black' }}>
                        For information, collaborations, or assistance, our team is at your disposal.
                    </p>

                    {/* Divider */}
                    <hr style={{ width: '60px', borderTop: '2px solid black', margin: "auto" }} />

                    {/* Contacts */}
                    <div className="lh-lg fs-6 text-center" style={{ color: 'black' }}>
                        <p>
                            <strong>Email:</strong> <a href="bulique.noreply@gmail.com" className="text-decoration-underline" style={{ color: 'black' }}>bulique.noreply@gmail.com</a><br />
                            <strong>Phone:</strong> +39 345 678 9012<br />
                            <strong>Address:</strong> Via della Moda 12, 20100 Milan, Italy
                        </p>
                    </div>

                    {/* Social */}
                    <div className="text-center mt-4">
                        <div className="social-links mt-3">
                            <a href="#" className="me-3 facebook">
                                <i className="fab fa-facebook fa-lg" style={{ color: 'black' }}></i>
                            </a>
                            <a href="#" className="me-3 twitter">
                                <i className="fab fa-twitter fa-lg" style={{ color: 'black' }}></i>
                            </a>
                            <a href="#" className="instagram">
                                <i className="fab fa-instagram fa-lg" style={{ color: 'black' }}></i>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
