import { useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { SignInForm } from "./SignInForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  title = "Sign in to ZyMerge",
  message = "",
  pendingAction = null
}: SignInModalProps) {
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
    }
  }, [isAuthenticated, isOpen, onClose]);

  const getActionMessage = () => {
    if (!pendingAction) return message || "Where creators connect and content flows.";

    const actionText = pendingAction.action === 'add' ? 'add to favorites' : 'remove from favorites';
    return `Sign in to ${actionText} and access your saved images.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay
          className="fixed inset-0 z-50"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'none'
          }}
        />
        <DialogContent
          className="sm:max-w-md border border-gray-700 shadow-lg"
          style={{
            backgroundColor: '#1f1f1f',
            color: '#ffffff',
            backgroundImage: 'none',
            backdropFilter: 'none'
          }}
        >
          <DialogHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <DialogDescription className="text-center">
              {getActionMessage()}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <SignInForm showHeader={false} showCard={false} />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}