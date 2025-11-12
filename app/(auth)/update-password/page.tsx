"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";

import { createClient } from "@/lib/supabase/client";

const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  // Check if we have a recovery token in the URL hash
  useEffect(() => {
    const checkToken = async () => {
      // Check URL hash for recovery tokens
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');

      if (accessToken && type === 'recovery') {
        setHasToken(true);

        // Exchange the recovery token for a session
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (error) {
          console.error('Error setting session:', error);
          toast.error('Invalid or expired reset link');
          setTimeout(() => router.push('/reset-password'), 2000);
        }
      } else {
        // No token found, redirect to reset password page
        toast.error('No reset token found. Please request a new password reset.');
        setTimeout(() => router.push('/reset-password'), 2000);
      }
    };

    checkToken();
  }, [router, supabase.auth]);

  const onSubmit = async (data: UpdatePasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Failed to update password");
        return;
      }

      setIsSuccess(true);
      toast.success("Password updated successfully!");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
    return (
      <BlurFade delay={0.1} inView>
        <div className="container max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <AnimatedGradientText className="text-4xl font-bold mb-4">
              Password Updated!
            </AnimatedGradientText>
            <p className="text-muted-foreground">
              Your password has been successfully reset
            </p>
          </div>

          <MagicCard
            className="p-8 backdrop-blur-xl bg-[#1A1A1A]/50 border border-white/10"
            gradientColor="#8B5CF6"
          >
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Success!</h3>
                <p className="text-sm text-muted-foreground">
                  You can now log in with your new password.
                </p>
              </div>

              <Link href="/login">
                <Button className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Continue to Login
                </Button>
              </Link>
            </div>
          </MagicCard>
        </div>
      </BlurFade>
    );
  }

  // Loading state while checking token
  if (!hasToken) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      </div>
    );
  }

  // Update password form
  return (
    <BlurFade delay={0.1} inView>
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <AnimatedGradientText className="text-4xl font-bold mb-4">
            Set New Password
          </AnimatedGradientText>
          <p className="text-muted-foreground">
            Choose a strong password for your account
          </p>
        </div>

        <MagicCard
          className="p-8 backdrop-blur-xl bg-[#1A1A1A]/50 border border-white/10"
          gradientColor="#8B5CF6"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                  {...register("password")}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-muted-foreground space-y-1 bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="font-medium text-white">Password requirements:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
              </ul>
            </div>

            {/* Submit Button */}
            <RainbowButton
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </RainbowButton>
          </form>
        </MagicCard>

        {/* Cancel Link */}
        <div className="text-center mt-6">
          <Link
            href="/login"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Cancel and return to login
          </Link>
        </div>
      </div>
    </BlurFade>
  );
}
