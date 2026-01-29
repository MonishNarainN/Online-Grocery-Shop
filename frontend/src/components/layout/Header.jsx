import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Settings, Package, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/40 backdrop-blur-md supports-[backdrop-filter]:bg-background/20">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Sri Rajarajeswari Trade Logo" className="h-10 w-10 object-contain rounded-lg" />
          <span className="font-display text-xl font-bold text-primary">
            Sri Rajarajeswari Trade
          </span>
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Products</Link>
          <Link to="/cart" className="nav-link">Cart</Link>
          <Link to="/orders" className="nav-link">My Orders</Link>
          {(isAdmin || user?.email?.toLowerCase().trim() === 'rajarajeshwari@gmail.com') && (
            <Link to="/admin" className="nav-link text-primary font-bold border-b-2 border-primary animate-pulse">
              ADMIN DASHBOARD
            </Link>
          )}
        </nav>

        {/* Navigation - Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="text-left font-display text-xl font-bold text-primary">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <Link to="/" className="text-lg font-medium hover:text-primary transition-colors">Home</Link>
                <Link to="/products" className="text-lg font-medium hover:text-primary transition-colors">Products</Link>
                <Link to="/cart" className="text-lg font-medium hover:text-primary transition-colors">Cart</Link>
                <Link to="/orders" className="text-lg font-medium hover:text-primary transition-colors">My Orders</Link>
                {(isAdmin || user?.email?.toLowerCase().trim() === 'rajarajeshwari@gmail.com') && (
                  <Link to="/admin" className="text-xl font-bold text-primary border-t pt-4 mt-4 animate-pulse">
                    ADMIN DASHBOARD
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-cart-bounce">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user.email}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center">
                    <Package className="mr-2 h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                {(isAdmin || user?.email?.toLowerCase().trim() === 'rajarajeshwari@gmail.com') && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth?mode=signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
