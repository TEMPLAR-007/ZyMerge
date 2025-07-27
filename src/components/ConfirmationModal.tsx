import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  imageUrl?: string;
  imageAlt?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'warning',
  imageUrl,
  imageAlt
}: ConfirmationModalProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
          confirmVariant: "destructive" as const
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
          confirmVariant: "default" as const
        };
      case 'info':
        return {
          icon: <Info className="h-6 w-6 text-blue-600" />,
          confirmVariant: "default" as const
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {typeStyles.icon}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>

        {imageUrl && (
          <div className="flex justify-center">
            <img
              src={imageUrl}
              alt={imageAlt || "Preview"}
              className="w-20 h-20 object-cover rounded-lg border"
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={typeStyles.confirmVariant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}