// 4. Hero Testo Animato: Split Reveal Typewriter
import React, { useEffect, useState } from "react";
import "./jumbotron.css";

const phrases = [
    "Timeless elegance.",
    "Luxury you can feel.",
    "Reveal your uniqueness."
];

export default function Jumbotron() {
    const [index, setIndex] = useState(0);
    const [display, setDisplay] = useState("");
    const [phase, setPhase] = useState("typing");

    useEffect(() => {
        let timeout;
        if (phase === "typing" && display.length < phrases[index].length) {
            timeout = setTimeout(() => {
                setDisplay(phrases[index].slice(0, display.length + 1));
            }, 70);
        } else if (phase === "typing" && display.length === phrases[index].length) {
            timeout = setTimeout(() => setPhase("pause"), 1200);
        } else if (phase === "pause") {
            timeout = setTimeout(() => setPhase("deleting"), 700);
        } else if (phase === "deleting" && display.length > 0) {
            timeout = setTimeout(() => {
                setDisplay(display.slice(0, -1));
            }, 30);
        } else if (phase === "deleting" && display.length === 0) {
            timeout = setTimeout(() => {
                setIndex((index + 1) % phrases.length);
                setPhase("typing");
            }, 300);
        }
        return () => clearTimeout(timeout);
    }, [display, phase, index]);

    return (
        <section className="hero-text-reveal d-flex align-items-center justify-content-center">
            <div className="hero-text-content text-center">
                <h1 className="split-headline">
                    <span className="luxury-word me-2">DRESS </span>
                    <span className="luxury-word highlight">THE EMOTION</span>
                </h1>
                <div className="typewriter">
                    <span>{display}</span>
                    <span className="caret">|</span>
                </div>
                <a href="/search" className="btn btn-reveal btn-lg mt-4">Discover the Collection</a>
            </div>
        </section>
    );
}