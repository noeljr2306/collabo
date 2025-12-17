"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // Use Next.js router
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Plus, Users, Copy, Check } from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleOpenCreateModal = () => {
    setRoomName(""); // Reset the name field for a fresh start
    setIsCreateModalOpen(true);
  };

  const handleCopyCode = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const createRoom = useMutation(api.room.create);
  const recentRooms = useQuery(api.room.getRecent) || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");

  const handleCreateRoom = async () => {
    const result = await createRoom({ name: roomName });
    setGeneratedCode(result.roomCode);
    // You can now show this code in the modal with a Copy button
    // OR just redirect immediately:
    router.push(`/room/${result.roomCode}`);
  };

  const handleJoinRoom = () => {
    if (joinCode.length === 6) {
      router.push(`/room/${joinCode}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="fixed top-0 left-0 right-0 bg-slate-950/50 backdrop-blur-md border-b border-slate-800 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left Side: Logo & Title */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-emerald-500/20 p-2 rounded-lg">
              <Code2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-50">
              collabo<span className="text-emerald-400">.</span>
            </h1>
          </Link>

          {/* Right Side: User Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-slate-200">
                {user?.username || "Developer"}
              </span>
              <span className="text-xs text-slate-500">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>

            {/* Clerk User Button handles profile pic + sign out dropdown automatically */}
            <UserButton
              afterSignOutUrl="/auth/login"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-9 w-9 border border-emerald-500/50",
                },
              }}
            />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-24 max-w-6xl">
        {/* Welcome */}
        <div className="mb-12 space-y-2">
          <h2 className="text-5xl font-bold text-slate-50">Welcome back!</h2>
          <p className="text-lg text-slate-400">
            Start collaborating on code in real-time
          </p>
        </div>

        {/* Create / Join */}
        <Card className="bg-slate-900/50 border-slate-800 shadow-xl rounded-2xl mb-12">
          <CardContent className="p-8">
            <div className="flex flex-row gap-8">
              {/* Create Room Section */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <Plus className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-50">
                        Create Room
                      </h3>
                      <p className="text-sm text-slate-400">
                        Start a new session
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-300 text-sm">
                    Create your own collaboration space and invite others with a
                    unique room code.
                  </p>
                  <Button
                    onClick={handleOpenCreateModal}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold py-6 text-base"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Room
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-px h-full bg-slate-700/50"></div>
              </div>
              <div className="md:hidden flex items-center justify-center my-2">
                <div className="h-px w-full bg-slate-700/50"></div>
              </div>

              {/* Join Room Section */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <Users className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-50">
                        Join Room
                      </h3>
                      <p className="text-sm text-slate-400">
                        Enter an existing room
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-slate-300 text-sm">
                    Have a room code? Enter it below to join an active
                    collaboration session.
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label
                        htmlFor="room-code"
                        className="text-sm font-medium text-slate-50"
                      >
                        Room Code
                      </Label>
                      <Input
                        id="room-code"
                        placeholder="Enter 6-character code"
                        value={joinCode}
                        onChange={(e) =>
                          setJoinCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleJoinRoom();
                        }}
                        className="bg-slate-800 border-slate-700 text-slate-50 uppercase font-mono text-base h-12"
                        maxLength={6}
                      />
                    </div>
                    <Button
                      onClick={handleJoinRoom}
                      className="w-full border-2 border-emerald-500/50 bg-transparent hover:bg-emerald-500/10 text-slate-50 font-semibold py-6 text-base"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Join Room
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-50">Recent Rooms</h3>

          {recentRooms.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-800 rounded-2xl">
              <CardContent className="p-10 text-center">
                <p className="text-slate-400 text-lg">
                  No room joined or created yet
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Create or join a room to start collaborating
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {recentRooms.map((room) => (
                <Card
                  key={room._id} // Changed from room.id to room._id
                  className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-colors rounded-2xl"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-lg font-semibold text-slate-50">
                          {room.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span className="flex items-center gap-1 font-mono text-emerald-400">
                            {room.code}
                          </span>
                          <span className="text-xs text-slate-500">
                            Created{" "}
                            {new Date(room._creationTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
                      >
                        {/* We use room.code for the URL so the room page can find it */}
                        <Link href={`/room/${room.code}`}>Open</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Room Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Room
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Set up your collaboration space
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label
                htmlFor="project-name"
                className="text-sm font-medium text-slate-50"
              >
                Project Name
              </Label>
              <Input
                id="project-name"
                placeholder="My Awesome Project"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateRoom();
                }}
                className="bg-slate-800 border-slate-700 text-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-50">
                Room Code
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={generatedCode}
                  className="bg-slate-800 border-slate-700 text-slate-50 font-mono text-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyCode(generatedCode)}
                  className="border-slate-700 text-slate-50 hover:bg-slate-800"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Share this code with others to invite them
              </p>
            </div>

            <Button
              onClick={handleCreateRoom}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold"
            >
              Create Room
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
