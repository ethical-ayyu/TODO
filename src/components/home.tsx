import React, { useState, useEffect } from "react";
import { Toaster } from "./ui/toaster";
import Header from "./layout/Header";
import AuthContainer from "./auth/AuthContainer";
import TaskDashboard from "./tasks/TaskDashboard";
import NotificationToast from "./notifications/NotificationToast";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | string;
}

const Home = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<
    "upcoming" | "overdue"
  >("upcoming");
  const [notificationTask, setNotificationTask] = useState<Task | null>(null);

  // Check for authentication on component mount
  useEffect(() => {
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          if (session) {
            // Get user profile from the users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select()
              .eq("id", session.user.id)
              .single();

            if (userError && userError.code !== "PGRST116") {
              // PGRST116 is the error code for no rows returned
              console.error("Error fetching user data:", userError);
            }

            // If user doesn't exist in the users table but exists in auth, create a profile
            if (!userData && !userError) {
              const { error: insertError } = await supabase
                .from("users")
                .insert({
                  id: session.user.id,
                  name:
                    session.user.user_metadata.name ||
                    session.user.email?.split("@")[0] ||
                    "User",
                  email: session.user.email || "",
                });

              if (insertError) {
                console.error("Error creating user profile:", insertError);
              }
            }

            setIsAuthenticated(true);
            setUser({
              id: session.user.id,
              name:
                userData?.name ||
                session.user.user_metadata.name ||
                session.user.email?.split("@")[0] ||
                "User",
              email: session.user.email || "",
              avatarUrl: userData?.avatar_url || undefined,
            });

            // Fetch tasks for the user
            fetchUserTasks(session.user.id);
          }
        } else if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setUser(null);
          setTasks([]);
          setIsLoading(false);
        }
      },
    );

    // Initial check for session
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setIsLoading(false);
          return;
        }

        if (session) {
          // Get user profile from the users table
          const { data: userData } = await supabase
            .from("users")
            .select()
            .eq("id", session.user.id)
            .single();

          setIsAuthenticated(true);
          setUser({
            id: session.user.id,
            name:
              userData?.name ||
              session.user.user_metadata.name ||
              session.user.email?.split("@")[0] ||
              "User",
            email: session.user.email || "",
            avatarUrl: userData?.avatar_url || undefined,
          });

          // Fetch tasks for the user
          await fetchUserTasks(session.user.id);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    };

    // Check for saved theme preference
    const savedTheme = localStorage.getItem("taskflow_theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    // Set a timeout to ensure loading screen doesn't get stuck
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    checkAuth();

    return () => {
      clearTimeout(loadingTimeout);
    };

    // Set up a timer to show notifications (for demo purposes) - only once
    const notificationTimer = setTimeout(() => {
      if (isAuthenticated && tasks.length > 0 && !showNotification) {
        // Show an upcoming task notification
        const upcomingTask = tasks.find(
          (task) => !task.completed && new Date(task.dueDate) > new Date(),
        );
        if (upcomingTask) {
          setNotificationTask(upcomingTask);
          setNotificationType("upcoming");
          setShowNotification(true);
        }
      }
    }, 3000);

    return () => {
      clearTimeout(notificationTimer);
      authListener.subscription.unsubscribe();
    };
  }, [isAuthenticated, tasks]);

  // Handle login
  const handleLogin = async (values: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setIsLoading(true);
    setAuthError("");

    try {
      // Use Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        // Get user profile from the users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select()
          .eq("id", data.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        }

        setIsAuthenticated(true);
        setUser({
          id: data.user.id,
          name: userData?.name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || "",
          avatarUrl: userData?.avatar_url || undefined,
        });

        // Save authentication state to localStorage if rememberMe is checked
        if (values.rememberMe) {
          localStorage.setItem("taskflow_authenticated", "true");
        }

        toast({
          title: "Login successful",
          description: "Welcome back to TaskFlow!",
        });

        // Fetch tasks for the user
        fetchUserTasks(data.user.id);
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuthError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user tasks from Supabase
  const fetchUserTasks = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }

      if (data) {
        // Convert the tasks to the format expected by the app
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          completed: task.completed || false,
          dueDate: task.due_date,
        }));

        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup
  const handleSignup = async (values: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setAuthError("");

    try {
      // Use Supabase auth to create a new user
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            name: values.name,
          },
          emailRedirectTo: window.location.origin + "/auth/callback",
        },
      });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (data.user) {
        // User profile will be created automatically by the database trigger
        // We'll just check if it exists and create it if needed as a fallback
        const { data: existingUser, error: checkError } = await supabase
          .from("users")
          .select()
          .eq("id", data.user.id)
          .single();

        if (checkError && checkError.code === "PGRST116") {
          // User doesn't exist, create manually as fallback
          const { error: profileError } = await supabase.from("users").insert({
            id: data.user.id,
            name: values.name,
            email: values.email,
          });

          if (profileError) {
            console.error("Error creating user profile:", profileError);
            setAuthError("Error creating user profile");
            return;
          }
        } else if (checkError) {
          console.error("Error checking user profile:", checkError);
        }

        setIsAuthenticated(true);
        setUser({
          id: data.user.id,
          name: values.name,
          email: values.email,
        });

        // Save authentication state to localStorage
        localStorage.setItem("taskflow_authenticated", "true");

        toast({
          title: "Account created",
          description: "Welcome to TaskFlow!",
        });
      }
    } catch (error) {
      console.error("Signup error:", error);
      setAuthError("An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Use Supabase auth to sign out
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        return;
      }

      setIsAuthenticated(false);
      setUser(null);
      setTasks([]);
      localStorage.removeItem("taskflow_authenticated");

      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle theme toggle
  const handleToggleTheme = () => {
    const newThemeState = !isDarkMode;
    setIsDarkMode(newThemeState);

    if (newThemeState) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("taskflow_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("taskflow_theme", "light");
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      {isAuthenticated && (
        <Header
          user={user || undefined}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          ) : isAuthenticated ? (
            <TaskDashboard initialTasks={tasks} isLoading={isLoading} />
          ) : (
            <AuthContainer
              onLogin={handleLogin}
              onSignup={handleSignup}
              isLoading={isLoading}
              error={authError}
            />
          )}
        </div>
      </main>

      {/* Notification Toast */}
      {showNotification && notificationTask && (
        <NotificationToast
          type={notificationType}
          taskName={notificationTask.title}
          dueDate={notificationTask.dueDate}
          onClose={handleCloseNotification}
          open={showNotification}
        />
      )}

      {/* Toast Container */}
      <Toaster />
    </div>
  );
};

export default Home;
