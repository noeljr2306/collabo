import { SignIn } from "@clerk/nextjs";
import { Terminal } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Logo / Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-500 p-2 rounded-xl">
          <Terminal className="h-8 w-8 text-slate-950" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-500 tracking-tight">
          Collabo
        </h1>
      </div>

      {/* Clerk Component */}
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
            card: "bg-slate-900 border border-slate-800 shadow-2xl",
            headerTitle: "text-slate-50",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton:
              "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700",
            formFieldLabel: "text-slate-400",
            formFieldInput: "bg-slate-800 border-slate-700 text-slate-50",
            footerActionLink: "text-emerald-500 hover:text-emerald-400",
            dividerLine: "bg-slate-800",
            dividerText: "text-slate-500",
          },
        }}
      />
    </div>
  );
}
