import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useAction } from "convex/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { api } from "../../convex/_generated/api";

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
    const validateEmail = useAction(api.myFunctions.validateEmailForSignup);
    const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        password?: string;
    }>({});
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const validateForm = async (formData: FormData) => {
        const errors: { email?: string; password?: string } = {};
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Basic email format validation
        if (!email) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        } else if (flow === "signUp") {
            // Use backend validation for signup only
            try {
                const validation = await validateEmail({ email });
                if (!validation.isValid) {
                    errors.email = validation.reason || "Invalid email address";
                }
            } catch (error) {
                console.error("Email validation error:", error);
                // Fallback to basic validation if backend validation fails
            }
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

        // Client-side validation (now includes backend validation for signup)
        if (!(await validateForm(formData))) {
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

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        setError(null);
        try {
            await signIn("google");
        } catch (error: any) {
            setError("Failed to sign in with Google. Please try again.");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const formFields = (
        <div className="space-y-4">
            {/* Google OAuth Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full h-11 text-base font-medium"
                onClick={() => {
                    void handleGoogleSignIn();
                }}
                disabled={isLoading || isGoogleLoading}
            >
                {isGoogleLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in with Google...
                    </>
                ) : (
                    <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </>
                )}
            </Button>

            {/* Divider */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with email
                    </span>
                </div>
            </div>

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