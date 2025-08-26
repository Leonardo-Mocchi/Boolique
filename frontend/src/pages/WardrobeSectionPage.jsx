import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGlobal } from '../contexts/GlobalContext'
import ProductCards from "../components/ProductCard/ProductCard"
import Slider from "../components/Slider/Slider"

export default function WardrobeSectionPage() {
    const { slug } = useParams()
    const { wardrobeSections, categoryProducts, fetchWardrobeSections, fetchCategoryProducts } = useGlobal()

    useEffect(() => {
        fetchWardrobeSections()
    }, [])

    const section = wardrobeSections.find(s => s.slug === slug)

    useEffect(() => {
        if (section) {
            section.categories.forEach(category => {
                if (!categoryProducts[category.slug]) {
                    fetchCategoryProducts(category.slug)
                }
            })
        }
    }, [section])

    if (!section) return <div>Loading...</div>

    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">{section.name}</h1>
            {section.categories.map(category => (
                categoryProducts[category.slug]?.length > 0 && (
                    <div key={category.id} className="mb-5">
                        {/* Only show category name if it's different from section name */}
                        {category.name !== section.name && <h2 className="mb-4">{category.name}</h2>}
                        <Slider>
                            {categoryProducts[category.slug].map(product => (
                                <ProductCards
                                    key={product.id}
                                    name={product.name}
                                    description={product.description}
                                    price={product.price}
                                    image={`http://localhost:3000/imgs/${product.images[0].url}`}
                                    slug={product.slug}
                                    {...(product.discount > 0 ? { discount: product.discount.slice(0, -3) } : {})}
                                />
                            ))}
                        </Slider>
                    </div>
                )
            ))}
        </div>
    )
}
