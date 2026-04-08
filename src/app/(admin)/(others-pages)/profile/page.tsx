"use client";

import ComponentCard from "@/components/common/ComponentCard";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ProtectedRoute } from "@/components/protected-route";
import Button from "@/components/ui/button/Button";
import { useAuth } from "@/context/auth-context";
import { getUserById, updateUserProfile } from "@/lib/api-client";
import type { User } from "@/lib/types";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import useSWR from "swr";

export default function Profile() {
  const { user: authUser, updateUser } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const currentUserId = Number(authUser?.id);

  const { data: profile, isLoading, mutate } = useSWR(
    currentUserId ? ["profile", currentUserId] : null,
    () => getUserById(currentUserId),
  );

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        email: profile.email || "",
        username: profile.username || "",
      });
    }
  }, [profile]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;

    setIsSaving(true);
    try {
      const updatedUser = await updateUserProfile(currentUserId, {
        fullName: form.fullName || undefined,
        email: form.email,
        username: form.username,
      });
      updateUser({
        id: String(updatedUser.id),
        email: updatedUser.email,
        role: authUser?.role || "USER",
        name: updatedUser.fullName || updatedUser.username || updatedUser.email,
      });
      await mutate();
      toast.success("Profile updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const profileUser: User | undefined = profile;

  return (
    <ProtectedRoute>
      <Toaster position="top-center" richColors />
      <div className="space-y-6">
        <ComponentCard
          title="Profile"
          desc="Update your own account details. Only fields stored in the database are shown here."
        >
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-500 text-2xl font-semibold text-white">
                  {(form.fullName || profileUser?.username || profileUser?.email || "U")[0].toUpperCase()}
                </div>
                <h4 className="mt-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                  {form.fullName || profileUser?.username || profileUser?.email || "User"}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profileUser?.role ? profileUser.role.replace("_", " ") : ""}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${profileUser?.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"}`}>
                    {profileUser?.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/40 dark:text-gray-300">
                    ID: {profileUser?.id ?? "—"}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {profileUser?.createdAt ? formatDateTime(profileUser.createdAt) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Updated</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {profileUser?.updatedAt ? formatDateTime(profileUser.updatedAt) : "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 lg:p-6">
              <h4 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                Edit Profile
              </h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                Edit only your own profile details.
              </p>

              <form onSubmit={handleSave} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      disabled
                      placeholder="Enter email"
                    />
                  </div>

                  <div>
                    <Label>Username</Label>
                    <Input
                      type="text"
                      value={form.username}
                      disabled
                      placeholder="Enter username"
                    />
                  </div>

                  <div>
                    <Label>Role</Label>
                    <Input
                      type="text"
                      value={profileUser?.role ? profileUser.role.replace("_", " ") : ""}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
                  <Button type="button" variant="outline" onClick={() => mutate()}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSaving} className="disabled:opacity-60">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </ComponentCard>
      </div>
    </ProtectedRoute>
  );
}
