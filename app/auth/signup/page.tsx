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

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign up with:", formData);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="bg-slate-900/50 border-slate-800 shadow-xl rounded-2xl">
          <CardHeader className="space-y-2">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                C
              </div>
            </div>

            <CardTitle className="text-3xl font-bold text-slate-50">
              Create your Collabo Account
            </CardTitle>

            <CardDescription className="text-slate-400">
              Join{" "}
              <span className="font-semibold text-emerald-400">Collabo</span>{" "}
              and start coding together in real-time
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="username"
                label="Username"
                type="text"
                placeholder="e.g. collaboDev"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />

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
                Sign Up
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-emerald-400 hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
