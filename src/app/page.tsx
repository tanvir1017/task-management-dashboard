"use client";

import ComponentCard from "@/components/common/ComponentCard";
import { ProtectedRoute } from "@/components/protected-route";
import BasicTableOne from "@/components/tables/BasicTableOne";
import AdminLayout from "@/layout/AdminLayout";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="">
          <ComponentCard title="All Tasks">
            <BasicTableOne />
          </ComponentCard>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}