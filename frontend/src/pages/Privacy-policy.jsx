export default function PrivacyPolicy() {
    return (
        <div className="main-container">
            <section className="container py-5">
                <div className="policy">
                    {/* Title */}
                    <h2 className="text-center fw-semibold display-6 mb-3">Privacy Policy</h2>
                    <p className="text-center fst-italic text-black mb-4">
                        Transparency is part of our elegance. The following policy describes how we handle your data with respect and responsibility.
                    </p>

                    {/* Paragraphs */}
                    <div className="lh-lg fs-6 text-black">
                        <h5 className="mt-5 fw-bold">1. Introduction</h5>
                        <p>
                            Boolean is committed to protecting the privacy of its users in compliance with Regulation (EU) 2016/679 (“GDPR”).
                            Personal data is processed with care, confidentiality, and only for specific and legitimate purposes.
                        </p>

                        <h5 className="mt-4 fw-bold">2. Data Controller</h5>
                        <p>
                            The data controller is Boolean S.r.l., with its registered office at Via della Moda 12, Milan. You can contact us at
                            <a href="mailto:privacy@boolean.com" className="text-decoration-underline text-black"> privacy@boolean.com</a>.
                        </p>

                        <h5 className="mt-4 fw-bold">3. What Data We Collect</h5>
                        <ul>
                            <li>Identification data (name, surname, email, phone number - all required for order processing)</li>
                            <li>Data necessary for shipping and billing</li>
                            <li>Browsing data collected through technical and analytical cookies</li>
                        </ul>

                        <h5 className="mt-4 fw-bold">4. Purpose of Data Processing</h5>
                        <p>Your data is processed to:</p>
                        <ul>
                            <li>Manage orders and deliveries</li>
                            <li>Provide assistance and support</li>
                            <li>Send updates and promotional communications (only with prior consent)</li>
                            <li>Analyze site usage in aggregate form to improve its quality</li>
                        </ul>

                        <h5 className="mt-4 fw-bold">5. Data Retention</h5>
                        <p>
                            Personal data is retained only for the time necessary to provide the service or comply with legal obligations.
                            Data for promotional purposes is retained until consent is withdrawn.
                        </p>

                        <h5 className="mt-4 fw-bold">6. Your Rights</h5>
                        <p>
                            You can request at any time: access, rectification, deletion, objection, or restriction of processing.
                            You also have the right to data portability. Requests should be sent to <a href="mailto:privacy@boolean.com" className="text-decoration-underline text-black">privacy@boolean.com</a>.
                        </p>

                        <h5 className="mt-4 fw-bold">7. Minors</h5>
                        <p>
                            Our services are not intended for users under the age of 16, and we do not knowingly collect data from minors.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
