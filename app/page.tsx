"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { GhostButton, PrimaryButton } from "@/components/Button";
import { CourseConfig, courses } from "@/lib/courses";

export default function HomePage() {
  const primaryCourse = courses[0];
  const router = useRouter();
  const [pendingCourse, setPendingCourse] = useState<CourseConfig | null>(null);

  return (
    <AppShell>
      <main className="flex flex-1 flex-col gap-6">
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted">MiniCard</p>
          <h1 className="text-2xl font-semibold leading-tight">
            Zero-maintenance mini golf scorecard for your phone.
          </h1>
          <p className="text-sm text-muted">
            Scan a QR at the course, add players, and keep scores without downloads, logins, or sharing data
            anywhere else.
          </p>
          <div className="flex flex-col gap-2">
            {primaryCourse ? (
              <Link
                href={`/${primaryCourse.slug}`}
                className="w-full rounded-lg bg-primary px-4 py-3 text-center text-base font-semibold text-bg transition hover:brightness-110"
              >
                Start a round at {primaryCourse.name}
              </Link>
            ) : null}
            <p className="text-sm text-muted">
              Mobile-first. Data stays on your device. Tailwind themed via CSS variables.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Sample courses</h2>
          <div className="grid gap-3">
            {courses.map((course) => (
              <button
                key={course.slug}
                type="button"
                onClick={() => setPendingCourse(course)}
                className="text-left"
              >
                <Card className="hover:border-primary">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-base font-semibold">{course.name}</p>
                      <p className="text-sm text-muted">{course.holes} holes</p>
                    </div>
                    <span className="rounded-full bg-primary-soft/30 px-3 py-1 text-xs font-semibold text-primary">
                      Open
                    </span>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </section>

        <p className="text-sm text-muted">
          Privacy first: scores are stored locally in your browser and never leave your device.
        </p>
      </main>

      {pendingCourse ? (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-bg/80 px-4 pb-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-xl">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted">Confirm</p>
              <p className="text-lg font-semibold">Start a round at {pendingCourse.name}?</p>
              <p className="text-sm text-muted">
                {pendingCourse.holes} holes. Data stays on this device only.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <GhostButton onClick={() => setPendingCourse(null)}>Cancel</GhostButton>
              <PrimaryButton
                onClick={() => {
                  router.push(`/${pendingCourse.slug}`);
                  setPendingCourse(null);
                }}
              >
                Start round
              </PrimaryButton>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
