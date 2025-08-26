import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import SizeTable from './pages/Size-table';
import StorySite from './pages/Story-site';
import PrivacyPolicy from './pages/Privacy-policy';
import Contacts from './pages/Contacts';
import ProductDetails from './pages/ProductDetails';
import Carello from './pages/PageCarello';
import DefaultLayout from "./layout/defaultLayout";
import WardrobeSectionPage from './pages/WardrobeSectionPage'; // renamed from MacroAreaPage
import SearchPage from './pages/SearchPage';
import Checkout from './pages/Checkout/Checkout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import ChangePassword from './pages/Profile/ChangePassword';
import OrdersHistory from './pages/Profile/OrdersHistory';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import NotFound from './pages/NotFound'; // Updated import path from components to pages
import UnsubscribeNewsletter from './pages/UnsubscribeNewsletter';
import Fireflies from './components/Fireflies/Fireflies';
import Wishlist from './pages/Wishlist';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function App() {
  const stripePromise = loadStripe('pk_test_51ROydB33eARAa4FaXC0t0a9hIjtRdeWzaash0tOxyBqHvwvnq9gGN6q3WkOWc0PzSvfUsIs8rCQIEqt7AujrFJeH00AQIagCXr');

  // Create Stripe options object with locale set to English
  const stripeOptions = {
    locale: 'en' // Force English language for Stripe elements
  };

  return (
    <>
      <Fireflies />
      <BrowserRouter>
        <Routes>
          <Route element={<DefaultLayout />}>
            {/* Pagine pubbliche */}
            <Route path="/" element={<Home />} />
            <Route path="/wardrobe-section/:slug" element={<WardrobeSectionPage />} />
            <Route path="/size-table" element={<SizeTable />} />
            <Route path="/story-site" element={<StorySite />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="/unsubscribe-newsletter" element={<UnsubscribeNewsletter />} />
            <Route path="/wishlist" element={<Wishlist />} />

            {/* Pagine di autenticazione */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Pagine protette */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/change-password" element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersHistory />
              </ProtectedRoute>
            } />
            <Route path="/carello" element={<Carello />} />
            <Route path='/checkout' element={
              <Elements stripe={stripePromise} options={stripeOptions}>
                <Checkout />
              </Elements>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
