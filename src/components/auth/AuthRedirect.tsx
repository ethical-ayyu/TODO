import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle auth redirect
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        navigate("/");
      }
    });

    // Check for hash parameters from email links
    const handleEmailConfirmation = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes("type=signup")) {
        try {
          // Process the email confirmation
          const { error } = await supabase.auth.getSession();
          if (error) throw error;
          navigate("/");
        } catch (error) {
          console.error("Error processing email confirmation:", error);
        }
      }
    };

    handleEmailConfirmation();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-solid border-blue-500 border-r-transparent mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Processing authentication...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default AuthRedirect;
