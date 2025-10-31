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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Collabo</h1>
          </div>
          <Button variant="ghost" size="sm">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="mb-12 space-y-2">
          <h2 className="text-4xl font-bold text-foreground">Welcome back!</h2>
          <p className="text-lg text-muted-foreground">
            Start collaborating on code in real-time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Create Room</CardTitle>
              </div>
              <CardDescription>
                Start a new collaboration session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-name">Room Name</Label>
                  <Input
                    id="room-name"
                    placeholder="My Awesome Project"
                    className="rounded-lg"
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg" asChild>
                  <Link href="/room/new-room">Create Room</Link>
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Join Room</CardTitle>
              </div>
              <CardDescription>Enter a room code to join</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="room-code">Room Code</Label>
                  <Input
                    id="room-code"
                    placeholder="ABC123"
                    className="rounded-lg uppercase"
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full rounded-lg bg-transparent"
                >
                  Join Room
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Recent Rooms</h3>
          <div className="grid gap-4">
            {recentRooms.map((room) => (
              <Card
                key={room.id}
                className="border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-lg font-semibold text-foreground">
                        {room.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                    <Button asChild className="rounded-lg">
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
