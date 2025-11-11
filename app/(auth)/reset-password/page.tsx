"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";

import { MagicCard } from "@/components/ui/magic-card";
import { AnimatedGradientText } from "@/components/ui/animated-gradient-text";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { useAuth } from "@/lib/auth/auth-context";
import { resetPasswordSchema, ResetPasswordFormData } from "@/lib/auth/validation";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setIsSuccess(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <AnimatedGradientText className="text-4xl font-bold mb-4">
            Check Your Email
          </AnimatedGradientText>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to your email address
          </p>
        </div>

        <MagicCard
          className="p-8 backdrop-blur-xl bg-[#1A1A1A]/50 border border-white/10"
          gradientColor="#8B5CF6"
        >
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Mail className="h-8 w-8 text-purple-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Email Sent Successfully</h3>
              <p className="text-sm text-muted-foreground">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
            </div>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </MagicCard>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <AnimatedGradientText className="text-4xl font-bold mb-4">
          Reset Password
        </AnimatedGradientText>
        <p className="text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <MagicCard
        className="p-8 backdrop-blur-xl bg-[#1A1A1A]/50 border border-white/10"
        gradientColor="#8B5CF6"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                {...register("email")}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
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
                Sending Reset Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </RainbowButton>

          {/* Info Text */}
          <div className="text-xs text-muted-foreground text-center pt-2">
            <p>
              You&apos;ll receive an email with instructions on how to reset your password.
            </p>
          </div>
        </form>
      </MagicCard>

      {/* Back to Login Link */}
      <div className="text-center mt-6">
        <Link
          href="/login"
          className="text-sm text-purple-400 hover:text-purple-300 inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
