import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface TaskFilterTabsProps {
  activeFilter?: "all" | "pending" | "completed";
  onFilterChange?: (filter: "all" | "pending" | "completed") => void;
  taskCounts?: {
    all: number;
    pending: number;
    completed: number;
  };
}

const TaskFilterTabs = ({
  activeFilter = "all",
  onFilterChange = () => {},
  taskCounts = { all: 12, pending: 8, completed: 4 },
}: TaskFilterTabsProps) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 p-2 rounded-lg mb-4 border border-gray-200 dark:border-gray-700">
      <Tabs
        defaultValue={activeFilter}
        value={activeFilter}
        onValueChange={(value) =>
          onFilterChange(value as "all" | "pending" | "completed")
        }
        className="w-full"
      >
        <TabsList className="w-full grid grid-cols-3 bg-gray-100 dark:bg-gray-700">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 transition-all"
          >
            All
            <span className="ml-1.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5">
              {taskCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 transition-all"
          >
            Pending
            <span className="ml-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5">
              {taskCounts.pending}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 transition-all"
          >
            Completed
            <span className="ml-1.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full px-2 py-0.5">
              {taskCounts.completed}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TaskFilterTabs;
