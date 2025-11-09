"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-slate-50"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. collaboDev"
                  className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-50"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-50"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>

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
