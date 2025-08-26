import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCards from '../components/ProductCard/ProductCard'
import ProductCardListView from '../components/ProductCarListView/ProductCarListView'
import './SearchPage.css'

const AVAILABLE_COLORS = [
    // Metallic Colors
    { value: 'antique-silver', label: 'Antique Silver' },
    { value: 'burnished-silver', label: 'Burnished Silver' },
    { value: 'champagne-gold', label: 'Champagne Gold' },
    { value: 'gold', label: 'Gold/Yellow Gold' },
    { value: 'platinum', label: 'Platinum' },
    { value: 'red-gold', label: 'Red Gold' },
    { value: 'rose-gold', label: 'Rose Gold' },
    { value: 'satin-silver', label: 'Satin Silver' },
    { value: 'silver', label: 'Silver' },
    { value: 'sterling-silver', label: 'Sterling Silver' },
    { value: 'white-gold', label: 'White Gold' },

    // Basic Colors
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'red', label: 'Red' },
    { value: 'berry-red', label: 'Berry Red/Burgundy' },

    // Blues
    { value: 'blue', label: 'Blue' },
    { value: 'teal', label: 'Teal' },

    // Greens
    { value: 'dark-green', label: 'Dark Green' },
    { value: 'emerald-green', label: 'Emerald Green' },
    { value: 'forest-green', label: 'Forest Green' },
    { value: 'green', label: 'Green' },
    { value: 'olive', label: 'Olive' },
    { value: 'sage-green', label: 'Sage Green' },

    // Earth Tones
    { value: 'beige', label: 'Beige' },
    { value: 'brown', label: 'Brown' },
    { value: 'khaki', label: 'Khaki' },
    { value: 'natural-linen', label: 'Natural Linen' },
    { value: 'oatmeal', label: 'Oatmeal' },

    // Purples & Pinks
    { value: 'deep-purple', label: 'Deep Purple' },
    { value: 'lilac', label: 'Lilac' },
    { value: 'pink', label: 'Pink' },
    { value: 'rose-quartz', label: 'Rose Quartz' },

    // Grays & Others
    { value: 'gray', label: 'Gray' },
    { value: 'cream', label: 'Cream' },
    { value: 'mustard', label: 'Mustard' },
    { value: 'rust', label: 'Rust' },
];

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [isGridView, setIsGridView] = useState(true);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);   // Stato per l'accordion dei filtri su mobile
    const filters = {
        category: searchParams.get('category') || '',
        wardrobeSection: searchParams.get('wardrobeSection') || '',
        search: searchParams.get('search') || searchParams.get('q') || '', // Controlla sia 'search' che 'q'
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        color: searchParams.get('color') || '',
        size: searchParams.get('size') || '',
        discounted: searchParams.get('discounted') === 'true',
        inStock: searchParams.get('inStock') === 'true',
        sort: searchParams.get('sort') || '' // Aggiungi il parametro sort
    };

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newSearchParams = new URLSearchParams(searchParams);

        if (type === 'checkbox') {
            if (checked) {
                newSearchParams.set(name, 'true');
            } else {
                newSearchParams.delete(name);
            }
        } else {
            if (value) {
                newSearchParams.set(name, value);
            } else {
                newSearchParams.delete(name);
            }
        }

        setSearchParams(newSearchParams);
    };

    const getImageUrl = (product) => {
        return product.images?.[0]?.url
            ? `http://localhost:3000/imgs/${product.images[0].url}`
            : '';
    };

    useEffect(() => {
        setLoading(true);
        const apiUrl = new URL('http://localhost:3000/api/v1/products/filter');

        // Convert searchParams to URLSearchParams if it isn't already
        const params = new URLSearchParams(searchParams);

        // Se c'è un parametro 'q', copialo come 'search'
        if (params.has('q')) {
            params.set('search', params.get('q'));
            params.delete('q');
        }

        // Aggiungi i parametri all'URL dell'API
        apiUrl.search = params.toString();

        fetch(apiUrl)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error('Data received is not an array');
                }
                setProducts(data);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setProducts([]);
            })
            .finally(() => setLoading(false));
    }, [searchParams]);

    const toggleView = () => {
        setIsGridView(!isGridView);
    }; return (
        <div className="catalogo-container">
            <div className="catalogo-header">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="catalogo-title m-0">
                        {filters.search ? `Results for: "${filters.search}"` : (
                            filters.category ? `${filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}` : 'All products'
                        )}
                    </h2>
                    <div className="d-flex gap-2">
                        <select
                            className="form-select"
                            name="sort"
                            value={filters.sort}
                            onChange={handleFilterChange}
                        >
                            <option value="">Sort by</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Name: A to Z</option>
                            <option value="name_desc">Name: Z to A</option>
                            <option value="new_arrivals">New Arrivals</option>
                        </select>
                        <button className="btn btn-outline-light button-view" onClick={toggleView}>
                            <i className={`bi ${isGridView ? 'bi-grid-3x3-gap' : 'bi-list'}`}></i>
                        </button>
                    </div>
                </div>
            </div>            {/* Mobile Filter Accordion */}            <div className="d-lg-none mb-3">
                <button
                    className="w-100 d-flex justify-content-between align-items-center mobile-filter-button"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    <span>Filters</span>
                    <i className={`bi ${isFilterOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                </button>

                <div className={`collapse ${isFilterOpen ? 'show' : ''}`}>
                    <div className="filter-sidebar p-3 rounded mt-2">                        <div className='d-flex justify-content-between'>
                        <h4 className="mb-3">Filters</h4>
                        <p onClick={() => setSearchParams()} className='text-secondary reset-filters'>Reset filters</p>
                    </div>                        <div className="mb-3 d-flex flex-nowrap align-items-center">
                            <div className="me-2" style={{ width: "25%" }}>
                                <label className="form-label mb-0">Category</label>
                            </div>
                            <div style={{ width: "75%" }}>
                                <select
                                    className="form-select form-select-sm text-black"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    <option value="earrings">Earrings</option>
                                    <option value="bracelets">Bracelets</option>
                                    <option value="necklaces">Necklaces</option>
                                    <option value="jackets">Jackets</option>
                                    <option value="outerwear">Outerwear</option>
                                    <option value="shirts">Shirts</option>
                                    <option value="knits">Knitwear</option>
                                    <option value="trousers">Trousers</option>
                                    <option value="skirts">Skirts</option>
                                    <option value="dresses">Dresses</option>
                                </select>
                            </div>
                        </div>                        <div className="mb-3 d-flex flex-nowrap align-items-center">
                            <div className="me-2" style={{ width: "25%" }}>
                                <label className="form-label mb-0">Min Price</label>
                            </div>
                            <div className="me-2" style={{ width: "25%" }}>
                                <input
                                    type="number"
                                    className="form-control form-control-sm text-black"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    min="0"
                                    step="1"
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                            <div className="me-2" style={{ width: "25%" }}>
                                <label className="form-label mb-0">Max Price</label>
                            </div>
                            <div style={{ width: "25%" }}>
                                <input
                                    type="number"
                                    className="form-control form-control-sm text-black"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    min={filters.minPrice || 0}
                                    step="1"
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>
                        </div>                        <div className="mb-3 d-flex flex-nowrap align-items-center">
                            <div className="me-2" style={{ width: "25%" }}>
                                <label className="form-label mb-0">Color</label>
                            </div>
                            <div className="me-2" style={{ width: "25%" }}>
                                <select
                                    className="form-select form-select-sm text-black"
                                    name="color"
                                    value={filters.color}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Colors</option>
                                    {AVAILABLE_COLORS.map(color => (
                                        <option key={`mobile-${color.value}`} value={color.value}>
                                            {color.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="me-2" style={{ width: "25%" }}>
                                <label className="form-label mb-0">Size</label>
                            </div>
                            <div style={{ width: "25%" }}>
                                <select
                                    className="form-select form-select-sm text-black"
                                    name="size"
                                    value={filters.size}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="discounted"
                                checked={filters.discounted}
                                onChange={handleFilterChange}
                                id="discounted-mobile"
                            />
                            <label className="form-check-label" htmlFor="discounted-mobile">
                                Discounted Products Only
                            </label>
                        </div>                        <div className="mb-3 form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="inStock"
                                checked={filters.inStock}
                                onChange={handleFilterChange}
                                id="inStock-mobile"
                            />
                            <label className="form-check-label" htmlFor="inStock-mobile">
                                In Stock Only
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main scrollable content */}
            <div className="catalogo-content">
                <div className="row g-4">
                    {/* Desktop Filters Sidebar - visibile solo su desktop */}
                    <div className="col-lg-3 d-none d-lg-block ">
                        <div className="filter-sidebar p-3 rounded">
                            <div className='d-flex justify-content-between'>
                                <h4 className="mb-3">Filters</h4>
                                <p onClick={() => setSearchParams()} className='text-secondary' style={{ cursor: 'pointer' }}>Reset filters</p>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-select text-black"
                                    name="category"
                                    value={filters.category}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    <option value="earrings">Earrings</option>
                                    <option value="bracelets">Bracelets</option>
                                    <option value="necklaces">Necklaces</option>
                                    <option value="jackets">Jackets</option>
                                    <option value="outerwear">Outerwear</option>
                                    <option value="shirts">Shirts</option>
                                    <option value="knits">Knitwear</option>
                                    <option value="trousers">Trousers</option>
                                    <option value="skirts">Skirts</option>
                                    <option value="dresses">Dresses</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Minimum Price</label>
                                <input
                                    type="number"
                                    className="form-control text-black"
                                    name="minPrice"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                    min="0"
                                    step="1"
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Maximum Price</label>
                                <input
                                    type="number"
                                    className="form-control text-black"
                                    name="maxPrice"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                    min={filters.minPrice || 0}
                                    step="1"
                                    onKeyDown={(e) => {
                                        if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Color</label>
                                <select
                                    className="form-select text-black"
                                    name="color"
                                    value={filters.color}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Colors</option>
                                    {AVAILABLE_COLORS.map(color => (
                                        <option key={color.value} value={color.value}>
                                            {color.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Size</label>
                                <select
                                    className="form-select text-black"
                                    name="size"
                                    value={filters.size}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                </select>
                            </div>

                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="discounted"
                                    checked={filters.discounted}
                                    onChange={handleFilterChange}
                                    id="discounted"
                                />
                                <label className="form-check-label" htmlFor="discounted">
                                    Discounted Products Only
                                </label>
                            </div>

                            <div className="mb-3 form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    name="inStock"
                                    checked={filters.inStock}
                                    onChange={handleFilterChange}
                                    id="inStock"
                                />
                                <label className="form-check-label" htmlFor="inStock">
                                    In Stock Only
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className={`col-12 col-lg-9`}>
                        {loading ? (
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div className={`row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4  g-4`}>
                                {products.map((product) => (

                                    isGridView ? (<ProductCards
                                        key={product.id}
                                        name={product.name}
                                        description={product.description}
                                        price={product.price}
                                        image={getImageUrl(product)}
                                        slug={product.slug}
                                        {...(product.discount > 0 ? { discount: product.discount } : {})} // Conditionally add the discount prop

                                    />) : (<ProductCardListView
                                        key={`List-${product.id}`}
                                        name={product.name}
                                        description={product.description}
                                        price={product.price}
                                        image={getImageUrl(product)}
                                        slug={product.slug}
                                        {...(product.discount > 0 ? { discount: product.discount } : {})} // Conditionally add the discount prop
                                    />)

                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    )
}


