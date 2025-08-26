# Boolean High Fashion E-commerce API Documentation

This document provides comprehensive information about all available API endpoints for the Boolean haute couture e-commerce platform.

## Base URL

All API requests should be made to: `http://localhost:3000/api/v1/`

## Authentication Routes

### Register New User

`POST /auth/register`
Register a new user account.

**Request body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "user@example.com",
  "password": "secure_password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Utente registrato con successo",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Login

`POST /auth/login`
Authenticate a user and receive access token.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "secure_password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login effettuato con successo",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Get User Profile

`GET /auth/profile`
Get the profile of the currently authenticated user.

**Headers:**

```plaintext
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "user@example.com",
    "role": "customer",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "USA",
    "phone": "123-456-7890"
  }
}
```

### Update User Profile

`PUT /auth/profile`
Update the profile of the currently authenticated user.

**Headers:**

```plaintext
Authorization: Bearer jwt_token_here
```

**Request body:**

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "phone": "123-456-7890"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Profilo aggiornato con successo"
}
```

### Change Password

`PUT /auth/change-password`
Update the password of the currently authenticated user.

**Headers:**

```plaintext
Authorization: Bearer jwt_token_here
```

**Request body:**

```json
{
  "currentPassword": "secure_password123",
  "newPassword": "new_password456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password modificata con successo"
}
```

### Logout

`POST /auth/logout`
Log out the currently authenticated user.

**Headers:**

```plaintext
Authorization: Bearer jwt_token_here
```

**Response:**

```json
{
  "success": true,
  "message": "Logout effettuato con successo"
}
```

## Wardrobe Section Routes

### Get All Wardrobe Sections

`GET /wardrobe-sections`
Returns all wardrobe sections with their categories.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Tops & Coats",
    "slug": "tops-and-coats",
    "description": "Elegant tops and coats for all occasions",
    "categories": [
      {
        "id": 1,
        "name": "Shirts",
        "slug": "shirts",
        "description": "High fashion shirts"
      },
      {
        "id": 2,
        "name": "Blouses",
        "slug": "blouses",
        "description": "Elegant blouses"
      }
    ]
  }
]
```

### Get Categories by Wardrobe Section

`GET /wardrobe-sections/:slug/categories`
Returns all categories for a given wardrobe section (by slug).

**Response:**

```json
[
  {
    "id": 1,
    "name": "Shirts",
    "slug": "shirts",
    "description": "High fashion shirts",
    "wardrobe_section_id": 1,
    "wardrobe_section_name": "Tops & Coats",
    "wardrobe_section_slug": "tops-and-coats"
  }
]
```

### Get Products by Wardrobe Section

`GET /wardrobe-sections/:slug/products`
Returns all products for a given wardrobe section (by slug).

## Category Routes

### Get All Categories

`GET /categories`
Returns a flat list of all categories (with macroarea info).

**Response:**

```json
[
  {
    "id": 1,
    "name": "Shirts",
    "slug": "shirts",
    "description": "High fashion shirts",
    "wardrobe_section_id": 1
  }
]
```

### Get Products by Category

`GET /categories/:slug`
Returns all products for a given category (by slug).

## Product Routes

### Get All Products

`GET /products`
Returns all products.

### Get Random Products

`GET /products/random`
Returns a random selection of products. Useful for related products on product detail pages.

**Query Parameters:**

- `exclude` (optional): ID of a product to exclude (useful for related products)
- `category_id` (optional): Filter by category ID to get products from the same category
- `limit` (optional): Maximum number of products to return (default: 10)

**Example:**
`GET /products/random?exclude=1&category_id=5&limit=4`

Returns up to 4 random products from category ID 5, excluding the product with ID 1.

**Response:**

```json
[
  {
    "id": 8,
    "slug": "cashmere-cardigan",
    "name": "Cashmere Cardigan",
    "description": "Luxurious cashmere cardigan",
    "long_description": "Detailed description...",
    "price": 299.99,
    "discount": 0,
    "created_at": "2023-05-15T10:00:00Z",
    "images": [
      {
        "url": "/images/cashmere-cardigan-1.jpg",
        "view_type": "front",
        "is_primary": true,
        "product_variation_id": 24
      }
    ]
  }
  // Additional random products...
]
```

### Get Discounted Products

`GET /products/discounted`
Returns all products with discount > 0.

### Get Bestseller Products

`GET /products/bestsellers`
Returns the top bestselling products.

### Get Product by Slug

`GET /products/:slug`
Returns details of a specific product by its slug.

### Check Product Availability

`POST /products/check-availability`
Check if products are available in requested quantities.

**Request body:**

```json
{
  "items": [
    {
      "product_variation_id": 1,
      "quantity": 2
    },
    {
      "product_variation_id": 5,
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "allAvailable": true,
  "items": [
    {
      "product_variation_id": 1,
      "available": true,
      "requested": 2
    },
    {
      "product_variation_id": 5,
      "available": true,
      "requested": 1
    }
  ]
}
```

### Get Color-Specific Product Images

`GET /products/product-images/:productId`
Get color-specific images for a product.

### Get All Product Images

`GET /products/images/:productId`
Get all images for a specific product.

### Dynamic Product Filtering (RECOMMENDED)

`GET /products/filter?...`
Returns products filtered by any combination of supported query parameters. This endpoint replaces all previous static product listing, searching, and filtering routes.

#### Supported Filters

- `wardrobe_section`: Filter by wardrobe section slug (e.g. `wardrobe_section=tops-and-coats`)
- `category`: Filter by category slug (e.g. `category=knits`)
- `color`: Filter by product color (e.g. `color=Cream`)
- `size`: Filter by product size (e.g. `size=M`)
- `discounted`: Only show discounted products (`discounted=true`)
- `inStock`: Only show products in stock (`inStock=true`)
- `available`: Only show products that have at least one variation in stock (`available=true`)
- `search`: Search by product name or description (e.g. `search=alpaca`)
- `minPrice`: Minimum price (e.g. `minPrice=100`)
- `maxPrice`: Maximum price (e.g. `maxPrice=500`)

#### Ordering

- `sort=price_asc`: Order by price ascending
- `sort=price_desc`: Order by price descending
- `sort=discount_asc`: Order by discount ascending
- `sort=discount_desc`: Order by discount descending
- `sort=newest`: Order by creation date, newest first
- `sort=oldest`: Order by creation date, oldest first

#### Limiting

- `limit`: Limit the number of results (e.g. `limit=10`)

**Example:**

`GET /products/filter?wardrobe_section=tops-and-coats&color=Cream&discounted=true&sort=price_desc&limit=5`

> This endpoint replaces all previous static product listing, searching, and filtering routes.

## Order Management Routes

### Create a New Order

`POST /orders`
Create a new order.

**Request body:**

```json
{
  "customer_info": {
    "first_name": "Mario",
    "last_name": "Rossi",
    "email": "customer@example.com",
    "phone": "+39 123 456 7890",
    "address": "Via Roma 123",
    "city": "Milano",
    "state": "MI",
    "postal_code": "20100",
    "country": "Italy",
    "is_guest": false,
    "notes": "Please leave with doorman"
  },
  "items": [
    {
      "product_id": 5,
      "product_variation_id": 12,
      "quantity": 2
    }
  ],
  "discount": 10,
  "payment_method": "credit_card",
  "shipping_method": "standard"
}
```

**Note:**

- `customer_info.email` is required.
- Product prices are automatically fetched from the database for security.
- `total` is calculated server-side as the sum of all item prices (price × quantity), **with each product's discount (if any) automatically applied**.
- `discount` is a percentage (e.g. 10 for 10% off the subtotal after product discounts).
- `delivery` is calculated automatically by the backend: it is 30 by default, but free if the order total is at least 500.
- **Product-level discounts are always applied first, then the order-level discount is applied to the subtotal.**

**Response:**

```json
{
  "message": "Ordine creato con successo",
  "order_id": 98000001,
  "tracking_email": "customer@example.com"
}
```

### Get Order by ID

`GET /orders/:id`
Retrieve information about a specific order.

### Update Order Status

`PATCH /orders/:id/status`
Update the status of an order.

**Request body:**

```json
{
  "status": "Processing"
}
```

**Valid status values:**

- `Pending`
- `Processing`
- `Completed`
- `Cancelled`

### Track Order

`POST /orders/track`
Track an order using email and order ID.

**Request body:**

```json
{
  "email": "mario.rossi@example.com",
  "order_id": 98000001
}
```

### Get Orders by Email

`GET /orders/email/:email`
Get all orders for a specific email address.

### Get User Orders

`GET /orders/user/:userId`
Get all orders for the authenticated user.

**Headers:**

```plaintext
Authorization: Bearer jwt_token_here
```

## Newsletter Routes

### Subscribe to Newsletter

`POST /newsletter/subscribe`
Subscribe an email address to the newsletter.

**Request body:**

```json
{
  "email": "customer@example.com"
}
```

**Response:**

```json
{
  "message": "Email registrata con successo!",
  "success": true
}
```

### Get All Newsletter Subscribers

`GET /newsletter/subscribers`
Get all newsletter subscribers (admin use only).

### Unsubscribe from Newsletter

`DELETE /newsletter/unsubscribe/:email`
Unsubscribe an email address from the newsletter.

**Response:**

```json
{
  "message": "Successfully unsubscribed"
}
```
