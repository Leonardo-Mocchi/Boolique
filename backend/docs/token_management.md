# Gestione Token di Autenticazione

Questo sistema implementa una gestione avanzata dei token di autenticazione con verifica continua tra frontend e backend.

## Caratteristiche

- I token JWT vengono salvati in una tabella `user_tokens` nel database
- Ogni token ha una data di scadenza e un flag per revocare il token
- Il backend verifica ad ogni richiesta autenticata che il token sia valido e non revocato
- Il frontend verifica periodicamente la validità del token

## Installazione

1. Esegui lo script per creare la tabella dei token:

   ```bash
   node scripts/create_token_table.js
   ```

2. Riavvia il server backend:

   ```bash
   node server.js
   ```

## Come funziona

1. **Login**:
   - Quando un utente effettua il login, viene creato un token JWT
   - Il token viene salvato nel database con la data di scadenza
   - Il token viene restituito al frontend

2. **Verifica del token**:
   - Ad ogni richiesta autenticata, il middleware verifica che:
     - Il token JWT sia valido (firma corretta e non scaduto)
     - Il token sia presente nel database
     - Il token non sia stato revocato
     - La data di scadenza non sia passata

3. **Logout**:
   - Quando un utente effettua il logout, il token viene revocato nel database
   - Il frontend elimina il token dal localStorage

4. **Verifica periodica**:
   - Il frontend verifica periodicamente che il token sia ancora valido
   - Se il token non è più valido, l'utente viene disconnesso automaticamente

## Miglioramenti futuri

- Implementazione di un sistema di refresh token
- Rotazione automatica dei token per maggiore sicurezza
- Pulizia periodica dei token scaduti dal database
