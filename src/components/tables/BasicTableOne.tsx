"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

import { useAuth } from "@/context/auth-context";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getUsers,
  updateTask,
  updateTaskStatus,
} from "@/lib/api-client";
import type { Task } from "@/lib/types";
import { type FormEvent, useState } from "react";
import { Toaster, toast } from "sonner";
import useSWR from "swr";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import Pagination from "./Pagination";

interface BasicTableOneProps {
  hideCreateButton?: boolean;
  showCreateModal?: boolean;
  onShowCreateModal?: (show: boolean) => void;
}

export default function BasicTableOne({
  hideCreateButton = false,
  showCreateModal: controlledShowCreateModal,
  onShowCreateModal,
}: BasicTableOneProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    status: "PENDING",
    assigneeId: "",
  });
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    status: "PENDING",
  });
  const { user } = useAuth();
  const showCreateModal = controlledShowCreateModal ?? internalShowCreateModal;
  const setShowCreateModal = onShowCreateModal ?? setInternalShowCreateModal;

  const {
    data: taskData,
    error: tasksError,
    isLoading: tasksLoading,
    mutate: mutateTasks,
  } = useSWR(
    ["tasks", searchQuery, statusFilter, currentPage, pageSize],
    () =>
      getAllTasks({
        search: searchQuery || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        limit: pageSize,
      }),
  );

  const { data: users } = useSWR(showCreateModal ? "users" : null, getUsers);
  const tasks = taskData?.result ?? [];
  const totalPages = taskData?.meta?.totalPages ?? 1;

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
    });
    setShowEditModal(true);
  };

  const handleDelete = (task: Task) => {
    setSelectedTask(task);
    setShowDeleteModal(true);
  };

  const handleHistory = (task: Task) => {
    setSelectedTask(task);
    setShowHistorySidebar(true);
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setIsCreatingTask(true);
    try {
      await createTask({
        title: createForm.title,
        description: createForm.description || undefined,
        assignedToId: parseInt(createForm.assigneeId),
      });
      await mutateTasks();
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        status: "PENDING",
        assigneeId: "",
      });
      toast.success("Task created successfully");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to create task";
      toast.error(message);
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;

    setIsDeletingTask(true);
    try {
      await deleteTask(selectedTask.id);
      await mutateTasks();
      setShowDeleteModal(false);
      setSelectedTask(null);
      toast.success("Task deleted successfully");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to delete task";
      toast.error(message);
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleUpdateTask = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedTask) return;

    setIsUpdatingTask(true);
    try {
      await updateTask(selectedTask.id, {
        title: editForm.title,
        description: editForm.description || undefined,
      });

      if (selectedTask.status !== editForm.status) {
        await updateTaskStatus(selectedTask.id, {
          status: editForm.status as Task["status"],
        });
      }

      await mutateTasks();
      setShowEditModal(false);
      setSelectedTask(null);
      toast.success("Task updated successfully");
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Failed to update task";
      toast.error(message);
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowHistorySidebar(false);
    setShowCreateModal(false);
    setSelectedTask(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_PROGRESS":
        return "info";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "primary";
    }
  };

  const formatReadableDateTime = (value: Date | string) => {
    return new Date(value)
      .toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" AM", " am")
      .replace(" PM", " pm");
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <Toaster position="top-center" richColors />

      {!hideCreateButton && (user?.role === "ADMIN" || user?.role === "SYSTEM_ADMIN") && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            Create Task
          </Button>
        </div>
      )}

      {(tasksLoading || tasksError) && (
        <div className="px-5 pt-4 text-sm text-gray-500 dark:text-gray-400">
          {tasksLoading ? "Loading tasks..." : "Failed to load tasks"}
        </div>
      )}

      <div className="px-4 pt-4">
        <form
          onSubmit={handleApplyFilters}
          className="flex flex-col gap-3 md:flex-row md:items-end"
        >
          <div className="w-full md:max-w-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title or description"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="w-full md:max-w-[220px]">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setStatusFilter(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm">
              Search
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleResetFilters}>
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Task Title
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Creator
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Assignee
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Created
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white/90">{task.title}</div>
                      {task.description && <div className="text-xs text-gray-500">{task.description}</div>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 overflow-hidden rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(task.creator?.fullName || task.creator?.email || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {task.creator?.fullName || "Unknown"}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {task.creator?.email || ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 overflow-hidden rounded-full bg-brand-500 flex items-center justify-center text-white font-semibold text-sm">
                        {task.assignee ? (task.assignee.fullName || task.assignee.email)[0].toUpperCase() : "U"}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {task.assignee ? task.assignee.fullName || "Unassigned" : "Unassigned"}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          {task.assignee ? task.assignee.email : ""}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge size="sm" color={getStatusColor(task.status)}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {formatReadableDateTime(task.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(task)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(task)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleHistory(task)}
                        className="bg-gray-600 hover:bg-gray-700"
                      >
                        History
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!tasksLoading && !tasksError && tasks.length === 0 && (
                <TableRow>
                  <TableCell className="px-4 py-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    No tasks found.
                  </TableCell>
                  <TableCell className="px-4 py-6"> </TableCell>
                  <TableCell className="px-4 py-6"> </TableCell>
                  <TableCell className="px-4 py-6"> </TableCell>
                  <TableCell className="px-4 py-6"> </TableCell>
                  <TableCell className="px-4 py-6"> </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-4 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={closeModals} className="mx-4 max-w-2xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Task</h2>
          {selectedTask && (
            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeModals}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingTask}
                  className="disabled:opacity-60"
                >
                  {isUpdatingTask ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={closeModals} className="mx-4 max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Delete Task</h2>
          {selectedTask && (
            <p>Are you sure you want to delete "{selectedTask.title}"?</p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeletingTask}
              className="disabled:opacity-60"
            >
              {isDeletingTask ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* History Sidebar */}
      <Modal isOpen={showHistorySidebar} onClose={closeModals} className="mx-4 max-w-2xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Task History</h2>
          {selectedTask && (
            <div>
              <p>History logs for "{selectedTask.title}"</p>
              {/* Placeholder for history list */}
              <ul className="mt-4 space-y-2">
                <li>2023-10-01: Task created</li>
                <li>2023-10-02: Status changed to In Progress</li>
                <li>2023-10-05: Assignee updated</li>
              </ul>
            </div>
          )}
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={closeModals}
        className="mx-4 max-w-2xl"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Create New Task</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Assignee</label>
              <select
                value={createForm.assigneeId}
                onChange={(e) => setCreateForm({ ...createForm, assigneeId: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                required
              >
                <option value="">Select Assignee</option>
                {users?.filter((u) => u.id !== Number(user?.id)).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeModals}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingTask} className="disabled:opacity-60">
                {isCreatingTask ? "Creating..." : "Create Task"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
