"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LockIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnUrl: string;
  featureName?: string;
}

export function AuthModal({
  isOpen,
  onClose,
  returnUrl,
  featureName,
}: AuthModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2 text-amber-500">
            <LockIcon size={30} />
          </div>
          <DialogTitle className="text-center">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center">
            {featureName
              ? `You need to be logged in to use the ${featureName} feature`
              : "You need to be logged in to use this feature"}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <p className="text-sm text-center text-gray-500">
            Please sign in to your account to continue and save your weather
            reports.
          </p>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLogin}>Sign In</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
