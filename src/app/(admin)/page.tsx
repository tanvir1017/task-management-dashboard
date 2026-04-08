import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "@/components/tables/BasicTableOne";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Task Management - Next.js Dashboard",
  description: "This is Next.js Home for Task Management Dashboard",
};

export default function Ecommerce() {
  return (
    <div className="">
        <ComponentCard title="All Tasks">
          <BasicTableOne />
        </ComponentCard>
    </div>
  );
}
