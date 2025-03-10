import React, { useState } from "react";
import TaskInput from "./TaskInput";
import TaskFilterTabs from "./TaskFilterTabs";
import TaskList from "./TaskList";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date | string;
}

interface TaskDashboardProps {
  isLoading?: boolean;
  initialTasks?: Task[];
}

const TaskDashboard = ({
  isLoading = false,
  initialTasks = [
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
    {
      id: "task-4",
      title: "Update project roadmap",
      completed: false,
      dueDate: new Date(Date.now() + 259200000), // 3 days from now
    },
  ],
}: TaskDashboardProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "pending" | "completed"
  >("all");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Calculate task counts for filter tabs
  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter((task) => !task.completed).length,
    completed: tasks.filter((task) => task.completed).length,
  };

  // Handle adding a new task
  const handleAddTask = async (newTaskData: {
    title: string;
    dueDate: Date | null;
  }) => {
    console.log("Adding task:", newTaskData);
    try {
      // Get current user
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session) {
        console.error("No active session found");
        toast({
          title: "Authentication required",
          description: "You must be logged in to add tasks.",
          variant: "destructive",
        });
        return;
      }

      console.log("User ID:", session.user.id);

      // Insert task into Supabase
      const { data: insertedTask, error: insertError } = await supabase
        .from("tasks")
        .insert({
          user_id: session.user.id,
          title: newTaskData.title,
          completed: false,
          due_date: newTaskData.dueDate
            ? newTaskData.dueDate.toISOString()
            : new Date(Date.now() + 86400000).toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error adding task:", insertError);
        toast({
          title: "Error",
          description: "Failed to add task. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (insertedTask) {
        const newTask: Task = {
          id: insertedTask.id,
          title: insertedTask.title,
          completed: insertedTask.completed || false,
          dueDate: insertedTask.due_date,
        };

        setTasks([...tasks, newTask]);
        toast({
          title: "Task added",
          description: `"${insertedTask.title}" has been added to your tasks.`,
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle toggling task completion status
  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      // Update task in Supabase
      const { error } = await supabase
        .from("tasks")
        .update({ completed })
        .eq("id", id);

      if (error) {
        console.error("Error updating task:", error);
        toast({
          title: "Error",
          description: "Failed to update task. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setTasks(
        tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
      );

      const taskTitle = tasks.find((task) => task.id === id)?.title;
      toast({
        title: completed ? "Task completed" : "Task marked as pending",
        description: `"${taskTitle}" has been ${completed ? "completed" : "marked as pending"}.`,
      });
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle editing a task
  const handleEditTask = (id: string) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setEditingTask(taskToEdit);
      setTaskTitle(taskToEdit.title);
      setTaskDueDate(
        typeof taskToEdit.dueDate === "string"
          ? new Date(taskToEdit.dueDate)
          : taskToEdit.dueDate,
      );
    }
  };

  // Handle saving edited task
  const handleSaveEditedTask = async () => {
    if (editingTask && taskTitle.trim()) {
      try {
        const updatedTask = {
          ...editingTask,
          title: taskTitle,
          dueDate: taskDueDate || new Date(),
        };

        // Update task in Supabase
        const { error } = await supabase
          .from("tasks")
          .update({
            title: taskTitle,
            due_date: taskDueDate
              ? taskDueDate.toISOString()
              : new Date().toISOString(),
          })
          .eq("id", editingTask.id);

        if (error) {
          console.error("Error updating task:", error);
          toast({
            title: "Error",
            description: "Failed to update task. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Update local state
        setTasks(
          tasks.map((task) =>
            task.id === updatedTask.id ? updatedTask : task,
          ),
        );
        setEditingTask(null);
        toast({
          title: "Task updated",
          description: `"${updatedTask.title}" has been updated.`,
        });
      } catch (error) {
        console.error("Error saving edited task:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle deleting a task
  const handleDeleteTask = (id: string) => {
    setDeletingTaskId(id);
  };

  // Handle confirming task deletion
  const handleConfirmDelete = async () => {
    if (deletingTaskId) {
      try {
        const taskTitle = tasks.find(
          (task) => task.id === deletingTaskId,
        )?.title;

        // Delete task from Supabase
        const { error } = await supabase
          .from("tasks")
          .delete()
          .eq("id", deletingTaskId);

        if (error) {
          console.error("Error deleting task:", error);
          toast({
            title: "Error",
            description: "Failed to delete task. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Update local state
        setTasks(tasks.filter((task) => task.id !== deletingTaskId));
        setDeletingTaskId(null);
        toast({
          title: "Task deleted",
          description: `"${taskTitle}" has been deleted.`,
          variant: "destructive",
        });
      } catch (error) {
        console.error("Error confirming task deletion:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-100 dark:bg-gray-900 rounded-xl shadow-sm">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks and stay organized
        </p>
      </div>

      {/* Task Input Form */}
      <TaskInput onAddTask={handleAddTask} />

      {/* Filter Tabs */}
      <TaskFilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        taskCounts={taskCounts}
      />

      {/* Task List */}
      <TaskList
        tasks={tasks}
        isLoading={false}
        filter={activeFilter}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Edit Task Dialog - Inline implementation */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="task-title" className="text-sm font-medium">
                Task Title
              </label>
              <Input
                id="task-title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="due-date" className="text-sm font-medium">
                Due Date
              </label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !taskDueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {taskDueDate ? format(taskDueDate, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={taskDueDate}
                    onSelect={(date) => {
                      setTaskDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog - Inline implementation */}
      <AlertDialog
        open={!!deletingTaskId}
        onOpenChange={(open) => !open && setDeletingTaskId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTaskId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TaskDashboard;
