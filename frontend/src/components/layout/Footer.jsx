import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-transparent">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Sri Rajarajeswari Trade Logo" className="h-10 w-10 object-contain rounded-lg" />
              <span className="font-display text-xl font-bold text-primary">
                Sri Rajarajeswari Trade
              </span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Your neighborhood grocery store, now online. Fresh produce, quality products,
              and convenient delivery right to your doorstep.
            </p>
          </div>

          {/* Quick Links */}
          <div className="p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60">
            <h3 className="font-semibold mb-4 text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-primary font-bold hover:underline">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60">
            <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>📍 123 Market Street</li>
              <li>📞 (555) 123-4567</li>
              <li>✉️ hello@freshmart.com</li>
              <li>🕐 Mon-Sat: 8AM - 9PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} Sri Rajarajeswari Trade. All rights reserved.</p>
          <p className="mt-1">Built for Academic Project Submission</p>
        </div>
      </div>
    </footer>
  );
}
