const jwt = require('jsonwebtoken');
const connection = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'alta_moda_shop_super_secret_key';

/**
 * Middleware per verificare il token JWT nelle richieste autenticate
 */
async function authenticateToken(req, res, next) {
    try {
        // Ottiene il token dall'header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // formato: "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token di accesso non fornito'
            });
        }

        let user;
        try {
            // Verifica che il token sia valido a livello di JWT
            user = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
                return res.status(403).json({
                    success: false,
                    error: 'Token non valido o scaduto'
                });
            }
            console.error('Errore durante la verifica del token:', err);
            return res.status(500).json({
                success: false,
                error: 'Errore durante l\'autenticazione'
            });
        }

        // Controlla che user abbia user_id
        if (!user || !user.user_id) {
            return res.status(403).json({
                success: false,
                error: 'Token non valido: user_id mancante'
            });
        }

        // Verifica che il token sia presente e valido nel database
        const [tokenRecords] = await connection.promise().query(
            `SELECT * FROM user_tokens 
            WHERE token = ? 
            AND user_id = ? 
            AND is_revoked = FALSE 
            AND expires_at > NOW()`,
            [token, user.user_id]
        );

        if (tokenRecords.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Token non valido, scaduto o revocato'
            });
        }

        // Se il token è valido, salva le informazioni dell'utente nella richiesta
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        console.error('Errore durante la verifica del token:', err);
        return res.status(500).json({
            success: false,
            error: 'Errore durante l\'autenticazione'
        });
    }
}

/**
 * Middleware per verificare che l'utente sia un amministratore
 */
function isAdmin(req, res, next) {
    // Il middleware authenticateToken deve essere eseguito prima
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: 'Utente non autenticato'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Accesso negato: autorizzazione insufficiente'
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    isAdmin
};
