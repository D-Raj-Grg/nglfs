import Link from "next/link";
import { MagicCard } from "@/components/ui/magic-card";
import { Particles } from "@/components/ui/particles";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
      {/* Animated Background */}
      <Particles
        className="absolute inset-0 z-0"
        quantity={50}
        ease={80}
        color="#8B5CF6"
        refresh={false}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg">
        <MagicCard className="p-12">
          <div className="text-center space-y-6">
            {/* 404 Icon */}
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-white" />
            </div>

            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Profile Not Found
              </h1>
              <p className="text-gray-400">
                This user doesn't exist or the username was typed incorrectly.
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-gray-800/50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-300 mb-2">Double check:</p>
              <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                <li>The username spelling</li>
                <li>That the profile hasn't been deleted</li>
                <li>The URL you entered</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button variant="outline" className="w-full">
                  Create Profile
                </Button>
              </Link>
            </div>
          </div>
        </MagicCard>
      </div>
    </div>
  );
}
