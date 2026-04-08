"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import useSWR from "swr";

import { deleteAuditLog, getAuditLogs } from "@/lib/api-client";
import type { AuditActionType, AuditLog } from "@/lib/types";

import Button from "../ui/button/Button";
import { Modal } from "../ui/modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Pagination from "./Pagination";

const ACTION_TYPES: AuditActionType[] = [
  "CREATE_TASK",
  "UPDATE_TASK",
  "DELETE_TASK",
  "UPDATE_STATUS",
  "ASSIGN_TASK",
];

export default function AuditLogsTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getPositiveInt = (value: string | null, fallback: number) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
  };

  const getValidActionType = (value: string | null): "" | AuditActionType => {
    if (!value) return "";
    return ACTION_TYPES.includes(value as AuditActionType)
      ? (value as AuditActionType)
      : "";
  };

  const initialSearch = searchParams.get("search") ?? "";
  const initialActionType = getValidActionType(searchParams.get("actionType"));
  const initialPage = getPositiveInt(searchParams.get("page"), 1);
  const initialLimit = getPositiveInt(searchParams.get("limit"), 10);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [actionType, setActionType] = useState<"" | AuditActionType>(initialActionType);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(initialLimit);

  const {
    data: auditData,
    isLoading,
    error,
    mutate,
  } = useSWR(
    ["audit-logs", searchQuery, actionType, currentPage, pageSize],
    () =>
      getAuditLogs({
        search: searchQuery || undefined,
        actionType: actionType || undefined,
        page: currentPage,
        limit: pageSize,
      }),
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (actionType) params.set("actionType", actionType);
    params.set("page", String(currentPage));
    params.set("limit", String(pageSize));

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, actionType, currentPage, pageSize, pathname, router]);

  const logs = auditData?.result ?? [];
  const totalPages = auditData?.meta?.totalPages ?? 1;

  const formatDateTime = (value: Date | string) => {
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

  const formatActionLabel = (value: string) => {
    return value
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const handleApplyFilters = (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setActionType("");
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowDeleteModal(false);
    setShowDetailsModal(false);
    setSelectedLog(null);
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;

    setIsDeleting(true);
    try {
      await deleteAuditLog(selectedLog.id);
      await mutate();
      closeModals();
      toast.success("Audit log deleted successfully");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete audit log";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const getActionBadgeClass = (value: string) => {
    if (value === "DELETE_TASK") return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    if (value === "CREATE_TASK") return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";
    if (value === "UPDATE_STATUS") return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
      <Toaster position="top-center" richColors />

      {error && (
        <div className="px-5 pt-4 text-sm text-gray-500 dark:text-gray-400">
          Failed to load audit logs
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
              placeholder="Search logs"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="w-full md:max-w-60">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => {
                setCurrentPage(1);
                setActionType(getValidActionType(e.target.value));
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {formatActionLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm">
              Search
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/5">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actor
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Target ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Timestamp
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
              {isLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`audit-skeleton-${index}`}>
                    <TableCell className="px-4 py-3">
                      <div className="animate-pulse space-y-2">
                        <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-36 rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="h-6 w-28 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="h-4 w-44 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex gap-2 animate-pulse">
                        <div className="h-9 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
                        <div className="h-9 w-16 rounded-lg bg-gray-200 dark:bg-gray-700" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/3"
                  onClick={() => openDetails(log)}
                >
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {log.actor?.fullName || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {log.actor?.email || "No email"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-start text-theme-sm">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getActionBadgeClass(log.actionType)}`}>
                      {formatActionLabel(log.actionType)}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {log.targetEntity}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                    {formatDateTime(log.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetails(log);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(log);
                        }}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && !error && logs.length === 0 && (
                <TableRow>
                  <TableCell className="px-4 py-6 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    No audit logs found.
                  </TableCell>
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
          {isLoading ? (
            <div className="h-10 w-64 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <Modal isOpen={showDetailsModal} onClose={closeModals} className="mx-4 max-w-2xl">
        <div className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Audit Log Details</h2>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Action
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatActionLabel(selectedLog.actionType)}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actor
                </p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {selectedLog.actor?.fullName || "Unknown User"} ({selectedLog.actor?.email || "No email"})
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Target ID
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedLog.targetEntity}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Timestamp
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(selectedLog.createdAt)}
                </p>
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payload
                </p>
                <pre className="max-h-64 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {JSON.stringify(selectedLog.payload, null, 2)}
                </pre>
              </div>

              <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={closeModals}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={closeModals} className="mx-4 max-w-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Delete Audit Log</h2>
          {selectedLog && (
            <p>
              Are you sure you want to delete this log entry for
              {" "}<strong>{formatActionLabel(selectedLog.actionType)}</strong>?
            </p>
          )}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={closeModals}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteLog}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
