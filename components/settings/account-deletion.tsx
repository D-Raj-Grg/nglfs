"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/auth-context";

export function AccountDeletion() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      toast.error('Please type "DELETE" to confirm');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Failed to delete account");
        return;
      }

      toast.success("Account deleted successfully");

      // Sign out and redirect to home
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-red-500/20 rounded-lg p-6 bg-red-500/5">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-full bg-red-500/10">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">Danger Zone</h3>
          <p className="text-gray-400 mb-4">
            Once you delete your account, there is no going back. This action cannot be undone.
          </p>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-500">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </DialogTitle>
                <DialogDescription className="space-y-4 pt-4">
                  <p>
                    This will permanently delete your account and all associated data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Your profile and username</li>
                    <li>All messages you&apos;ve received</li>
                    <li>Your analytics and statistics</li>
                    <li>Your avatar and uploaded files</li>
                  </ul>
                  <p className="font-semibold text-white">
                    This action cannot be undone!
                  </p>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-white">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="confirm"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="font-mono"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    setConfirmText("");
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={confirmText !== "DELETE" || isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Forever
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
