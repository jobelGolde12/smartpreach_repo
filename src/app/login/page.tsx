"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { FaGoogle, FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';

class Line {
  x: number;
  y: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  thickness: number;

  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.length = Math.random() * 100 + 30;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 0.2 + 0.1;
    this.opacity = Math.random() * 0.08 + 0.02; // Very reduced opacity
    this.thickness = Math.random() * 1 + 0.5;
  }

  update(canvas: HTMLCanvasElement) {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    if (this.x < -this.length) this.x = canvas.width + this.length;
    if (this.x > canvas.width + this.length) this.x = -this.length;
    if (this.y < -this.length) this.y = canvas.height + this.length;
    if (this.y > canvas.height + this.length) this.y = -this.length;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.angle) * this.length,
      this.y + Math.sin(this.angle) * this.length
    );
    ctx.strokeStyle = `rgba(59, 130, 246, ${this.opacity})`;
    ctx.lineWidth = this.thickness;
    ctx.stroke();
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time validation functions
  const validateEmail = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    if (!emailRegex.test(value)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    return undefined;
  };

  // Handle email change with validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    if (error) setError('');
  };

  // Handle password change with validation
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors(prev => ({ ...prev, password: validatePassword(value) }));
    if (error) setError('');
  };

  useEffect(() => {
    // Create animated background lines
    const canvas = document.getElementById('background-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const lines: Line[] = [];
    for (let i = 0; i < 30; i++) {
      lines.push(new Line(canvas));
    }

    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      lines.forEach(line => {
        line.update(canvas);
        line.draw(ctx);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      if (data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert('Not available for now');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Animated Background */}
      <canvas
        id="background-canvas"
        className="fixed inset-0 pointer-events-none"
      />

      {/* Main Login Card - No border, no shadow */}
      <div className="relative w-full max-w-md">
        <div className="relative p-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
          {/* Header without icon */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Sign in to your account
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100/50 dark:bg-red-900/20 rounded-xl animate-shake">
              <p className="text-red-600 dark:text-red-400 text-center font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Input with Icon */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className={`h-5 w-5 transition-colors ${errors.email ? 'text-red-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  type="email"
                  required
                  className={`w-full pl-12 pr-4 py-4 bg-white/70 dark:bg-gray-700/70 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-all duration-300 ${
                    errors.email 
                      ? 'border border-red-400 focus:ring-red-400' 
                      : 'focus:ring-blue-500'
                  }`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400 ml-1 flex items-center">
                  <span className="mr-1">•</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Input with Eye Toggle and Icon */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 transition-colors ${errors.password ? 'text-red-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={`w-full pl-12 pr-12 py-4 bg-white/70 dark:bg-gray-700/70 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:outline-none transition-all duration-300 ${
                    errors.password 
                      ? 'border border-red-400 focus:ring-red-400' 
                      : 'focus:ring-blue-500'
                  }`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => setErrors(prev => ({ ...prev, password: validatePassword(password) }))}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-500 dark:text-red-400 ml-1 flex items-center">
                  <span className="mr-1">•</span> {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                />
                <label htmlFor="remember" className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/95 dark:bg-gray-800/95 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white dark:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium flex items-center justify-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaGoogle className="h-5 w-5 text-red-500" />
              <span>Continue with Google</span>
            </button>

            {/* Google Sign-in Help Message */}
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-50/70 dark:bg-amber-900/20 p-4">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                Google sign-in notice
              </p>
              <p className="mt-1 text-xs leading-relaxed text-amber-700/80 dark:text-amber-200/80">
                If Google shows an error like <span className="font-medium">“Try signing in with a different account”</span>,
                the selected Google account isn’t permitted for this app. Please switch to another Google account
                or contact your organization administrator.
              </p>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Register here
              </Link>
            </p>
            <div>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                ← Back to Welcome Page
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
