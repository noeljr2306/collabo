"use client";

import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <SignUp
        appearance={{
          baseTheme: dark,
          variables: {
            colorPrimary: "#10b981", // This is emerald-500
            colorBackground: "#0f172a", // This is slate-900
          },
          elements: {
            card: "border border-slate-800 shadow-xl rounded-2xl",
            headerTitle: "text-2xl font-bold text-slate-50",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton:
              "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700",
            formButtonPrimary:
              "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold",
          },
        }}
        signInUrl="/auth/login"
        forceRedirectUrl="/dashboard"
      />
    </div>
  );
}
