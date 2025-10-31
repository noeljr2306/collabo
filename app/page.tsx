import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-center px-4 pt-34 pb-40 relative">
          <div className="max-w-5xl w-full text-center space-y-8">
            <Badge className="bg-emerald-500/10 text-emerald-400 p-2 border-emerald-500/30 hover:bg-emerald-500/20 transition-colors">
              Real-time collaboration for developers
            </Badge>

            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-slate-50 tracking-tight leading-tight">
                Your code. Your crew. One{" "}
                <span className="text-emerald-400">Collabo.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Real-time code collaboration that just works. No stress, no
                delay—just you and your team moving mad together.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="rounded-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-8 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
              >
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full cursor-pointer bg-slate-900/50 border-slate-700 text-slate-50 px-8"
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
              ⚙️ Features
            </h2>
            <p className="text-lg text-slate-400">
              Everything you need to code together, effortlessly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  💬
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Live Code Collaboration
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Watch your teammates code line-by-line — just like pair
                  programming, minus the awkward chair sharing.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  🧠
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Real-Time Chat
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Discuss, debug, and brainstorm with an integrated chat system
                  that keeps everyone in sync.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  🔐
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Secure Authentication
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Create or join rooms safely with Collabo&apos;s authentication
                  system — your projects stay private and protected.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  🧑‍🤝‍🧑
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Join or Create Rooms
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Jump into an existing session or start your own coding room.
                  Sharing is as simple as sending a room code.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Multi-Language Support
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  From JavaScript to Python, Collabo supports all your favourite
                  languages — no setup needed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group backdrop-blur-sm">
              <CardContent className="pt-8 pb-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  ☁️
                </div>
                <h3 className="text-xl font-semibold text-slate-50 mb-3">
                  Auto-Save & Sync
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Never lose your progress again. Collabo syncs your code across
                  all devices in real-time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="px-4 pb-24 bg-slate-900/30">
        <div className="max-w-5xl mx-auto pt-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 mb-12 text-center">
            🌈 Why Choose Collabo
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-5 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl flex-shrink-0">⚡</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  Instant Collaboration
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Real-time syncing means no merge conflicts or waiting.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl flex-shrink-0">🔧</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  Minimal Setup
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  No installations — just create a room and start coding.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl flex-shrink-0">🎨</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  Sleek & Minimal UI
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Clean, distraction-free interface that lets creativity flow.
                </p>
              </div>
            </div>

            <div className="flex gap-5 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-colors">
              <div className="text-3xl flex-shrink-0">🤝</div>
              <div>
                <h3 className="text-xl font-semibold text-slate-50 mb-2">
                  Team-Ready
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Perfect for hackathons, coding bootcamps, and remote dev
                  teams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-slate-900/50 border-emerald-500/20 backdrop-blur-sm">
            <CardContent className="pt-12 pb-12 px-8">
              <div className="text-center space-y-6">
                <div className="text-emerald-400 text-5xl">&quot;</div>
                <p className="text-xl md:text-2xl text-slate-200 font-medium leading-relaxed">
                  Collabo saved our hackathon project — we built a full app in
                  one night without ever leaving our room.
                </p>
                <div className="pt-4">
                  <p className="text-emerald-400 font-semibold text-lg">
                    — Ada, Full Stack Developer
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="px-4 py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-50 leading-tight">
            Ready to Stop the
            <br />
            Solo Struggle?
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Join and create your team and invite your guys to start
            collaborating with you.
          </p>
          <Button
            size="lg"
            className="rounded-full cursor-pointer bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-10 py-6 text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
          >
            Start Collaborating Now - It&apos;s Free!
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
              <button className="text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                Sign In
              </button>
              <span className="text-slate-700">•</span>
              <button className="text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                Privacy Policy
              </button>
              <span className="text-slate-700">•</span>
              <button className="text-slate-400 hover:text-emerald-400 transition-colors font-medium">
                GitHub Repo
              </button>
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
