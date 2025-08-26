const connection = require("../database/db");
const sendEmail = require("../utils/sendEmail");
const { isValidEmail, isPositiveInteger, isValidLength, isValidPhone } = require('../utils/validation');

// Add the new utility instead of the encoder
const { generateNumericId, extractDatabaseId } = require("../utils/numericIdGenerator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET || 'alta_moda_shop_super_secret_key';

// Funzione di utilità per generare una password casuale
function generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
}

// Create a new order
async function createOrder(req, res) {
    const {
        customer_info,
        items,
        discount = 0
    } = req.body;

    // Validation errors array
    const errors = [];

    // Validate customer info
    if (!customer_info) {
        return res.status(400).json({ error: 'Customer information is required' });
    }

    const { first_name, last_name, email, phone, address, city, state, postal_code, country, is_guest } = customer_info;

    if (!email) errors.push('Email is required');
    else if (!isValidEmail(email)) errors.push('Invalid email format');

    if (!first_name) errors.push('First name is required');
    else if (!isValidLength(first_name, 2, 50)) errors.push('First name must be between 2-50 characters');

    if (!last_name) errors.push('Last name is required');
    else if (!isValidLength(last_name, 2, 50)) errors.push('Last name must be between 2-50 characters');

    if (!address) errors.push('Address is required');
    if (!city) errors.push('City is required');
    if (!postal_code) errors.push('Postal code is required');
    if (!country) errors.push('Country is required');
    if (phone && !isValidPhone(phone)) {
        errors.push('Invalid phone number format');
    }
    if (state && !isValidLength(state, 1, 50)) {
        errors.push('State must be between 1-50 characters');
    }
    if (is_guest !== undefined && typeof is_guest !== 'boolean') {
        errors.push('is_guest must be a boolean value');
    }

    // Validate items array
    if (!items || !Array.isArray(items)) {
        errors.push('Items must be an array');
    } else if (items.length === 0) {
        errors.push('Order must contain at least one item');
    } else {
        items.forEach((item, index) => {
            if (!item.product_id) {
                errors.push(`Item ${index}: Product ID is required`);
            } else if (!isPositiveInteger(item.product_id)) {
                errors.push(`Item ${index}: Product ID must be a positive integer`);
            }

            if (!item.quantity) {
                errors.push(`Item ${index}: Quantity is required`);
            } else if (!isPositiveInteger(item.quantity)) {
                errors.push(`Item ${index}: Quantity must be a positive integer`);
            }
        });
    }

    // Validate discount
    if (discount && (!Number.isFinite(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
        errors.push('Discount must be a number between 0 and 100');
    }

    // Return all validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    // Calculate total (sum of item.price * item.quantity), applying product-level discounts
    let total = 0;
    const itemsWithDiscount = await Promise.all(items.map(async item => {
        // Fetch product price and discount from DB instead of relying on frontend input
        const [rows] = await connection.promise().query(
            'SELECT price, discount FROM Products WHERE id = ?',
            [item.product_id]
        );

        if (!rows || rows.length === 0) {
            throw new Error(`Product with ID ${item.product_id} not found`);
        }

        const productPrice = parseFloat(rows[0].price);
        const productDiscount = rows[0]?.discount || 0;
        const quantity = parseInt(item.quantity);
        const discountedPrice = productDiscount > 0 ? productPrice - (productPrice * productDiscount / 100) : productPrice;
        total += discountedPrice * quantity;
        return {
            ...item,
            price: productPrice,
            discountedPrice
        };
    }));
    // Calculate discount as a percentage (order-level)
    const discountAmount = total * (parseFloat(discount) / 100);
    // Calculate delivery: free if total >= 500, else 30
    const deliveryValue = total >= 500 ? '0' : '30'; // Ensure it's a string to match ENUM
    // Calculate final price
    const final_price = total - discountAmount + parseInt(deliveryValue);
    // Calculate IVA (22%) from the total (which already includes it)
    const ivaAmount = Number((total - (total / 1.22)).toFixed(2));

    // Check if token was provided to identify already logged in users
    const authHeader = req.headers['authorization'];
    let user_id = null; if (authHeader && !is_guest) {
        try {
            const token = authHeader.split(' ')[1];
            // Properly decode the JWT token to get user information
            const decoded = jwt.verify(token, JWT_SECRET);

            if (decoded && decoded.user_id) {
                user_id = decoded.user_id;                // Verify that this user exists and get their data
                const [userRows] = await connection.promise().query(
                    'SELECT id, email, first_name, last_name, phone, address, city, state, postal_code, country FROM Users WHERE id = ?',
                    [user_id]
                );

                if (userRows.length === 0) {
                    // User not found - proceed as guest
                    user_id = null;
                } else {
                    // Se l'email nell'ordine non corrisponde all'utente, usa quella dell'utente
                    if (userRows[0].email !== email) {
                        // Sovrascrive i dati dell'ordine con i dati utente se è stato trovato
                        const userData = userRows[0];
                        // Aggiorna i dati del cliente con quelli dell'utente loggato se non sono stati forniti
                        if (userData.first_name) first_name = first_name || userData.first_name;
                        if (userData.last_name) last_name = last_name || userData.last_name;
                        if (userData.email) email = userData.email; // Usa sempre l'email dell'utente loggato
                        if (userData.phone) phone = phone || userData.phone;
                        if (userData.address) address = address || userData.address;
                        if (userData.city) city = city || userData.city;
                        if (userData.state) state = state || userData.state;
                        if (userData.postal_code) postal_code = postal_code || userData.postal_code;
                        if (userData.country) country = country || userData.country;
                    }
                }
            }
        } catch (err) {
            console.error("Error validating user token:", err);
            // Continue with guest process if token validation fails
            user_id = null;
        }
    }

    // Try to find user by email if token validation failed
    if (!user_id && email) {
        try {
            const [userRows] = await connection.promise().query(
                'SELECT id FROM Users WHERE email = ?',
                [email]
            );

            if (userRows.length > 0) {
                user_id = userRows[0].id;
            }
        } catch (err) {
            console.error("Error finding user by email:", err);
        }
    }    // If we have an authenticated user, proceed directly to order creation
    if (user_id) {
        createOrderForUser(user_id);
    } else {
        // Altrimenti crea un nuovo utente con password casuale
        const password = customer_info.password || generateRandomPassword();

        // Hash della password
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) return res.status(500).json({ error: 'Errore nella generazione della password: ' + err.message });            // Crea nuovo utente con la password hashata
            const userSql = `
                INSERT INTO Users (
                    first_name, last_name, email, phone, 
                    address, city, state, postal_code, country, password, role
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '${is_guest ? 'guest' : 'customer'}')
            `;

            connection.query(
                userSql,
                [first_name, last_name, email, phone, address, city, state, postal_code, country, hashedPassword],
                (err, userResults) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            const uniqueEmail = `${email}_${Date.now()}`;

                            const uniqueUserSql = `
                                INSERT INTO Users (
                                    first_name, last_name, email, phone, 
                                    address, city, state, postal_code, country, password, role
                                )
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '${is_guest ? 'guest' : 'customer'}')
                            `;
                            connection.query(
                                uniqueUserSql,
                                [first_name, last_name, uniqueEmail, phone, address, city, state, postal_code, country, hashedPassword],
                                (err, results) => {
                                    if (err) return res.status(500).json({ error: err.message });
                                    createOrderForUser(results.insertId);
                                }
                            );
                        } else {
                            return res.status(500).json({ error: err.message });
                        }
                    } else {
                        createOrderForUser(userResults.insertId);
                    }
                }
            );
        });
    }

    function createOrderForUser(user_id) {
        connection.beginTransaction(async (err) => {
            if (err) return res.status(500).json({ error: err.message });

            try {
                // Insert the order with the user ID
                const [orderResults] = await connection.promise().query(
                    `INSERT INTO Orders (user_id, status, delivery, total, discount, final_price)
                VALUES (?, 'Completed', ?, ?, ?, ?)`,
                    [user_id, deliveryValue, total, discount, final_price]
                );

                const order_id = orderResults.insertId;

                // Then insert all order items
                const orderItemsValues = itemsWithDiscount.map(item => [
                    order_id,
                    item.product_id,
                    item.product_variation_id || null,
                    item.quantity,
                    item.discountedPrice
                ]);

                await connection.promise().query(
                    `INSERT INTO Order_Items (order_id, product_id, product_variation_id, quantity, price)
                VALUES ?`,
                    [orderItemsValues]
                );

                // Update stock levels for each product variation
                for (const item of itemsWithDiscount) {
                    if (item.product_variation_id) {
                        const [updateResult] = await connection.promise().query(
                            'UPDATE Product_Variations SET stock = stock - ? WHERE id = ? AND stock >= ?',
                            [item.quantity, item.product_variation_id, item.quantity]
                        );

                        // Check if the update was successful (stock was sufficient)
                        if (updateResult.affectedRows === 0) {
                            throw new Error(`Insufficient stock for product variation ${item.product_variation_id}`);
                        }
                    }
                }

                // Commit the transaction after all operations succeed
                await connection.promise().query('COMMIT');

                try {
                    // Generate a numeric customer-facing ID
                    const numericOrderId = generateNumericId(order_id);

                    // Fetch product names for the email
                    const productIds = items.map(item => item.product_id);
                    const [productRows] = await connection.promise().query(
                        'SELECT id, name FROM Products WHERE id IN (?)',
                        [productIds]
                    );

                    // Create a map of product id to name
                    const productMap = {};
                    productRows.forEach(product => {
                        productMap[product.id] = product.name;
                    });

                    // Fetch variation details for each item
                    const variationDetails = {};
                    for (const item of items) {
                        if (item.product_variation_id) {
                            const [variationRows] = await connection.promise().query(
                                'SELECT color, size FROM Product_Variations WHERE id = ?',
                                [item.product_variation_id]
                            );
                            if (variationRows.length > 0) {
                                variationDetails[item.product_variation_id] = variationRows[0];
                            }
                        }
                    }

                    // Prepare items summary for emails
                    const itemsSummary = itemsWithDiscount
                        .map(item => {
                            // Get variation details if available
                            const variation = item.product_variation_id ? variationDetails[item.product_variation_id] : null;
                            const variationText = variation ?
                                `<div style="font-size: 12px; color: #666; margin-top: 3px;">Color: ${variation.color}, Size: ${variation.size}</div>` : '';

                            return `<tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                                    ${item.quantity}x ${productMap[item.product_id] || `Prodotto #${item.product_id}`}
                                    ${variationText}
                                </td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${item.discountedPrice.toFixed(2)}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.discountedPrice * item.quantity).toFixed(2)}</td>
                            </tr>`;
                        }).join('');

                    // Email al cliente
                    await sendEmail(
                        email,
                        `Order Confirmation #${numericOrderId} - Boolean Shop`,
                        `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px; padding: 20px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f8f9fa; border-radius: 4px;">
                                <h1 style="color: #333; margin: 0;">Order Confirmation</h1>
                                <p style="font-size: 18px; color: #666; margin: 5px 0 0 0;">Order #${numericOrderId}</p>
                            </div>
                            
                            <div style="margin-bottom: 30px;">
                                <h2 style="color: #444; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Dear ${first_name} ${last_name},</h2>
                                <p style="color: #555; font-size: 16px;">Thank you for your order! We're processing it right away and will notify you when it ships.</p>
                            </div>
                            
                            <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin-bottom: 25px;">
                                <h3 style="color: #444; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                                    <thead>
                                        <tr style="background-color: #f0f0f0;">
                                            <th style="padding: 10px; text-align: left;">Item</th>
                                            <th style="padding: 10px; text-align: right;">Unit Price</th>
                                            <th style="padding: 10px; text-align: right;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsSummary}
                                    </tbody>
                                </table>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Subtotal:</td>
                                        <td style="padding: 5px; text-align: right; width: 100px;">€${total.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">IVA included (22%):</td>
                                        <td style="padding: 5px; text-align: right;">€${ivaAmount.toFixed(2)}</td>
                                    </tr>
                                    ${discount > 0 ? `
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Discount (${discount}%):</td>
                                        <td style="padding: 5px; text-align: right; color: #c00;">-€${discountAmount.toFixed(2)}</td>
                                    </tr>` : ''}
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Shipping:</td>
                                        <td style="padding: 5px; text-align: right;">€${deliveryValue}</td>
                                    </tr>
                                    <tr style="font-weight: bold; font-size: 16px;">
                                        <td style="padding: 10px 5px; text-align: right; border-top: 2px solid #eee;">Total:</td>
                                        <td style="padding: 10px 5px; text-align: right; border-top: 2px solid #eee;">€${final_price.toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="margin-bottom: 25px;">
                                <h3 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Address</h3>
                                <p style="color: #555; margin-left: 15px;">
                                    ${address}<br>
                                    ${postal_code} ${city}<br>
                                    ${state}, ${country}
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0 20px;">
                                <a href="http://localhost:5173/track-order?email=${email}&order=${numericOrderId}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Track Your Order</a>
                            </div>
                            
                            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 14px;">
                                <p>Best regards,<br>
                                The Boolean Shop Team</p>
                                <p style="font-size: 12px; color: #999; margin-top: 20px;">© ${new Date().getFullYear()} Boolean Shop. All rights reserved.</p>
                            </div>
                        </div>`
                    );

                    // Email al venditore/admin
                    await sendEmail(
                        process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                        `New Order #${numericOrderId}`,
                        `<div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px; padding: 20px; background-color: #ffffff;">
                            <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f0f7ff; border-radius: 4px;">
                                <h2 style="color: #0066cc; margin: 0;">New Order Received</h2>
                                <p style="font-size: 18px; color: #666; margin: 5px 0 0 0;">Order #${numericOrderId} (DB ID: ${order_id})</p>
                            </div>
                            
                            <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin-bottom: 25px;">
                                <h3 style="color: #444; margin-top: 0;">Customer Information</h3>
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px; width: 120px; color: #666;"><strong>Name:</strong></td>
                                        <td style="padding: 8px;">${first_name} ${last_name}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #666;"><strong>Email:</strong></td>
                                        <td style="padding: 8px;"><a href="mailto:${email}" style="color: #0066cc; text-decoration: none;">${email}</a></td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px; color: #666;"><strong>Phone:</strong></td>
                                        <td style="padding: 8px;">${phone}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="background-color: #f9f9f9; border-radius: 4px; padding: 15px; margin-bottom: 25px;">
                                <h3 style="color: #444; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Details</h3>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                                    <thead>
                                        <tr style="background-color: #f0f0f0;">
                                            <th style="padding: 10px; text-align: left;">Item</th>
                                            <th style="padding: 10px; text-align: right;">Unit Price</th>
                                            <th style="padding: 10px; text-align: right;">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${itemsSummary}
                                    </tbody>
                                </table>
                                
                                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Subtotal:</td>
                                        <td style="padding: 5px; text-align: right; width: 100px;">€${total.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                    <td style="padding: 5px; text-align: right;">IVA included (22%):</td>
                                    <td style="padding: 5px; text-align: right;">€${ivaAmount.toFixed(2)}</td>
                                </tr>
                                    ${discount > 0 ? `
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Discount (${discount}%):</td>
                                        <td style="padding: 5px; text-align: right; color: #c00;">-€${discountAmount.toFixed(2)}</td>
                                    </tr>` : ''}
                                    <tr>
                                        <td style="padding: 5px; text-align: right;">Shipping:</td>
                                        <td style="padding: 5px; text-align: right;">€${deliveryValue}</td>
                                    </tr>
                                    <tr style="font-weight: bold; font-size: 16px;">
                                        <td style="padding: 10px 5px; text-align: right; border-top: 2px solid #eee;">Total:</td>
                                        <td style="padding: 10px 5px; text-align: right; border-top: 2px solid #eee;">€${final_price.toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <div style="margin-bottom: 25px;">
                                <h3 style="color: #444; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Address</h3>
                                <p style="color: #555; margin-left: 15px;">
                                    ${address}<br>
                                    ${postal_code} ${city}<br>
                                    ${state}, ${country}
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0 20px;">
                                <a href="http://localhost:5173/admin/orders/${order_id}" style="background-color: #0066cc; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Manage This Order</a>
                            </div>
                        </div>`
                    );

                    // Return the created order with numericOrderId
                    res.status(201).json({
                        message: 'Ordine creato con successo',
                        order_id: numericOrderId,
                        tracking_email: email
                    });
                } catch (emailError) {
                    console.error('Errore invio email:', emailError);
                    res.status(201).json({
                        message: 'Ordine creato ma invio email fallito',
                        order_id: order_id,
                        tracking_email: email
                    });
                }

            } catch (error) {
                // If any error occurs, rollback the transaction
                await connection.promise().query('ROLLBACK');
                return res.status(400).json({ error: error.message });
            }
        })
    };  // Added the missing closing parenthesis here
}

// Get order by ID
function getOrderById(req, res) {
    let { id } = req.params;

    // Check if it's a numeric customer-facing ID (larger than typical DB IDs)
    if (id > 1000000) {
        id = extractDatabaseId(parseInt(id));
    }

    const sql = `
        SELECT 
            o.*,
            u.first_name, u.last_name, u.email, u.phone,
            u.address, u.city, u.state, u.postal_code, u.country,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'product_name', p.name,
                    'product_variation_id', oi.product_variation_id,
                    'color', pv.color,
                    'size', pv.size,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            ) AS items
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        JOIN Order_Items oi ON o.id = oi.order_id
        JOIN Products p ON oi.product_id = p.id
        LEFT JOIN Product_Variations pv ON oi.product_variation_id = pv.id
        WHERE o.id = ?
        GROUP BY o.id
    `; connection.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Order not found' });

        // Add the customer-facing numeric ID to the response for consistency
        const response = results[0];
        response.numeric_id = generateNumericId(response.id);

        res.json(response);
    });
}

// Track order - update to work with numeric IDs
function trackOrder(req, res) {
    let { email, order_id } = req.body;

    if (!email || !order_id) {
        return res.status(400).json({ error: 'Email and order ID are required for tracking' });
    }

    // Check if it's a numeric customer-facing ID (larger than typical DB IDs)
    if (order_id > 1000000) {
        order_id = extractDatabaseId(order_id);
    }

    const sql = `
        SELECT 
            o.id,
            o.status,
            o.total,
            o.discount,
            o.final_price,
            o.created_at,
            o.updated_at,
            u.email,
            u.first_name,
            u.last_name
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        WHERE o.id = ? AND (u.email = ? OR u.email LIKE ?)
    `;

    // Search for both exact email and email_timestamp pattern
    const emailPattern = `${email}\\_%`; connection.query(sql, [order_id, email, emailPattern], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Order not found or email does not match' });

        // Encode the ID in the response for consistency
        const response = results[0];
        response.encoded_id = generateNumericId(response.id);

        res.json(response);
    });
}

// Update order status
function updateOrderStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be one of: Pending, Processing, Completed, Cancelled' });
    }

    const sql = `
        UPDATE Orders
        SET status = ?
        WHERE id = ?
    `;

    connection.query(sql, [status, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ error: 'Order not found' });

        res.json({ message: `Order status updated successfully to ${status}` });
    });
}




async function getUserOrders(req, res) {
    try {
        const { userId } = req.params;

        // Verifica che l'utente autenticato stia richiedendo i propri ordini
        // Il token JWT contiene user_id invece di id
        if (req.user.user_id != userId) {
            return res.status(403).json({
                success: false,
                error: 'Non sei autorizzato a visualizzare gli ordini di un altro utente'
            });
        }

        // Query per ottenere gli ordini con il conteggio degli articoli per ogni ordine
        const [orders] = await connection.promise().query(`
            SELECT 
                o.id AS order_id,
                o.status,
                o.delivery,
                o.total,
                o.discount,
                o.final_price,
                o.created_at AS order_date,
                COUNT(oi.id) AS total_items
            FROM 
                Orders o
            JOIN 
                Order_Items oi ON o.id = oi.order_id
            WHERE 
                o.user_id = ?
            GROUP BY 
                o.id, o.status, o.delivery, o.total, o.discount, o.final_price, o.created_at
            ORDER BY 
                o.created_at DESC
        `, [userId]);

        // Aggiunta degli ID numerici per mostrare agli utenti
        const formattedOrders = orders.map(order => ({
            ...order,
            numeric_id: generateNumericId(order.order_id)
        }));

        // Risposta con successo
        res.status(200).json({
            success: true,
            count: formattedOrders.length,
            orders: formattedOrders
        });

    } catch (err) {
        console.error('Errore durante il recupero degli ordini:', err);
        res.status(500).json({
            success: false,
            error: 'Errore durante il recupero degli ordini'
        });
    }
}

// Funzione per ottenere i dettagli completi di un singolo ordine
async function getOrderDetails(req, res) {
    try {
        const { orderId } = req.params;
        const userId = req.user.user_id;

        // Prima verifichiamo che l'ordine appartenga all'utente
        const [orderCheck] = await connection.promise().query(
            'SELECT id FROM Orders WHERE id = ? AND user_id = ?',
            [orderId, userId]
        );

        if (orderCheck.length === 0) {
            return res.status(403).json({
                success: false,
                error: 'Non sei autorizzato a visualizzare questo ordine'
            });
        }

        // Query per ottenere i dettagli dell'ordine
        const [orderDetails] = await connection.promise().query(`
            SELECT 
                o.id AS order_id,
                o.status,
                o.delivery,
                o.total,
                o.discount,
                o.final_price,
                o.created_at AS order_date
            FROM 
                Orders o
            WHERE 
                o.id = ?
        `, [orderId]);

        if (orderDetails.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Ordine non trovato'
            });
        }

        // Aggiungere l'ID numerico
        orderDetails[0].numeric_id = generateNumericId(orderDetails[0].order_id);

        // Query per ottenere gli elementi dell'ordine con dettagli dei prodotti
        const [orderItems] = await connection.promise().query(`
            SELECT 
                oi.id,
                oi.price,
                oi.quantity,
                p.id AS product_id,
                p.name AS product_name,
                p.image AS product_image,
                pv.color,
                pv.size
            FROM 
                Order_Items oi
            JOIN 
                Products p ON oi.product_id = p.id
            LEFT JOIN 
                Product_Variations pv ON oi.variation_id = pv.id
            WHERE 
                oi.order_id = ?
        `, [orderId]);

        // Unire i dettagli dell'ordine con gli elementi
        const fullOrderDetails = {
            ...orderDetails[0],
            items: orderItems
        };

        // Risposta con successo
        res.status(200).json({
            success: true,
            order: fullOrderDetails
        });

    } catch (err) {
        console.error('Errore durante il recupero dei dettagli dell\'ordine:', err);
        res.status(500).json({
            success: false,
            error: 'Errore durante il recupero dei dettagli dell\'ordine'
        });
    }
}

// Get orders by email
function getOrdersByEmail(req, res) {
    const { email } = req.params;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    const sql = `
        SELECT 
            o.id,
            o.status,
            o.total,
            o.discount,
            o.delivery,
            o.final_price,
            o.created_at,
            o.updated_at,
            u.email,
            u.first_name,
            u.last_name,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'product_name', p.name,
                    'product_variation_id', oi.product_variation_id,
                    'quantity', oi.quantity,
                    'price', oi.price
                )
            ) AS items
        FROM Orders o
        JOIN Users u ON o.user_id = u.id
        JOIN Order_Items oi ON o.id = oi.order_id
        JOIN Products p ON oi.product_id = p.id
        WHERE u.email = ? OR u.email LIKE ?
        GROUP BY o.id
        ORDER BY o.created_at DESC
    `;

    // Search for both exact email and email_timestamp pattern
    const emailPattern = `${email}\\_%`;

    connection.query(sql, [email, emailPattern], (err, results) => {
        if (err) {
            console.error('Error retrieving orders:', err);
            return res.status(500).json({
                success: false,
                error: 'Error retrieving orders'
            });
        }

        // Format the results for each order
        const formattedResults = results.map(order => {
            // If items is a string (can happen with JSON_ARRAYAGG), convert to array
            let items = order.items;
            if (typeof items === 'string') {
                try {
                    items = JSON.parse(items);
                } catch {
                    items = [];
                }
            }

            return {
                ...order,
                items
            };
        });

        res.status(200).json({
            success: true,
            count: formattedResults.length,
            orders: formattedResults
        });
    });
}

module.exports = {
    createOrder,
    getOrderById,
    trackOrder,
    updateOrderStatus,
    getOrdersByEmail,
    getUserOrders,
};
