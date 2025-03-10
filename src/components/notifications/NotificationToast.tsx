import React from "react";
import { Bell, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toast, ToastClose, ToastDescription, ToastTitle } from "../ui/toast";

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
  // Format the due date
  const formattedDate =
    typeof dueDate === "string"
      ? dueDate
      : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Toast
      className={cn(
        "bg-white dark:bg-gray-800 border",
        type === "upcoming"
          ? "border-blue-200 dark:border-blue-800"
          : "border-red-200 dark:border-red-800",
      )}
      open={open}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full",
            type === "upcoming"
              ? "bg-blue-100 dark:bg-blue-900"
              : "bg-red-100 dark:bg-red-900",
          )}
        >
          {type === "upcoming" ? (
            <Clock
              className="h-5 w-5 text-blue-600 dark:text-blue-300"
              aria-hidden="true"
            />
          ) : (
            <AlertTriangle
              className="h-5 w-5 text-red-600 dark:text-red-300"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex-1">
          <ToastTitle
            className={cn(
              "font-medium",
              type === "upcoming"
                ? "text-blue-800 dark:text-blue-300"
                : "text-red-800 dark:text-red-300",
            )}
          >
            {title}
          </ToastTitle>
          <ToastDescription className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </ToastDescription>
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
      </div>
      <ToastClose onClick={onClose} />
    </Toast>
  );
};

export default NotificationToast;
