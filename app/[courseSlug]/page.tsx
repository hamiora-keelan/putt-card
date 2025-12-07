"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { GhostButton, PrimaryButton } from "@/components/Button";
import { findCourseBySlug } from "@/lib/courses";
import { clamp, cn } from "@/lib/utils";
import {
  Player,
  ScoreState,
  clearState,
  createInitialState,
  loadState,
  saveState,
  storageAvailable
} from "@/lib/state";

type ViewState = "landing" | "players" | "scorecard" | "summary";

type PlayerInput = {
  id: string;
  name: string;
};

type Props = {
  params: {
    courseSlug: string;
  };
};

export default function CoursePage({ params }: Props) {
  const course = findCourseBySlug(params.courseSlug);
  const [view, setView] = useState<ViewState>("landing");
  const [scoreState, setScoreState] = useState<ScoreState | null>(null);
  const createInputRow = (): PlayerInput => ({
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `input-${Date.now()}-${Math.random()}`,
    name: ""
  });
  const [playerInputs, setPlayerInputs] = useState<PlayerInput[]>([createInputRow(), createInputRow()]);
  const [storageWarning, setStorageWarning] = useState(false);
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    setStorageWarning(!storageAvailable());
  }, []);

  useEffect(() => {
    if (!course) return;
    const saved = loadState(course.slug);
    if (saved) {
      setScoreState(saved);
      setView("scorecard");
    } else {
      setView("landing");
    }
  }, [course]);

  useEffect(() => {
    if (view === "players" && !hasFocusedRef.current) {
      const id = window.setTimeout(() => {
        inputRefs.current[0]?.focus();
        hasFocusedRef.current = true;
      }, 0);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [view]);

  if (!course) {
    return (
      <AppShell>
        <div className="flex flex-1 flex-col items-start justify-center space-y-3">
          <h1 className="text-2xl font-semibold">Course not found</h1>
          <p className="text-sm text-muted">Check the link on the QR code or pick a course from the home page.</p>
          <a
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-text"
          >
            Back home
          </a>
        </div>
      </AppShell>
    );
  }

  const themeStyle: React.CSSProperties = {
    ["--color-bg" as string]: course.theme?.bg,
    ["--color-surface" as string]: course.theme?.surface,
    ["--color-primary" as string]: course.theme?.primary,
    ["--color-primary-soft" as string]: course.theme?.primarySoft,
    ["--color-accent" as string]: course.theme?.accent
  };

  const hasActiveRound = Boolean(scoreState);

  const totals = useMemo(() => {
    if (!scoreState) return [];
    return scoreState.players.map((player) => {
      let total = 0;
      for (let i = 0; i < course.holes; i += 1) {
        const value = scoreState.scores?.[i]?.[player.id];
        if (typeof value === "number") {
          total += value;
        }
      }
      return { player, total };
    });
  }, [course.holes, scoreState]);

  const hasAnyScore = useMemo(() => {
    if (!scoreState) return false;
    return Object.values(scoreState.scores ?? {}).some((hole) =>
      Object.values(hole ?? {}).some((value) => typeof value === "number")
    );
  }, [scoreState]);

  const parTotal = useMemo(() => course.par?.reduce((acc, val) => acc + val, 0) ?? null, [course.par]);

  const runningSummary = useMemo(() => {
    if (!totals.length || !hasAnyScore) return "No scores yet";
    return totals.map((item) => `${item.player.name} ${item.total || 0}`).join(" • ");
  }, [hasAnyScore, totals]);

  const leaderboard = useMemo(() => {
    const sorted = [...totals].sort((a, b) => a.total - b.total);
    const leaderTotal = sorted[0]?.total ?? 0;
    return sorted.map((item, index) => ({
      player: item.player,
      total: item.total,
      behind: item.total - leaderTotal,
      isLeader: index === 0
    }));
  }, [totals]);

  const handleStartNewRound = () => {
    clearState(course.slug);
    setScoreState(null);
    setPlayerInputs([createInputRow(), createInputRow()]);
    hasFocusedRef.current = false;
    setCurrentHoleIndex(0);
    setView("players");
  };

  const handleResumeRound = () => {
    if (scoreState) {
      setView("scorecard");
    } else {
      setView("players");
    }
  };

  const handleBeginRound = () => {
    const trimmedNames = playerInputs.map((item) => item.name.trim()).filter(Boolean).slice(0, 8);
    if (!trimmedNames.length) return;
    const players: Player[] = trimmedNames.map((name, index) => ({
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `p-${Date.now()}-${index + 1}`,
      name
    }));
    const nextState = createInitialState(players, course.holes);
    setScoreState(nextState);
    saveState(course.slug, nextState);
    setView("scorecard");
    setCurrentHoleIndex(0);
  };

  const handleScoreChange = (holeIndex: number, playerId: string, value: number) => {
    setScoreState((prev) => {
      if (!prev) return prev;
      const nextValue = clamp(value, 0, 20);
      const holeScores = { ...(prev.scores[holeIndex] ?? {}) };
      holeScores[playerId] = nextValue;
      const nextState: ScoreState = {
        ...prev,
        scores: {
          ...prev.scores,
          [holeIndex]: holeScores
        }
      };
      saveState(course.slug, nextState);
      return nextState;
    });
  };

  const CourseLandingView = () => (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wide text-muted">MiniCard</p>
        <h1 className="text-2xl font-semibold leading-tight">{course.name}</h1>
        <p className="text-sm text-muted">
          {course.holes} holes • Digital scorecard – no app download. All data stays on this device only.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {hasActiveRound ? (
          <>
            <PrimaryButton onClick={handleResumeRound}>Resume last round</PrimaryButton>
            <GhostButton onClick={handleStartNewRound}>Start new round</GhostButton>
            <button
              type="button"
              className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              onClick={handleStartNewRound}
            >
              Reset round (clear saved scores)
            </button>
          </>
        ) : (
          <PrimaryButton onClick={() => setView("players")}>Start scorecard</PrimaryButton>
        )}
        <p className="text-sm text-muted">No logins. No tracking. Just keep score and play.</p>
      </div>
    </div>
  );

  const AddPlayersView = () => {
    const canAddMore = playerInputs.length < 8;
    const trimmedNames = playerInputs.map((item) => item.name.trim());
    const hasAtLeastOneName = trimmedNames.some(Boolean);

    const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const targetIndex = index + 1;
        if (targetIndex < playerInputs.length) {
          inputRefs.current[targetIndex]?.focus();
        }
      }
    };

    const updateInput = (index: number, value: string) => {
      setPlayerInputs((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], name: value };
        return next;
      });
    };

    const removeRow = (index: number) => {
      setPlayerInputs((prev) => {
        if (prev.length === 1) return prev;
        return prev.filter((_, idx) => idx !== index);
      });
    };

    const addRow = () => {
      if (!canAddMore) return;
      setPlayerInputs((prev) => [...prev, { ...createInputRow(), name: "" }]);
    };

    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted">Players</p>
          <h2 className="text-2xl font-semibold">Who&apos;s playing?</h2>
          <p className="text-sm text-muted">Add up to 8 players. Press enter to jump to the next name.</p>
        </div>

        <div className="flex flex-col gap-3">
          {playerInputs.map((player, index) => (
            <div key={player.id} className="flex items-center gap-2">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-base text-text placeholder:text-muted focus:border-primary focus:outline-none"
                placeholder={`Player ${index + 1}`}
                value={player.name}
                onChange={(e) => updateInput(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
              />
              {playerInputs.length > 1 ? (
                <button
                  type="button"
                  aria-label="Remove player"
                  className="h-10 w-10 rounded-full border border-border text-xl text-muted transition hover:border-primary hover:text-text"
                  onClick={() => removeRow(index)}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}
          <GhostButton disabled={!canAddMore} onClick={addRow}>
            Add player
          </GhostButton>
        </div>

        <div className="mt-auto space-y-3">
          <PrimaryButton disabled={!hasAtLeastOneName} onClick={handleBeginRound}>
            Begin round
          </PrimaryButton>
          <GhostButton onClick={() => setView("landing")}>Back</GhostButton>
        </div>
      </div>
    );
  };

  const ScorecardView = () => {
    if (!scoreState) return null;
    const holeHasScores = (index: number) =>
      scoreState.players
        .map((player) => scoreState.scores?.[index]?.[player.id])
        .filter((val) => typeof val === "number").length > 0;
    const currentPar = course.par?.[currentHoleIndex];
    const isLastHole = currentHoleIndex === course.holes - 1;

    return (
      <div className="flex flex-1 flex-col gap-3">
        <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-sm">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="truncate text-xs uppercase tracking-wide text-muted">{course.name}</p>
              <p className="text-lg font-semibold">
                Hole {currentHoleIndex + 1} of {course.holes}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setView("summary")}
              className="text-sm font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              Finish
            </button>
          </div>
          <p className="pb-3 text-xs text-muted">Tap a player to adjust the score for this hole.</p>
        </header>

        <div className="flex-1 space-y-3 pb-28">
          <div className="mb-2 flex gap-2 text-xs text-muted">
            {currentHoleIndex > 0 ? (
              <div
                className="flex-1 cursor-pointer rounded-lg border border-border bg-surface px-3 py-2"
                onClick={() => setCurrentHoleIndex((idx) => Math.max(0, idx - 1))}
              >
                <div className="font-medium">Previous</div>
                <div className="text-sm text-text">Hole {currentHoleIndex}</div>
                <div>{holeHasScores(currentHoleIndex - 1) ? "Scored" : "No scores yet"}</div>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {currentHoleIndex < course.holes - 1 ? (
              <div
                className="flex-1 cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-right"
                onClick={() => setCurrentHoleIndex((idx) => Math.min(course.holes - 1, idx + 1))}
              >
                <div className="font-medium">Next</div>
                <div className="text-sm text-text">Hole {currentHoleIndex + 2}</div>
                <div>{holeHasScores(currentHoleIndex + 1) ? "Scored" : "No scores yet"}</div>
              </div>
            ) : (
              <div className="flex-1" />
            )}
          </div>

          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-semibold">Hole {currentHoleIndex + 1}</p>
                {currentPar ? (
                  <span className="rounded-full bg-primary-soft/20 px-2 py-1 text-xs font-semibold text-primary">
                    Par {currentPar}
                  </span>
                ) : null}
              </div>
              <span className="text-xs text-muted">
                {holeHasScores(currentHoleIndex) ? "In progress" : "No scores yet"}
              </span>
            </div>
            <p className="text-sm text-muted">Tap a player to adjust the score for this hole.</p>

            <div className="flex flex-col gap-2">
              {scoreState.players.map((player) => {
                const currentScore = scoreState.scores?.[currentHoleIndex]?.[player.id];
                const scoreValue = typeof currentScore === "number" ? currentScore : 0;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
                  >
                    <span className="font-semibold">{player.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full border border-border text-lg font-semibold text-text transition hover:border-primary"
                        onClick={() => handleScoreChange(currentHoleIndex, player.id, clamp(scoreValue - 1, 0, 20))}
                        disabled={scoreValue <= 0}
                      >
                        –
                      </button>
                      <span className="w-8 text-center text-base font-semibold tabular-nums">
                        {typeof currentScore === "number" ? currentScore : "–"}
                      </span>
                      <button
                        type="button"
                        className="h-9 w-9 rounded-full border border-border text-lg font-semibold text-text transition hover:border-primary"
                        onClick={() => handleScoreChange(currentHoleIndex, player.id, clamp(scoreValue + 1, 0, 20))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <footer className="fixed bottom-3 left-0 right-0 mx-auto flex max-w-md flex-col gap-2 rounded-2xl border border-border bg-surface/90 px-4 py-3 backdrop-blur">
          <div className="flex items-start justify-between gap-3 text-sm">
            <span className="font-semibold text-text">
              Current hole: {currentHoleIndex + 1} / {course.holes}
            </span>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span className="text-right">{runningSummary}</span>
              <button
                type="button"
                className="rounded-full border border-border px-2 py-1 text-[11px] font-semibold text-primary hover:border-primary"
                onClick={() => setShowLeaderboard(true)}
              >
                Leaderboard
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <GhostButton
              className="flex-1"
              disabled={currentHoleIndex === 0}
              onClick={() => setCurrentHoleIndex((idx) => Math.max(0, idx - 1))}
            >
              Prev
            </GhostButton>
            <PrimaryButton
              className="flex-1"
              onClick={() => {
                if (isLastHole) {
                  setShowCompleteConfirm(true);
                } else {
                  setCurrentHoleIndex((idx) => Math.min(course.holes - 1, idx + 1));
                }
              }}
            >
              {isLastHole ? "Complete" : "Next"}
            </PrimaryButton>
          </div>
        </footer>
      </div>
    );
  };

  const SummaryView = () => {
    if (!scoreState) return null;
    const ordered = [...totals].sort((a, b) => a.total - b.total);
    const bestScore = ordered[0]?.total ?? null;

    const formatParDelta = (total: number) => {
      if (!parTotal) return null;
      const delta = total - parTotal;
      if (delta === 0) return "E";
      return delta > 0 ? `+${delta}` : `${delta}`;
    };

    const shareScores = async () => {
      const lines = ordered.map(({ player, total }, index) => {
        const delta = formatParDelta(total);
        const winner = index === 0 ? " (winner)" : "";
        return `${player.name}: ${total}${delta ? ` (${delta})` : ""}${winner}`;
      });
      const title = `Mini golf scores – ${course.name}`;
      const text = [title, ...lines].join("\n");
      const url = typeof window !== "undefined" ? `${window.location.origin}/${course.slug}` : undefined;

      if (typeof navigator !== "undefined" && "share" in navigator) {
        try {
          await navigator.share({ title, text, url });
          return;
        } catch {
          // fall back
        }
      }

      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          window.alert("Scores copied to clipboard.");
          return;
        } catch {
          // fall back
        }
      }

      window.alert(text);
    };

    return (
      <div className="flex flex-1 flex-col gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted">Summary</p>
          <h2 className="text-2xl font-semibold">Final scores</h2>
          <p className="text-sm text-muted">Sorted best to worst. Winner is highlighted.</p>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
          {ordered.map(({ player, total }, index) => {
            const parDelta = formatParDelta(total);
            const isWinner = bestScore !== null && total === bestScore;
            return (
              <Card key={player.id} className={cn(isWinner && "border-primary")}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{player.name}</p>
                    <p className="text-sm text-muted">
                      {parDelta ? `Over/under par: ${parDelta}` : "Par not tracked for this course"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums">{total}</p>
                  </div>
                </div>
                {index === 0 && isWinner ? <p className="pt-1 text-sm text-primary">🏆 Winner</p> : null}
              </Card>
            );
          })}
        </div>

        <div className="sticky bottom-0 flex flex-col gap-2 border-t border-border bg-bg pt-2">
          <GhostButton onClick={shareScores}>Share scores</GhostButton>
          <PrimaryButton onClick={handleStartNewRound}>Start new round</PrimaryButton>
          <GhostButton onClick={() => setView("scorecard")}>Back to scorecard</GhostButton>
        </div>
      </div>
    );
  };

  return (
    <div style={themeStyle}>
      <AppShell>
        {storageWarning ? (
          <div className="mb-3 rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm text-accent">
            Local storage is unavailable. Scores will not persist after refresh.
          </div>
        ) : null}

        {view === "landing" && <CourseLandingView />}
        {view === "players" && <AddPlayersView />}
        {view === "scorecard" && <ScorecardView />}
        {view === "summary" && <SummaryView />}

        {showCompleteConfirm ? (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-bg/80 px-4 pb-6">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-xl">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Confirm</p>
                <p className="text-lg font-semibold">Complete round?</p>
                <p className="text-sm text-muted">
                  Make sure everyone has finished Hole {currentHoleIndex + 1} before you continue.
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <GhostButton onClick={() => setShowCompleteConfirm(false)}>Keep playing</GhostButton>
                <PrimaryButton
                  onClick={() => {
                    setShowCompleteConfirm(false);
                    setView("summary");
                  }}
                >
                  Show final scores
                </PrimaryButton>
              </div>
            </div>
          </div>
        ) : null}

        {showLeaderboard ? (
          <div className="fixed inset-0 z-20 flex items-end justify-center bg-bg/80 px-4 pb-6">
            <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-4 shadow-xl">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-muted">Leaderboard</p>
                <p className="text-lg font-semibold">Live totals for this round.</p>
              </div>
              <div className="mt-3 space-y-2">
                {leaderboard.map((entry) => (
                  <Card key={entry.player.id} className={cn(entry.isLeader && "border-primary")}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{entry.player.name}</p>
                        {entry.isLeader ? (
                          <p className="text-xs text-primary">Leader</p>
                        ) : (
                          <p className="text-xs text-muted">+{entry.behind} strokes behind</p>
                        )}
                      </div>
                      <p className="text-lg font-semibold tabular-nums">{entry.total}</p>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-4">
                <PrimaryButton onClick={() => setShowLeaderboard(false)}>Close</PrimaryButton>
              </div>
            </div>
          </div>
        ) : null}
      </AppShell>
    </div>
  );
}
