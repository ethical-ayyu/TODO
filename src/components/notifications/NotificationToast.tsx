import React from "react";
import { Bell, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

type NotificationType = "upcoming" | "overdue";

interface NotificationToastProps {
  type?: NotificationType;
  title?: string;
  description?: string;
  taskName?: string;
  dueDate?: Date | string;
  onClose?: () => void;
  open?: boolean;
}

const NotificationToast = ({
  type = "upcoming",
  title = type === "upcoming" ? "Upcoming Task" : "Overdue Task",
  description = type === "upcoming"
    ? "You have a task due soon"
    : "This task is overdue",
  taskName = "Complete project documentation",
  dueDate = new Date(),
  onClose = () => {},
  open = true,
}: NotificationToastProps) => {
  const { toast } = useToast();

  // Format the due date
  const formattedDate =
    typeof dueDate === "string"
      ? dueDate
      : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Use the toast system instead of direct Toast component - with deduplication
  React.useEffect(() => {
    // Create a unique ID for this notification to prevent duplicates
    const notificationId = `${type}-${taskName}-${formattedDate}`;

    // Check if we've shown this notification already
    const shownNotifications = JSON.parse(
      localStorage.getItem("shown_notifications") || "[]",
    );
    const alreadyShown = shownNotifications.includes(notificationId);

    if (open && !alreadyShown) {
      // Add to shown notifications
      localStorage.setItem(
        "shown_notifications",
        JSON.stringify([...shownNotifications, notificationId].slice(-10)),
      ); // Keep last 10

      toast({
        title: title,
        description: (
          <div className="space-y-2">
            <p>{description}</p>
            <div className="mt-2 rounded-md bg-gray-50 dark:bg-gray-700 p-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {taskName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                <Bell className="h-3 w-3 mr-1" />
                Due: {formattedDate}
              </p>
            </div>
          </div>
        ),
        variant: type === "upcoming" ? "default" : "destructive",
        duration: 8000,
        onOpenChange: (open) => {
          if (!open && onClose) {
            onClose();
          }
        },
      });
    } else if (open) {
      // Still call onClose to prevent re-showing
      onClose();
    }
  }, [open, title, description, taskName, formattedDate, type, toast, onClose]);

  // Component doesn't render anything directly
  return null;
};

export default NotificationToast;
