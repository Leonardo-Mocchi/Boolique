import { useState } from 'react'
import styles from './searchbar.module.css'
import { useNavigate, useSearchParams } from 'react-router-dom'

const SearchBar = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    const handleOpen = () => setIsOpen(true)

    const handleSearch = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const searchQuery = e.target.value.trim()
            // Cambia 'query' in 'q' per matchare i parametri permessi
            navigate(`/search?q=${searchQuery}`)
            setIsOpen(false)
        }
    }

    return (
        <div className={styles.search} onClick={handleOpen}>
            {!isOpen ? (
                <i className='fa-solid fa-magnifying-glass'></i>
            ) : (
                <input
                    className="form-control p-1 p-sm-2 ps-3 ps-sm-3 rounded-pill"
                    type="search"
                    placeholder="Cerca..."
                    aria-label="Search"
                    defaultValue={searchParams.get('q') || ''}
                    onKeyUp={handleSearch}
                />
            )}
        </div>
    )
}

export default SearchBar