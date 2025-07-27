import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

interface SignInFormProps {
  showHeader?: boolean;
  showCard?: boolean;
  title?: string;
  description?: string;
}

export function SignInForm({
  showHeader = true,
  showCard = true,
  title = "ZyMerge",
  description = "Where creators connect and content flows"
}: SignInFormProps) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateForm = (formData: FormData) => {
    const errors: { email?: string; password?: string } = {};
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Email validation
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!password) {
      errors.password = "Password is required";
    } else if (flow === "signUp" && password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.target as HTMLFormElement);

    // Client-side validation
    if (!validateForm(formData)) {
      setIsLoading(false);
      return;
    }

    try {
      formData.set("flow", flow);
      await signIn("password", formData);
    } catch (error: any) {
      // Convert technical error messages to user-friendly ones
      let userFriendlyError = "An error occurred. Please try again.";

      if (error.message) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes("invalid email") || errorMessage.includes("email format")) {
          userFriendlyError = "Please enter a valid email address.";
          setFieldErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
        } else if (errorMessage.includes("password") && errorMessage.includes("weak")) {
          userFriendlyError = "Password must be at least 8 characters long.";
          setFieldErrors(prev => ({ ...prev, password: "Password must be at least 8 characters long" }));
        } else if (errorMessage.includes("password") && errorMessage.includes("required")) {
          userFriendlyError = "Password is required.";
          setFieldErrors(prev => ({ ...prev, password: "Password is required" }));
        } else if (errorMessage.includes("email") && errorMessage.includes("required")) {
          userFriendlyError = "Email is required.";
          setFieldErrors(prev => ({ ...prev, email: "Email is required" }));
        } else if (errorMessage.includes("already exists") || errorMessage.includes("already registered")) {
          userFriendlyError = "An account with this email already exists. Please sign in instead.";
          setFieldErrors(prev => ({ ...prev, email: "Account already exists" }));
        } else if (errorMessage.includes("invalid credentials") || errorMessage.includes("wrong password")) {
          userFriendlyError = "Invalid email or password. Please check your credentials.";
          setFieldErrors(prev => ({
            ...prev,
            email: "Invalid email or password",
            password: "Invalid email or password"
          }));
        } else if (errorMessage.includes("user not found")) {
          userFriendlyError = "No account found with this email. Please sign up instead.";
          setFieldErrors(prev => ({ ...prev, email: "No account found" }));
        } else if (errorMessage.includes("network") || errorMessage.includes("connection")) {
          userFriendlyError = "Network error. Please check your connection and try again.";
        } else if (errorMessage.includes("rate limit") || errorMessage.includes("too many requests")) {
          userFriendlyError = "Too many attempts. Please wait a moment and try again.";
        } else {
          // For other errors, show a more generic but helpful message
          userFriendlyError = "Unable to complete sign in. Please check your details and try again.";
        }
      }

      setError(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = (
    <div className="space-y-4">
      <form
        className="space-y-4"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className={`pl-10 ${fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={isLoading}
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className={`pl-10 pr-10 ${fieldErrors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {fieldErrors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {flow === "signIn" ? "Signing in..." : "Signing up..."}
            </>
          ) : (
            flow === "signIn" ? "Sign in" : "Sign up"
          )}
        </Button>
      </form>

      <div className="flex items-center justify-center gap-1 text-sm">
        <span className="text-muted-foreground">
          {flow === "signIn"
            ? "No account?"
            : "Have an account?"}
        </span>
        <Button
          variant="link"
          className="p-0 h-auto font-normal text-primary hover:text-primary/80"
          onClick={() => {
            setFlow(flow === "signIn" ? "signUp" : "signIn");
            setError(null);
          }}
          disabled={isLoading}
        >
          {flow === "signIn" ? "Sign up" : "Sign in"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start space-x-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4 text-sm">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-200 mb-1">
              {flow === "signIn" ? "Sign In Failed" : "Sign Up Failed"}
            </p>
            <p className="text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  if (!showCard) {
    return (
      <div className="w-full max-w-md mx-auto">
        {formFields}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Card className="w-full max-w-md">
        {showHeader && (
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <Badge variant="secondary">Beta</Badge>
            </div>
            <CardDescription>
              {description}
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className={showHeader ? '' : 'pt-6'}>
          {formFields}
        </CardContent>
      </Card>
    </div>
  );
}