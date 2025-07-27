import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { SignInForm } from "./SignInForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  pendingAction?: {
    image: any;
    action: 'add' | 'remove';
  } | null;
}

export function SignInModal({
  isOpen,
  onClose,
  title = "Sign in",
  message = "",
  pendingAction = null
}: SignInModalProps) {
  const { isAuthenticated } = useConvexAuth();

  // Auto-close modal when user successfully signs in
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const getActionMessage = () => {
    if (!pendingAction) return message;

    const actionText = pendingAction.action === 'add' ? 'add to favorites' : 'remove from favorites';
    return `Sign in to ${actionText} and access your saved images.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {getActionMessage()}
          </DialogDescription>
        </DialogHeader>
        <SignInForm />
      </DialogContent>
    </Dialog>
  );
}