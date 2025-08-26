const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../database/db');

// Durata del token: 7 giorni
const TOKEN_EXPIRY = '7d';
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 giorni in secondi
const JWT_SECRET = process.env.JWT_SECRET || 'alta_moda_shop_super_secret_key';

/**
 * Registra un nuovo utente
 */
async function register(req, res) {
    const { first_name, last_name, email, password } = req.body;

    // Verifica che i campi obbligatori siano presenti
    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Tutti i campi (nome, cognome, email, password) sono obbligatori'
        });
    }

    try {
        // Controllo se l'email è già in uso
        const [existingUsers] = await connection.promise().query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Email già registrata'
            });
        }

        // Hash della password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Inserimento del nuovo utente
        const [result] = await connection.promise().query(
            `INSERT INTO Users (first_name, last_name, email, password, role)
             VALUES (?, ?, ?, ?, 'customer')`,
            [first_name, last_name, email, hashedPassword]
        );        // Creazione del token JWT
        const token = jwt.sign(
            { user_id: result.insertId, email, role: 'customer' },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Calcoliamo la data di scadenza
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + TOKEN_EXPIRY_SECONDS);

        // Saving the token in database
        try {
            await connection.promise().query(
                'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [result.insertId, token, expiresAt]
            );
        } catch (err) {
            console.error('Errore durante il salvataggio del token:', err);
            // Continuiamo comunque l'esecuzione
        }

        // Risposta con token e informazioni utente
        res.status(201).json({
            success: true,
            message: 'Utente registrato con successo',
            token,
            user: {
                id: result.insertId,
                first_name,
                last_name,
                email,
                role: 'customer'
            }
        });
    } catch (error) {
        console.error('Errore durante la registrazione:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante la registrazione'
        });
    }
}

/**
 * Gestisce il login di un utente
 */
async function login(req, res) {
    const { email, password } = req.body;

    // Verifica che i campi obbligatori siano presenti
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: 'Email e password sono obbligatorie'
        });
    }

    try {
        // Cerca l'utente nel database
        const [users] = await connection.promise().query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenziali non valide'
            });
        }

        const user = users[0];

        // Verifica la password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Credenziali non valide'
            });
        }        // Creazione del token JWT
        const token = jwt.sign(
            { user_id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Calcoliamo la data di scadenza
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + TOKEN_EXPIRY_SECONDS);

        // Salvataggio del token nel database
        try {
            // Prima eliminiamo eventuali token attivi dell'utente
            await connection.promise().query(
                'UPDATE user_tokens SET is_revoked = TRUE WHERE user_id = ? AND is_revoked = FALSE',
                [user.id]
            );

            // Poi inseriamo il nuovo token
            await connection.promise().query(
                'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [user.id, token, expiresAt]
            );
        } catch (err) {
            console.error('Errore durante il salvataggio del token:', err);
            // Continuiamo comunque l'esecuzione
        }

        // Risposta con token e informazioni utente
        res.status(200).json({
            success: true,
            message: 'Login effettuato con successo',
            token,
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Errore durante il login:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il login'
        });
    }
}

/**
 * Ottiene il profilo dell'utente corrente
 */
async function getProfile(req, res) {
    try {
        // L'utente è stato autenticato dal middleware, quindi abbiamo già req.user
        const [users] = await connection.promise().query(
            'SELECT id, first_name, last_name, email, role, address, city, state, postal_code, country, phone FROM Users WHERE id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Utente non trovato'
            });
        }

        const user = users[0];

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Errore durante il recupero del profilo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il recupero del profilo'
        });
    }
}

/**
 * Aggiorna il profilo dell'utente
 */
async function updateProfile(req, res) {
    const { first_name, last_name, address, city, state, postal_code, country, phone } = req.body;

    try {
        // Aggiorna il profilo utente
        await connection.promise().query(
            `UPDATE Users SET 
             first_name = ?, 
             last_name = ?, 
             address = ?, 
             city = ?, 
             state = ?, 
             postal_code = ?, 
             country = ?, 
             phone = ? 
             WHERE id = ?`,
            [first_name, last_name, address, city, state, postal_code, country, phone, req.user.user_id]
        );

        res.status(200).json({
            success: true,
            message: 'Profilo aggiornato con successo'
        });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento del profilo:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante l\'aggiornamento del profilo'
        });
    }
}

/**
 * Cambia la password dell'utente
 */
async function changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({
            success: false,
            error: 'Password corrente e nuova password sono obbligatorie'
        });
    }

    try {
        // Ottiene la password attuale dell'utente
        const [users] = await connection.promise().query(
            'SELECT password FROM Users WHERE id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Utente non trovato'
            });
        }

        const user = users[0];

        // Verifica la password corrente
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Password corrente non valida'
            });
        }

        // Hash della nuova password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Aggiorna la password
        await connection.promise().query(
            'UPDATE Users SET password = ? WHERE id = ?',
            [hashedPassword, req.user.user_id]
        );

        res.status(200).json({
            success: true,
            message: 'Password modificata con successo'
        });
    } catch (error) {
        console.error('Errore durante il cambio della password:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il cambio della password'
        });
    }
}

/**
 * Logout dell'utente (invalida il token)
 */
async function logout(req, res) {
    try {
        // Otteniamo il token dall'header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token non fornito'
            });
        }

        // Invalidiamo il token nel database
        await connection.promise().query(
            'UPDATE user_tokens SET is_revoked = TRUE WHERE token = ?',
            [token]
        );

        res.status(200).json({
            success: true,
            message: 'Logout effettuato con successo'
        });
    } catch (error) {
        console.error('Errore durante il logout:', error);
        res.status(500).json({
            success: false,
            error: 'Errore durante il logout'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
};
