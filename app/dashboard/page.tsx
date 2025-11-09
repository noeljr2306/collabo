import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Plus, Users } from "lucide-react";

export default function DashboardPage() {
  const recentRooms = [
    {
      id: "room-1",
      name: "React Project",
      participants: 3,
      lastActive: "2 hours ago",
    },
    {
      id: "room-2",
      name: "API Development",
      participants: 2,
      lastActive: "5 hours ago",
    },
    {
      id: "room-3",
      name: "UI Components",
      participants: 1,
      lastActive: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container bg-emerald-950/25 backdrop-blur-2xl mx-auto px-4 py-4 fixed flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-emerald-400" />
          <h1 className="text-xl font-bold text-slate-50">Collabo</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-slate-50"
        >
          Sign Out
        </Button>
      </div>

      <main className="container mx-auto px-4 py-22 max-w-6xl">
        <div className="mb-12 space-y-2">
          <h2 className="text-5xl font-bold text-slate-50">Welcome back!</h2>
          <p className="text-lg text-slate-400">
            Start collaborating on code in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-900/50 border-slate-800 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Plus className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-slate-50">Create Room</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Start a new collaboration session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="room-name"
                    className="text-sm font-medium text-slate-50"
                  >
                    Room Name
                  </Label>
                  <Input
                    id="room-name"
                    placeholder="My Awesome Project"
                    className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-semibold shadow-md transition-all"
                  asChild
                >
                  <Link href="/room/new-room">Create Room</Link>
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 shadow-xl rounded-2xl hover:shadow-2xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Users className="h-5 w-5 text-emerald-400" />
                </div>
                <CardTitle className="text-slate-50">Join Room</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Enter a room code to join
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="room-code"
                    className="text-sm font-medium text-slate-50"
                  >
                    Room Code
                  </Label>
                  <Input
                    id="room-code"
                    placeholder="ABC123"
                    className="rounded-lg focus-visible:ring-emerald-500 bg-slate-800 border-slate-700 text-slate-50 uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full rounded-lg bg-transparent border-slate-700 text-slate-50 hover:bg-slate-800 hover:text-slate-50"
                >
                  Join Room
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-50">Recent Rooms</h3>
          <div className="grid gap-4">
            {recentRooms.map((room) => (
              <Card
                key={room.id}
                className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-colors cursor-pointer rounded-2xl"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-semibold text-slate-50">
                        {room.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {room.participants}{" "}
                          {room.participants === 1
                            ? "participant"
                            : "participants"}
                        </span>
                        <span>Last active {room.lastActive}</span>
                      </div>
                    </div>
                    <Button
                      asChild
                      className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-base font-semibold shadow-md transition-all"
                    >
                      <Link href={`/room/${room.id}`}>Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
