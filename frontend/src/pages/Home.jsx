import Jumbotron from "../components/jumbotron/jumbotron";
import CategoryCards from "../components/CategoryCards/CategoryCards";
import { useGlobal } from "../contexts/GlobalContext";
import { Link } from "react-router";
import Slider from "../components/Slider/Slider";
import ProductCards from "../components/ProductCard/ProductCard";
import PagePopup from '../components/Popup/PagePopup'

// Add custom CSS for responsive titles
const responsiveHeadingStyle = {
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    lineHeight: '1.2',
    textAlign: 'center',
    margin: '2rem 0',
    padding: '0 1rem'
};

export default function Home() {
    const {
        bestSellers, discount
    } = useGlobal()
    console.log(bestSellers, "bestSellers");

    return (
        <div className="">
            <PagePopup />

            <div className="main">
                <Jumbotron />
                <h1 className="home_title" style={responsiveHeadingStyle}>
                    Discover timeless elegance: where style meets the art of haute couture.
                </h1>
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 pt-5 mt-5">
                    <Link to={`/wardrobe-section/accessories`}> {/* changed from /macroarea */}
                        <CategoryCards
                            title="Accessories"
                            image="./img/accessories.jpg"
                        />
                    </Link>
                    <Link to={`/wardrobe-section/tops-and-coats`}> {/* changed from /macroarea/upper-body */}
                        <CategoryCards
                            title="Tops&coats"
                            image="./img/top.jpg"
                        />
                    </Link>
                    <Link to={`/wardrobe-section/skirts-and-trousers`}> {/* changed from /macroarea/lower-body */}
                        <CategoryCards
                            title="Skirts
                            &
                            trousers"
                            image="./img/trousers.jpg"
                        />
                    </Link>
                    <Link to={`/wardrobe-section/dresses`}> {/* changed from /macroarea/dress */}
                        <CategoryCards
                            title="Dresses"
                            image="./img/dress.jpg"
                        />
                    </Link>
                </div>
                <h1 className="home_title" style={responsiveHeadingStyle}>Discover our collection</h1>
                <h1 className="home_title fs-4 fs-md-3 fs-lg-1 p-0 m-0" style={responsiveHeadingStyle}>Best Sellers</h1>

                <Slider>
                    {bestSellers.map((product) => (
                        <ProductCards
                            key={product.id}
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            image={`http://localhost:3000/imgs/${product.images[0].url}`}
                            slug={product.slug}
                            {...(product.discount > 0 ? { discount: product.discount.slice(0, -3) } : {})} // Conditionally add the discount prop

                        />
                    ))}
                </Slider>

                <h1 className="home_title fs-4 fs-md-3 fs-lg-1 p-0 m-0" style={responsiveHeadingStyle}>Exclusive Offers</h1>

                <Slider>
                    {discount.map((product) => (
                        <ProductCards
                            key={product.id}
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            image={`http://localhost:3000/imgs/${product.images[0].url}`}
                            slug={product.slug}
                            {...(product.discount > 0 ? { discount: product.discount.slice(0, -3) } : {})} // Conditionally add the discount prop

                        />
                    ))}
                </Slider>
            </div>
        </div>
    );
}