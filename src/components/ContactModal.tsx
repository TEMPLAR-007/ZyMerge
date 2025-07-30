import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Check, Crown, Zap, Send, Loader2 } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "convex/react";


interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  planType?: 'premium' | 'pro';
}

export function ContactModal({ isOpen, onClose, planType = 'premium' }: ContactModalProps) {
  const { isAuthenticated } = useConvexAuth();
  const submitContactRequest = useAction(api.email.submitContactRequest);
  
  // Get current user data if authenticated
  const currentUser = useQuery(api.myFunctions.getCurrentUser, isAuthenticated ? {} : "skip");
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-fill form when user data loads
  React.useEffect(() => {
    if (currentUser && isOpen) {
      setEmail(currentUser.email || "");
      setName(currentUser.name || "");
    }
  }, [currentUser, isOpen]);

  const planPrice = planType === 'premium' ? '$9.99' : '$19.99';
  const planIcon = planType === 'premium' ? Crown : Zap;
  const planColor = planType === 'premium' ? 'text-yellow-500' : 'text-purple-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      await submitContactRequest({
        email: email.trim(),
        name: name.trim() || undefined,
        requestedTier: planType,
        message: message.trim() || undefined,
      });
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit request:', error);
      alert('Failed to submit request. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setName("");
    setMessage("");
    setIsSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const PlanIcon = planIcon;

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
              <PlanIcon className={`h-6 w-6 ${planColor}`} />
              <DialogTitle className="text-xl">Upgrade to {planType.charAt(0).toUpperCase() + planType.slice(1)}</DialogTitle>
              <Badge variant="secondary" className="text-xs">Beta</Badge>
            </div>
            <DialogDescription className="text-center">
              Contact us to upgrade your account manually. We'll set you up within 24 hours!
            </DialogDescription>
          </DialogHeader>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Email Address <span className="text-red-400">*</span>
                  {isAuthenticated && (
                    <span className="text-xs text-green-400 ml-2">(from your account)</span>
                  )}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAuthenticated ? "Loading..." : "your@email.com"}
                  required
                  readOnly={isAuthenticated}
                  className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                    isAuthenticated 
                      ? 'bg-gray-700 border-gray-500 cursor-not-allowed' 
                      : 'bg-gray-800 border-gray-600 focus:border-blue-500'
                  }`}
                />
                {isAuthenticated && (
                  <p className="text-xs text-gray-400">
                    ✅ Using verified email from your account
                  </p>
                )}
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Message Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Additional Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Any specific requirements or questions..."
                  rows={3}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Plan Summary */}
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <PlanIcon className={`h-5 w-5 ${planColor}`} />
                    <span className="font-medium">{planType.charAt(0).toUpperCase() + planType.slice(1)} Plan</span>
                  </div>
                  <span className="font-bold text-lg">{planPrice}/month</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-2 pt-2">
                <Button
                  type="submit"
                  disabled={!email.trim() || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Upgrade Request
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>

              {/* Info */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">
                  🚀 We'll upgrade your account within 24 hours - no confirmation email needed!
                </p>
              </div>
            </form>
          ) : (
            /* Success State */
            <div className="mt-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-green-400" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-2">Request Sent Successfully! 🎉</h3>
                <p className="text-gray-300 mb-4">
                  We've received your upgrade request for the {planType.charAt(0).toUpperCase() + planType.slice(1)} plan.
                </p>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-green-300 mb-2">What happens next:</h4>
                  <ul className="text-sm text-green-200 space-y-1">
                    <li>✅ Our team has been notified of your request</li>
                    <li>⏱️ We'll process your upgrade within 24 hours</li>
                    <li>🚀 Your account will be upgraded automatically</li>
                    <li>💫 Start enjoying your enhanced features immediately!</li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}