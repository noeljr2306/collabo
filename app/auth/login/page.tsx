"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FormField from "@/components/form-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login with:", formData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-slate-50">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-center text-slate-400">
            Sign in to continue to Collabo
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            
            <FormField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            <Button
              type="submit"
              className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-semibold shadow-md transition-all"
              size="lg"
            >
              Sign In
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-slate-400">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-emerald-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
