"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShieldCloseIcon } from "lucide-react";
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <ShieldCloseIcon className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center pt-1">
            {featureName
              ? `You need to be logged in to use the ${featureName} feature`
              : "You need to be logged in to use this feature"}
          </DialogDescription>
        </DialogHeader>
        <div className="px-2">
          <p className="text-sm text-center text-gray-500 leading-relaxed">
            Please sign in to your account to continue and save your weather
            reports. Your data will be securely stored for future access.
          </p>
        </div>
        <DialogFooter className="flex sm:justify-center gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleLogin}>Sign In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
