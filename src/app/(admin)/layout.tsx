"use client";

import AdminLayout from "@/layout/AdminLayout";
import React from "react";

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
