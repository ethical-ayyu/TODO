import React from "react";
import TaskCard from "./TaskCard";
import { Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | string;
}

interface TaskListProps {
  tasks?: Task[];
  isLoading?: boolean;
  filter?: "all" | "pending" | "completed";
  onToggleComplete?: (id: string, completed: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TaskList = ({
  tasks = [
    {
      id: "task-1",
      title: "Complete project documentation",
      completed: false,
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    },
    {
      id: "task-2",
      title: "Review pull requests",
      completed: true,
      dueDate: new Date(Date.now() - 86400000), // Yesterday
    },
    {
      id: "task-3",
      title: "Prepare for team meeting",
      completed: false,
      dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
    },
  ],
  isLoading = false,
  filter = "all",
  onToggleComplete = () => {},
  onEdit = () => {},
  onDelete = () => {},
}: TaskListProps) => {
  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[300px]">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
      </div>
    );
  }

  // Empty state
  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 dark:bg-gray-900 rounded-lg min-h-[300px]">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No tasks found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filter === "all"
              ? "You don't have any tasks yet. Add one to get started!"
              : filter === "pending"
                ? "You don't have any pending tasks."
                : "You don't have any completed tasks."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[300px]">
      {filteredTasks.map((task) => (
        <TaskCard
          key={task.id}
          id={task.id}
          title={task.title}
          completed={task.completed}
          dueDate={task.dueDate}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
