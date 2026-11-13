import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏪</span>
              <span className="text-xl font-bold text-primary-600">
                BorrowBay
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Rent anything you need. Earn from what you own.
              India's premier peer-to-peer rental marketplace.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-primary-100 rounded-full
                                     flex items-center justify-center
                                     text-primary-600 hover:bg-primary-500
                                     hover:text-white transition-all text-sm">
                f
              </a>
              <a href="#" className="w-8 h-8 bg-primary-100 rounded-full
                                     flex items-center justify-center
                                     text-primary-600 hover:bg-primary-500
                                     hover:text-white transition-all text-sm">
                in
              </a>
              <a href="#" className="w-8 h-8 bg-primary-100 rounded-full
                                     flex items-center justify-center
                                     text-primary-600 hover:bg-primary-500
                                     hover:text-white transition-all text-sm">
                ig
              </a>
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              For Customers
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/',         label: 'Browse Items' },
                { to: '/cart',     label: 'My Cart' },
                { to: '/orders',   label: 'My Orders' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/photographers', label: 'Book Photographer' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                        className="text-gray-500 text-sm hover:text-primary-500
                                   transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              For Sellers
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/seller',        label: 'Seller Dashboard' },
                { to: '/seller/items',  label: 'My Listings' },
                { to: '/signup',        label: 'Become a Seller' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to}
                        className="text-gray-500 text-sm hover:text-primary-500
                                   transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/support', label: 'Help Center' },
                { to: '/support', label: 'Contact Us' },
                { to: '/support', label: 'Report an Issue' },
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.to}
                        className="text-gray-500 text-sm hover:text-primary-500
                                   transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <div className="mt-4 space-y-1">
              <p className="text-gray-500 text-sm">
                📧 support@borrowbay.in
              </p>
              <p className="text-gray-500 text-sm">
                📞 1800-BORROW
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 mt-8 pt-6
                        flex flex-col md:flex-row justify-between
                        items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2025 BorrowBay. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#"
               className="text-gray-400 text-sm hover:text-primary-500 transition-colors">
              Privacy Policy
            </a>
            <a href="#"
               className="text-gray-400 text-sm hover:text-primary-500 transition-colors">
              Terms of Service
            </a>
            <a href="#"
               className="text-gray-400 text-sm hover:text-primary-500 transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}