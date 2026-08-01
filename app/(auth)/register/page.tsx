"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { clientFetch } from "@/lib/client-fetch";
import type { Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    bio: "",
    skills: "",
    hourlyRate: "",
    experienceYrs: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const base = {
      role,
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      address: form.address || undefined,
    };

    const body =
      role === "TECHNICIAN"
        ? {
            ...base,
            bio: form.bio || undefined,
            skills: form.skills
              ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
              : undefined,
            hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
            experienceYrs: form.experienceYrs
              ? Number(form.experienceYrs)
              : undefined,
            location: form.location || undefined,
          }
        : base;

    try {
      await clientFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await clientFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      toast.success("Account created successfully");
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="I am a" htmlFor="role">
            <Select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="TECHNICIAN">Technician</option>
            </Select>
          </Field>

          <Field label="Full name" htmlFor="name">
            <Input
              id="name"
              required
              minLength={2}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </Field>
          <Field label="Password" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              minLength={1}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>
          <Field label="Phone" htmlFor="phone">
            <Input
              id="phone"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </Field>
          <Field label="Address" htmlFor="address">
            <Input
              id="address"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>

          {role === "TECHNICIAN" && (
            <div className="space-y-4 rounded-lg bg-zinc-50 p-4">
              <Field label="Bio" htmlFor="bio">
                <Input
                  id="bio"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </Field>
              <Field
                label="Skills"
                htmlFor="skills"
                hint="Comma separated, e.g. plumbing, pipe fitting"
              >
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                />
              </Field>
              <Field label="Hourly rate (BDT)" htmlFor="hourlyRate">
                <Input
                  id="hourlyRate"
                  type="number"
                  min={0}
                  step="any"
                  value={form.hourlyRate}
                  onChange={(e) => set("hourlyRate", e.target.value)}
                />
              </Field>
              <Field
                label="Years of experience"
                htmlFor="experienceYrs"
              >
                <Input
                  id="experienceYrs"
                  type="number"
                  min={0}
                  value={form.experienceYrs}
                  onChange={(e) => set("experienceYrs", e.target.value)}
                />
              </Field>
              <Field
                label="Service area"
                htmlFor="location"
                hint="Bookings must contain this text in their address"
              >
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                />
              </Field>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
