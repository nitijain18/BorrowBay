import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage       from './pages/LoginPage'
import SignupPage      from './pages/SignupPage'
import OtpPage         from './pages/OtpPage'
import HomePage        from './pages/HomePage'
import ItemsPage       from './pages/ItemsPage'
import ItemDetailPage  from './pages/ItemDetailPage'
import CartPage        from './pages/CartPage'
import ProfilePage     from './pages/ProfilePage'
import OrdersPage      from './pages/OrdersPage'
import WishlistPage    from './pages/WishlistPage'
import SellerDashboard from './pages/SellerDashboard'
import SellerApplyPage from './pages/SellerApplyPage'
import AdminDashboard  from './pages/AdminDashboard'
import NotificationsPage from './pages/NotificationsPage'
import PhotographersPage      from './pages/PhotographersPage'
import PhotographerDetailPage from './pages/PhotographerDetailPage'
import PhotographerApplyPage  from './pages/PhotographerApplyPage'
import PhotographerBookingsPage from './pages/PhotographerBookingsPage'
import DeliveryApplyPage   from './pages/DeliveryApplyPage'
import DeliveryDashboard   from './pages/DeliveryDashboard'
import OrderDetailPage from './pages/OrderDetailPage'
import NotFoundPage from './pages/NotFoundPage'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? children : <Navigate to="/login" />
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/signup"       element={<SignupPage />} />
          <Route path="/otp"          element={<OtpPage />} />
          <Route path="/items"        element={<ItemsPage />} />
          <Route path="/items/:id"    element={<ItemDetailPage />} />
          <Route path="/cart" element={
            <ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>} />
         <Route path="/orders/:id" element={
  <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
} />
          <Route path="/wishlist" element={
            <ProtectedRoute><WishlistPage /></ProtectedRoute>} />
          <Route path="/seller" element={
            <ProtectedRoute><SellerDashboard /></ProtectedRoute>} />
          <Route path="/seller/apply" element={
            <ProtectedRoute><SellerApplyPage /></ProtectedRoute>} />
          <Route path="/admin" element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/notifications" element={
  <ProtectedRoute><NotificationsPage /></ProtectedRoute>
} />
<Route path="/photographers"     element={<PhotographersPage />} />
<Route path="/photographers/:id" element={<PhotographerDetailPage />} />
<Route path="/photographer/apply" element={
  <ProtectedRoute><PhotographerApplyPage /></ProtectedRoute> 
} />
<Route path="/photographer/bookings" element={
  <ProtectedRoute><PhotographerBookingsPage /></ProtectedRoute>
} />
<Route path="/delivery/apply" element={
  <ProtectedRoute><DeliveryApplyPage /></ProtectedRoute>
} />
<Route path="/delivery/dashboard" element={
  <ProtectedRoute><DeliveryDashboard /></ProtectedRoute>
} />
<Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App