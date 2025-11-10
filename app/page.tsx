import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageSquare,
  Brain,
  Lock,
  Users,
  FileCode,
  Cloud,
  Zap,
  Wrench,
  Palette,
  Handshake,
  Sparkles,
  Github,
} from "lucide-react";
import Link from "next/link";
import {
  floatingAvatars,
  features,
  whyChooseItems,
  footerLinks,
} from "@/constants";

interface FloatingAvatarProps {
  name: string;
  className: string;
  delay?: number;
  color: string;
}

const FloatingAvatar = ({
  name,
  className,
  delay = 0,
  color,
}: FloatingAvatarProps) => (
  <div
    className={`absolute animate-[float_8s_ease-in-out_infinite] ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <div className="relative">
      <div
        className={`absolute -top-2 left-6 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-8 ${color.replace(
          "bg-",
          "border-b-"
        )}`}
      />
      <div
        className={`${color} rounded-full px-4 py-2 flex items-center gap-2 shadow-lg border-2 border-slate-700`}
      >
        <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold">
          {name.charAt(0)}
        </div>
        <span className="text-sm font-semibold text-white whitespace-nowrap">
          {name}
        </span>
      </div>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-20px) rotate(5deg);
            }
          }
        `,
        }}
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-slate-950 font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-slate-50">Collabo</span>
            </div>
            
            
             <a href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <Github className="w-6 h-6" />
            </a>
          </div>
        </div>
      </nav>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        {floatingAvatars.map((avatar) => (
          <FloatingAvatar
            key={avatar.name}
            name={avatar.name}
            className={avatar.className}
            delay={avatar.delay}
            color={avatar.color}
          />
        ))}

        <div className="flex items-center justify-center px-4 pt-40 pb-44 relative">
          <div className="max-w-5xl w-full text-center space-y-8">
            <Badge className="bg-emerald-500/10 text-emerald-400 px-4 py-2 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
              <Users className="w-4 h-4 inline mr-2" />
              Real-time collaboration for developers
            </Badge>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-50 tracking-tight leading-tight">
                Your code. Your crew. One{" "}
                <span className="text-emerald-400 inline-block hover:scale-105 transition-transform">
                  Collabo.
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Real-time code collaboration that just works. No stress, no
                delay, just you and your team moving together.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all"
              >
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full cursor-pointer bg-slate-900/50 border-slate-700 hover:border-slate-600 text-slate-50 px-8 transition-all"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
              <Sparkles className="w-10 h-10 inline mb-2 text-emerald-400" />{" "}
              Features
            </h2>
            <p className="text-lg text-slate-400">
              Everything you need to code together, effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const IconComponent = {
                MessageSquare,
                Brain,
                Lock,
                Users,
                FileCode,
                Cloud,
              }[feature.icon] as React.ComponentType<{ className?: string }>;

              return (
                <Card
                  key={index}
                  className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all backdrop-blur-sm hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10"
                >
                  <CardContent className="pt-8 pb-8">
                    <div className="mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-50 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 bg-slate-900/30">
        <div className="max-w-5xl mx-auto pt-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-12 text-center">
            <Sparkles className="w-10 h-10 inline mb-2 text-emerald-400" /> Why
            Choose Collabo
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {whyChooseItems.map((item, index) => {
              const IconComponent = {
                Zap,
                Wrench,
                Palette,
                Handshake,
              }[item.icon] as React.ComponentType<{ className?: string }>;

              return (
                <div key={index} className="why-choose-item">
                  <div className="shrink-0">
                    <IconComponent className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-50 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-900/30 border-emerald-500/20 backdrop-blur-sm hover:scale-105 transition-transform">
            <CardContent className="pt-12 pb-12 px-8">
              <div className="text-center space-y-6">
                <div className="text-emerald-400 text-5xl font-serif">
                  &quot;
                </div>
                <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">
                  Collabo saved our hackathon project — we built a full app in
                  one night without ever leaving our room.
                </p>
                <div className="pt-4">
                  <p className="text-emerald-400 font-semibold text-lg">
                    — Joshua, Full Stack Developer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="px-4 py-24 bg-linear-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 leading-tight">
            Ready to Stop the
            <br />
            Solo Struggle?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join and create your team and invite your crew to start
            collaborating with you.
          </p>
          <Button
            size="lg"
            className="rounded-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 transition-all px-10 py-6 text-lg"
          >
            <Link href="/auth/signup">
              Start Collaborating Now - It&apos;s Free!
            </Link>
          </Button>
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-5">
            <p className="text-slate-400 flex items-center justify-center gap-2 text-sm">
              Made with{" "}
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />{" "}
              and way too much caffeine by the Collabo team.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
              {footerLinks.map((link, index) => (
                <React.Fragment key={link}>
                  <button className="text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                    {link}
                  </button>
                  {index < footerLinks.length - 1 && (
                    <span className="text-slate-700">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-slate-600 text-xs pt-4">
              © 2025 Collabo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}