import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

interface AuthContainerProps {
  onLogin?: (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => void;
  onSignup?: (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  onForgotPassword?: (values: { email: string }) => void;
  isLoading?: boolean;
  error?: string;
  defaultTab?: "login" | "signup";
}

const AuthContainer = ({
  onLogin = () => {},
  onSignup = () => {},
  onForgotPassword = () => {},
  isLoading = false,
  error = "",
  defaultTab = "login",
}: AuthContainerProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState("");

  const handleForgotPassword = (values: { email: string }) => {
    onForgotPassword(values);
    setForgotPasswordSuccess(
      "Password reset link has been sent to your email.",
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-gray-100">
          TaskFlow
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          A simple task management application to boost your productivity
        </p>

        {showForgotPassword ? (
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            onBack={() => setShowForgotPassword(false)}
            isLoading={isLoading}
            error={error}
            success={forgotPasswordSuccess}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "login" | "signup")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-0">
              <LoginForm
                onSubmit={onLogin}
                isLoading={isLoading}
                error={activeTab === "login" ? error : ""}
                onForgotPasswordClick={() => setShowForgotPassword(true)}
              />
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <SignupForm
                onSubmit={onSignup}
                isLoading={isLoading}
                error={activeTab === "signup" ? error : ""}
                onLoginClick={() => setActiveTab("login")}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          By using TaskFlow, you agree to our{" "}
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthContainer;
