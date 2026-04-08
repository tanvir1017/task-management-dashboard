"use client";

import ComponentCard from "@/components/common/ComponentCard";
import { ProtectedRoute } from "@/components/protected-route";
import AuditLogsTable from "@/components/tables/AuditLogsTable";
import AdminLayout from "@/layout/AdminLayout";

export default function AuditLogsPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SYSTEM_ADMIN"]}>
      <AdminLayout>
        <div>
          <ComponentCard title="Audit Logs">
            <AuditLogsTable />
          </ComponentCard>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
