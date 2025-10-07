import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/app');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data);
      router.push('/app');
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto"></div>
            <Sparkles className="h-6 w-6 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-secondary-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Sign In - Triostack Asset Manager</title>
        <meta name="description" content="Sign in to your Triostack Asset Manager account" />
      </Head>
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-primary-100 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary-300 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header with animation */}
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
              Triostack Asset Manager
            </h1>
            <p className="text-secondary-600 text-lg">
              Welcome back! Please sign in to continue
            </p>
          </div>

          {/* Glassmorphism card */}
          <div className="backdrop-blur-lg bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8 animate-slide-up">
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">Sign In</h2>
                <p className="text-secondary-600">
                  Enter your credentials to access your account
                </p>
              </div>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      {...register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      leftIcon={<Mail className="h-5 w-5" />}
                      error={errors.email?.message}
                      autoComplete="email"
                      className="transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const emailField = document.querySelector('input[type="email"]') as HTMLInputElement;
                        const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement;
                        if (emailField) emailField.value = 'admin@example.com';
                        if (passwordField) passwordField.value = 'admin123';
                      }}
                      className="absolute right-2 top-8 text-xs bg-primary-100 hover:bg-primary-200 text-primary-700 px-2 py-1 rounded transition-colors duration-200"
                      aria-label="Fill demo credentials"
                      title="Fill demo credentials"
                    >
                      Demo
                    </button>
                  </div>

                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="Enter your password"
                    leftIcon={<Lock className="h-5 w-5" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-secondary-400 hover:text-primary-600 transition-colors duration-200 hover:scale-110 transform"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                    error={errors.password?.message}
                    autoComplete="current-password"
                    className="transform transition-all duration-300 hover:scale-[1.02] focus-within:scale-[1.02]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center group">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded transition-all duration-200 group-hover:scale-110"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-700 group-hover:text-secondary-900 transition-colors duration-200">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-all duration-200 hover:underline">
                      Forgot your password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  <span className="flex items-center justify-center">
                    {isSubmitting ? (
                      'Signing in...'
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="bg-primary-50/50 backdrop-blur-sm rounded-xl p-4 border border-primary-200/50">
              <p className="text-sm font-medium text-primary-700 mb-2">Demo Credentials</p>
              <div className="text-xs text-primary-600 space-y-1">
                <p><strong>Email:</strong> admin@example.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <p className="text-sm text-secondary-500">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => router.push('/register')}
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200 hover:underline"
              >
                Contact your administrator
              </button>
            </p>
            <p className="text-xs text-secondary-400 mt-2">© 2024 Triostack. All rights reserved.</p>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
