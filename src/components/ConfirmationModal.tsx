import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
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
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive flex-shrink-0" />,
          confirmVariant: "destructive" as const
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 flex-shrink-0" />,
          confirmVariant: "default" as const
        };
      case 'info':
        return {
          icon: <Info className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />,
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
      <DialogPortal>
        <DialogOverlay 
          className="fixed inset-0 z-50" 
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'none'
          }} 
        />
        <DialogContent 
          className="w-[95vw] max-w-md mx-auto border border-gray-700 shadow-lg" 
          style={{ 
            backgroundColor: '#1f1f1f',
            color: '#ffffff',
            backgroundImage: 'none',
            backdropFilter: 'none'
          }}
        >
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 mb-2">
            {typeStyles.icon}
            <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm sm:text-base text-center sm:text-left">
            {message}
          </DialogDescription>
        </DialogHeader>

        {imageUrl && (
          <div className="flex justify-center py-2">
            <img
              src={imageUrl}
              alt={imageAlt || "Preview"}
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-border"
            />
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {cancelText}
          </Button>
          <Button 
            variant={typeStyles.confirmVariant} 
            onClick={handleConfirm}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {confirmText}
          </Button>
        </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}