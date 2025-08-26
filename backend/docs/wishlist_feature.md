# Wishlist Feature Documentation

This document outlines the Wishlist functionality implemented for the Boolean E-commerce platform.

## Overview

The Wishlist feature allows authenticated users to:

- Save products they're interested in for future reference
- View all their wishlist items in one place
- Check if a specific product is in their wishlist
- Remove individual items or clear their entire wishlist

## Database Structure

The wishlist data is stored in the `wishlists` table with the following structure:

```sql
CREATE TABLE `wishlists` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_product_unique` (`user_id`, `product_id`),
  KEY `wishlist_user_index` (`user_id`),
  KEY `wishlist_product_index` (`product_id`),
  CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
)
```

The unique constraint on `user_id` and `product_id` ensures that a user cannot add the same product to their wishlist multiple times.

## API Endpoints

All wishlist endpoints require authentication via JWT token. The base URL for all wishlist endpoints is:

```http
/api/v1/wishlist
```

### Available Endpoints

1. **Get Wishlist Items**
   - Method: `GET`
   - Endpoint: `/api/v1/wishlist`
   - Description: Retrieves all wishlist items for the authenticated user
   - Authentication: Required
   - Response:

     ```json
     [
       {
         "id": 1,
         "user_id": 10,
         "product_id": 5,
         "created_at": "2025-05-15T12:30:45.000Z",
         "name": "Serelith",
         "slug": "serelith",
         "description": "Hoop earrings with diamonds.",
         "price": 3000.00,
         "discount": 0.00,
         "images": [
           {
             "url": "serelith.jpg",
             "view_type": "front",
             "is_primary": 1,
             "product_variation_id": null
           }
         ]
       },
       // Additional wishlist items...
     ]
     ```

2. **Add to Wishlist**
   - Method: `POST`
   - Endpoint: `/api/v1/wishlist`
   - Description: Adds a product to the user's wishlist
   - Authentication: Required
   - Request Body:

     ```json
     {
       "productId": 1
     }
     ```

   - Response:

     ```json
     {
       "message": "Product added to wishlist"
     }
     ```

   - Note: If the product is already in the wishlist, returns a 200 status with a message.

3. **Remove from Wishlist**
   - Method: `DELETE`
   - Endpoint: `/api/v1/wishlist/:productId`
   - Description: Removes a specific product from the user's wishlist
   - Authentication: Required
   - Response:

     ```json
     {
       "message": "Product removed from wishlist"
     }
     ```

4. **Check if Product is in Wishlist**
   - Method: `GET`
   - Endpoint: `/api/v1/wishlist/check/:productId`
   - Description: Checks if a specific product is in the user's wishlist
   - Authentication: Required
   - Response:

     ```json
     {
       "inWishlist": true
     }
     ```

5. **Clear Wishlist**
   - Method: `DELETE`
   - Endpoint: `/api/v1/wishlist`
   - Description: Removes all items from the user's wishlist
   - Authentication: Required
   - Response:

     ```json
     {
       "message": "Removed 5 items from wishlist"
     }
     ```

## Implementation Details

The wishlist functionality is implemented using:

- `WishlistController.js`: Handles the business logic for wishlist operations
- `wishlistRouter.js`: Defines the routes and connects them to controller methods
- JWT authentication middleware to ensure only authorized users can access their wishlists

## Frontend Integration

To integrate with the frontend:

1. Use the authentication token in the `Authorization` header for all wishlist requests
2. Display wishlist status on product cards/pages (heart icon toggle)
3. Create a dedicated wishlist page showing all saved items
4. Implement add/remove functionality with appropriate UI feedback

## Error Handling

The API returns appropriate error responses:

- 401 Unauthorized: When authentication is missing or invalid
- 400 Bad Request: When required parameters are missing
- 404 Not Found: When attempting to remove a product that isn't in the wishlist
- 500 Internal Server Error: For server-side errors with descriptive messages
