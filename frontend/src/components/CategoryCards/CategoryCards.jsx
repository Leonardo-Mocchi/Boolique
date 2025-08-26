import React from "react";
import "./CategoryCards.css";

const CategoryCards = ({ image, title, onClick }) => {

    return (
        <div onClick={onClick} className="col col_category p-1 ">

            <div className="card border-0  ">
                <img src={image} className="card-img" alt={title} />
                <div className="card-img-overlay   d-flex flex-column justify-content-center align-items-center">
                    <h1 className="card-title text-center " >{title}</h1>
                </div>
            </div>
        </div>
    );

};

export default CategoryCards;