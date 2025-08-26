import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const tokenCheckInterval = useRef(null);

    // Funzione per verificare la validità del token
    const checkTokenValidity = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            setCurrentUser(null);
            return;
        }

        try {
            // Chiamata al backend per verificare il token
            const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                // Se il token non è più valido, effettua il logout
                logout();
            }
        } catch (error) {
            console.error('Errore durante la verifica del token:', error);
        }
    };

    useEffect(() => {
        // Verifica se esiste un utente nel localStorage all'avvio
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (user && token) {
            setCurrentUser(JSON.parse(user));

            // Verifica subito se il token è valido
            checkTokenValidity();

            // Imposta un intervallo per verificare periodicamente la validità del token (ogni 5 minuti)
            tokenCheckInterval.current = setInterval(checkTokenValidity, 5 * 60 * 1000);
        }

        setLoading(false);

        // Cleanup dell'intervallo quando il componente viene smontato
        return () => {
            if (tokenCheckInterval.current) {
                clearInterval(tokenCheckInterval.current);
            }
        };
    }, []);

    // Funzione per il login
    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Si è verificato un errore durante il login');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setCurrentUser(data.user);

            return data;
        } catch (error) {
            throw error;
        }
    };

    // Funzione per la registrazione
    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Si è verificato un errore durante la registrazione');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setCurrentUser(data.user);

            return data;
        } catch (error) {
            throw error;
        }
    };    // Funzione per il logout
    const logout = async () => {
        try {
            const token = localStorage.getItem('token');

            if (token) {
                // Chiamata al backend per invalidare il token
                await fetch('http://localhost:3000/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Errore durante il logout:', error);
        } finally {
            // Anche in caso di errore, rimuoviamo il token dal localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
        }
    };    // Ottieni il profilo utente
    const getProfile = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Utente non autenticato');
            }

            const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Si è verificato un errore nel recupero del profilo');
            }

            // Aggiorniamo i dati dell'utente corrente con quelli dal server
            const updatedUser = { ...currentUser, ...data.user };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            return data.user;
        } catch (error) {
            throw error;
        }
    };

    // Aggiornamento del profilo
    const updateProfile = async (profileData) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Utente non autenticato');
            }

            const response = await fetch('http://localhost:3000/api/v1/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Si è verificato un errore nell\'aggiornamento del profilo');
            }

            // Aggiorna l'utente nel localStorage e nel contesto
            const updatedUser = { ...currentUser, ...profileData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        register,
        logout,
        getProfile,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
