'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Cookies from 'js-cookie';
import { FaGoogle, FaGithub } from 'react-icons/fa';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      let authProvider;
      switch (provider) {
        case 'google':
          authProvider = new GoogleAuthProvider();
          break;
        case 'github':
          authProvider = new GithubAuthProvider();
          break;
      }

      const userCredential = await signInWithPopup(auth, authProvider);
      const user = userCredential.user;

      // Get ID token
      const idToken = await user.getIdToken();

      // Set authentication cookies
      Cookies.set('auth-token', idToken, { 
        expires: 1, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production' 
      });
      Cookies.set('token-creation-time', Date.now().toString(), { 
        expires: 1/24, // 1 hour
        path: '/' 
      });

      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error(`${provider} registration error`, error);
      
      let errorMessage = 'Registration failed';
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with a different credential';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Pop-up blocked. Please enable pop-ups for this site.';
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate input
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get ID token
      const idToken = await user.getIdToken();

      // Set authentication cookies
      Cookies.set('auth-token', idToken, { 
        expires: 1, // 1 day
        path: '/',
        secure: process.env.NODE_ENV === 'production' 
      });
      Cookies.set('token-creation-time', Date.now().toString(), { 
        expires: 1/24, // 1 hour
        path: '/' 
      });

      // Additional user setup (optional)
      await user.reload();

      toast.success('Registration successful');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error', error);
      
      // Handle specific Firebase authentication errors
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        const firebaseError = error as { code?: string };
        switch (firebaseError.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Email is already registered';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak';
            break;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image 
            src="/logo.svg" 
            alt="LearnFlow Logo" 
            width={150} 
            height={50} 
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Your learning journey starts here.&rdquo;
            </p>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          
          {/* OAuth Buttons */}
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="w-full"
            >
              <FaGoogle className="mr-2" /> Continue with Google
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleOAuthSignIn('github')}
              disabled={isLoading}
              className="w-full"
            >
              <FaGithub className="mr-2" /> Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-muted -z-10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          <p className="px-8 text-center text-sm text-muted-foreground">
            <Link
              href="/login"
              className="hover:text-brand underline underline-offset-4"
            >
              Already have an account? Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
