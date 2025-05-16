# App Directory

This directory contains all the routes and pages for the ProductBazar frontend application, following the Next.js App Router pattern.

## Route Groups

- `/(auth)` - Authentication routes (login, register, etc.)
  - `/login` - Login page
  - `/register` - Registration page
  - `/forgot-password` - Forgot password page
  - `/reset-password` - Reset password page
  - `/verify-email` - Email verification page
  - `/verify-phone` - Phone verification page

- `/(dashboard)` - Dashboard routes (protected routes for authenticated users)
  - `/app` - Main dashboard page
  - `/products` - User's products page
  - `/profile` - User's profile page
  - `/projects` - User's projects page
  - `/settings` - User's settings page

- `/(marketing)` - Marketing routes (public routes)
  - `/` - Landing page
  - `/about` - About page
  - `/contact` - Contact page
  - `/pricing` - Pricing page

## Dynamic Routes

- `/[user]` - User profile routes
- `/product/[slug]` - Product detail page
- `/category/[slug]` - Category detail page
- `/projects/[slug]` - Project detail page

## Special Files

- `layout.jsx` - Layout component for a route segment
- `page.jsx` - Page component for a route
- `loading.jsx` - Loading state for a route
- `error.jsx` - Error state for a route
- `not-found.jsx` - Not found state for a route

## Guidelines

1. Use route groups (parentheses notation) to organize related routes
2. Keep route-specific components in a `components` directory within each route
3. Use Next.js special files (`page.jsx`, `layout.jsx`, `loading.jsx`, etc.)
4. Use PascalCase for component files within route directories
5. Group related routes together
6. Use dynamic routes for content that follows a pattern
7. Keep page components focused on data fetching and layout composition