import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface TaskDeleteDialogProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  taskId?: string;
  taskTitle?: string;
  onConfirm?: (id: string) => void;
  onCancel?: () => void;
}

const TaskDeleteDialog = ({
  isOpen = true,
  onOpenChange = () => {},
  taskId = "task-1",
  taskTitle = "Complete project documentation",
  onConfirm = () => {},
  onCancel = () => {},
}: TaskDeleteDialogProps) => {
  const handleConfirm = () => {
    onConfirm(taskId);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-800">
        <AlertDialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-300" />
          </div>
          <AlertDialogTitle className="text-center text-gray-900 dark:text-gray-100">
            Delete Task
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-gray-500 dark:text-gray-400">
            Are you sure you want to delete "{taskTitle}"? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel
            onClick={handleCancel}
            className="w-full sm:w-auto border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TaskDeleteDialog;
