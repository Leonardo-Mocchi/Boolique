import React, { useRef, useEffect } from "react";
import "./Slider.css";

const Slider = ({ children }) => {
    const rowRef = useRef(null);

    const slide = (direction) => {
        if (rowRef.current) {
            const firstCard = rowRef.current.children[0];
            const cardWidth = firstCard?.offsetWidth || 0;
            const gap = 16; // 1rem gap
            const scrollAmount = cardWidth + gap;

            const scrollTo = direction === "left"
                ? rowRef.current.scrollLeft - scrollAmount
                : rowRef.current.scrollLeft + scrollAmount;

            rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    useEffect(() => {
        const rowElement = rowRef.current;
        if (rowElement) {
            const handleTouchStart = () => { };
            rowElement.addEventListener("touchstart", handleTouchStart, { passive: true });
            return () => {
                rowElement.removeEventListener("touchstart", handleTouchStart);
            };
        }
    }, []);

    return (
        <div className="slider-container">
            <button className="slider-button left " onClick={() => slide("left")}>
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="slider-content" ref={rowRef}>
                {children}
            </div>
            <button className="slider-button right" onClick={() => slide("right")}>
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Slider;
