"use client";
// app/auth/signup/[[...rest]]/page.tsx

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Code2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0b",
      display: "flex",
      flexDirection: "column",
      fontFamily: "system-ui, -apple-system, sans-serif",
    }}>
      {/* Top nav */}
      <nav style={{
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #1c1c1f",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "#22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Code2 size={15} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ color: "#e4e4e7", fontWeight: 700, fontSize: 16, letterSpacing: "-0.2px" }}>
            Collabo
          </span>
        </Link>
        <span style={{ color: "#6b6b72", fontSize: 13 }}>
          Have an account?{" "}
          <Link href="/auth/login" style={{ color: "#22c55e", fontWeight: 600, textDecoration: "none" }}>
            Sign in
          </Link>
        </span>
      </nav>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
      }}>
        {/* Heading */}
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1 style={{
            fontSize: 28, fontWeight: 800, color: "#fff",
            letterSpacing: "-0.7px", marginBottom: 8, lineHeight: 1.15,
          }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "#6b6b72", lineHeight: 1.6 }}>
            Free forever · No credit card required
          </p>
        </div>

        {/* Clerk SignUp */}
        <div style={{ width: "100%", maxWidth: 400 }}>
          <SignUp
            signInUrl="/auth/login"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                header: "pb-0",
              },
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "20px 32px", textAlign: "center", borderTop: "1px solid #1c1c1f" }}>
        <p style={{ fontSize: 12, color: "#3a3a3f" }}>
          © 2025 Collabo · Built by Noel Jr.
        </p>
      </div>
    </div>
  );
}