import './Story-site.css';

export default function StorySite() {
    return (
        <div className="main-container">
            <div className="story-container">
                <div className="story-content">
                    <h2 className="story-title">Our Story</h2>
                    <p className="story-subtitle">
                        Essential elegance, artisanal roots, contemporary vision.
                    </p>

                    <hr className="story-divider" />

                    <div className="story-block">
                        <p>
                            <strong>Boolique</strong> was born from the ambition to reinterpret contemporary elegance with an essential vision,
                            attention to detail, and deeply rooted in the value of craftsmanship.
                        </p>
                        <p>
                            Founded by a team of creatives and artisans with experience in the fashion world, the brand aims to combine
                            tailoring quality, stylistic research, and material awareness to offer garments that last over time, respecting
                            the body and personal style of those who wear them.
                        </p>
                        <p>
                            Each collection is the result of careful design and limited production, because for us, luxury is made of
                            thoughtful choices, not quantity. We believe that authenticity and simplicity are today the true symbols of refinement.
                        </p>
                        <p>
                            <strong>Boolique</strong> is a space for those seeking more than just a garment: a visual identity that reflects
                            deep values, with coherence and discretion.
                        </p>
                    </div>

                    <blockquote className="story-quote">
                        "Elegance is not about being noticed, but about being remembered."
                        <footer className="quote-author">
                            — Giorgio Armani
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
}
