import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('mode') === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAdmin, isLoading: authLoading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      console.log('🔍 Auth page redirect check:', {
        email: user.email,
        isAdmin,
        authLoading
      });

      // Use a small timeout to allow state to settle if needed, but primarily trust isAdmin
      const timeout = setTimeout(() => {
        if (isAdmin) {
          console.log('🚀 Redirecting to Admin Dashboard...');
          navigate('/admin');
        } else {
          console.log('🏠 Redirecting to Customer Home...');
          navigate('/');
        }
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validationData = isSignUp ? { email, password, name } : { email, password };
      authSchema.parse(validationData);

      const { error } = isSignUp
        ? await signUp(email, password, name)
        : await signIn(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isSignUp ? 'Account created!' : 'Welcome back!');
        // Redirect handled by useEffect
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container flex items-center justify-center py-16 min-h-[80vh] relative z-10">
        <div className="w-full max-w-md p-1 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-2xl">
          <Card className="w-full border-0 bg-transparent shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="font-display text-2xl">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription>
                {isSignUp ? 'Sign up to start shopping' : 'Sign in to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              {email.toLowerCase().trim() === 'rajarajeshwari@gmail.com' && (
                <div className="mt-6 pt-6 border-t border-white/10 font-bold text-green-500/80 animate-pulse">
                  <p className="text-xs text-center">Master Admin Detected</p>
                </div>
              )}

              <div className="mt-4 text-center text-sm">
                <button type="button" className="text-primary hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
