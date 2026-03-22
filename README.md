#  RestaurantApp — Mobile

> A React Native food ordering app for Android & Web built with Expo

---

## Description

RestaurantApp Mobile is the customer facing app that allows users to browse a restaurant menu, add items to a cart, and place orders. It runs on Android devices and web browsers via Expo.

**Features:**
- Browse live menu fetched from the backend
- Filter by category (Main, Starters, Drinks, Dessert, Breakfast)
- Search for items by name
- Promotional banners on home screen
- Add items to cart with quantity controls
- Delivery location input on app open
- Checkout with delivery details and payment method selection
- Card payment with number validation, expiry check and card type detection
- Cash on delivery option
- Sign in / Sign up before placing an order
- Order confirmation screen with estimated delivery time and progress tracker
- Order history with item images and re-order functionality
- Profile screen with editable details, Help & Support, and About modals
- Bottom tab navigation (Home, Search, Location, Profile)

---

## Tech Stack

- React Native + Expo
- Expo Router (file-based navigation)
- TypeScript
- Axios (API calls)
- AsyncStorage (token & delivery address storage)
- expo-location (GPS detection)
- React Native Animated (toast notifications, animations)

---

## Installation

### Prerequisites
- Node.js v18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your Android device (for testing)

### Steps

```bash
# Clone the repo
git clone repo
cd restaurant-mobile

# Install dependencies
npm install

# Install Expo-specific packages
npx expo install expo-location @react-native-async-storage/async-storage
```

Update the backend URL in `src/api/client.ts`:
```typescript
const BASE_URL = 'https://restaurant-app-reactnative-backend.onrender.com/api';
```

### Run the app
```bash
# Start Expo
npx expo start

# Run on web
npx expo start --web

# Build APK for Android
eas build --platform android
```

---

## Usage

1. App opens → enter or detect your delivery location
2. Browse the menu on the home screen
3. Tap a category or use the search bar to filter items
4. Tap **Add to Cart** on any item
5. Tap the cart icon → review your order
6. Choose delivery method and payment
7. Sign in or create an account
8. Tap **Place Order** → view confirmation screen
9. View past orders under **My Orders**

---

## Project Structure

```
restaurant-mobile/
├── app/                        ← Screens (Expo Router file-based)
│   ├── index.tsx               ← Home / Menu screen
│   ├── location.tsx            ← Delivery location screen
│   ├── checkout.tsx            ← Cart & order summary
│   ├── delivery-options.tsx    ← Delivery method selection
│   ├── payment.tsx             ← Payment method & card form
│   ├── signin.tsx              ← Sign in screen
│   ├── signup.tsx              ← Sign up screen
│   ├── orders.tsx              ← Order history
│   ├── checkout-message.tsx    ← Order confirmation
│   ├── profile.tsx             ← User profile
│   └── _layout.tsx             ← Root layout & navigation stack
├── src/
│   ├── api/
│   │   └── client.ts           ← Axios instance with base URL & interceptors
│   ├── context/
│   │   ├── CartContext.tsx      ← Cart state (add, remove, update, reorder)
│   │   └── AuthContext.tsx      ← Auth state (token, user, signin, signout)
│   └── components/
│       └── BottomTabBar.tsx     ← Custom bottom navigation bar
├── app.json                    ← Expo config
└── package.json
```

---

## Environment

No `.env` file needed in the mobile app. The only config is the `BASE_URL` in `src/api/client.ts`:

```typescript
const BASE_URL = 'https://https://restaurant-app-reactnative-backend.onrender.com/api';
```

---

## API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Fetch all menu items |
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders` | Get order history |
| GET | `/api/orders/:id/items` | Get items for re-order |
| POST | `/api/signin` | Sign in user |
| POST | `/api/signup` | Register new user |
| GET | `/api/auth/profile` | Get user profile |
| PUT | `/api/auth/profile` | Update user profile |

---


## Roadmap

- [ ] Build & publish APK 
- [ ] Push notifications for order updates
- [ ] Real-time order tracking with map
- [ ] Android support

---

## Authors

Built by **Ndima Mhangwani** 🇿🇦

---


## Project Status

🟢 **Active — Version 2.0.0**
