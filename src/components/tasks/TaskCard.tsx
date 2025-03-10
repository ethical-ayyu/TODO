import React from "react";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Pencil, Trash2, Calendar } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";

interface TaskCardProps {
  id?: string;
  title?: string;
  completed?: boolean;
  dueDate?: Date | string;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskCard = ({
  id = "task-1",
  title = "Complete project documentation",
  completed = false,
  dueDate = new Date(Date.now() + 86400000), // Tomorrow by default
  onToggleComplete = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: TaskCardProps) => {
  // Format the due date
  const formattedDate =
    typeof dueDate === "string"
      ? dueDate
      : dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  // Check if task is overdue
  const isOverdue =
    typeof dueDate !== "string" && dueDate < new Date() && !completed;

  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Checkbox
          id={`task-${id}`}
          checked={completed}
          onCheckedChange={() => onToggleComplete(id, !completed)}
          className="h-5 w-5"
        />
        <label
          htmlFor={`task-${id}`}
          className={`text-sm md:text-base cursor-pointer ${completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"}`}
        >
          {title}
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center mr-2">
          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
          <span
            className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}
          >
            {formattedDate}
          </span>
          {isOverdue && (
            <Badge variant="destructive" className="ml-2 text-xs py-0 px-1.5">
              Overdue
            </Badge>
          )}
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(id)}
              >
                <Pencil className="h-4 w-4 text-gray-500 hover:text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete task</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default TaskCard;
