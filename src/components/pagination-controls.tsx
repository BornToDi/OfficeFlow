"use client";

import Link from "next/link";
import { useMemo } from "react";

type SearchParamsInput =
  | Record<string, string | string[] | number | boolean | null | undefined>
  | URLSearchParams
  | ReadonlyMap<string, string>
  | undefined;

/** Normalize searchParams (object | URLSearchParams | Map | undefined) into [key, value] pairs */
function entriesFrom(sp: SearchParamsInput): [string, any][] {
  if (!sp) return [];
  // URLSearchParams / ReadonlyURLSearchParams
  if (typeof (sp as any).entries === "function" && !(sp instanceof Map)) {
    return Array.from((sp as any).entries());
  }
  // Map-like
  if (sp instanceof Map) {
    return Array.from(sp.entries());
  }
  // Plain object
  return Object.entries(sp as Record<string, any>);
}

function buildHref(basePath: string, page: number, sp: SearchParamsInput) {
  const params = new URLSearchParams();

  for (const [k, v] of entriesFrom(sp)) {
    if (k === "page") continue; // we’ll set our own page later
    if (Array.isArray(v)) {
      v.forEach((x) => x != null && params.append(k, String(x)));
    } else if (v != null && v !== "") {
      params.set(k, String(v));
    }
  }

  params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationControls({
  page,
  totalPages,
  basePath,
  searchParams,
  windowSize = 5,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: SearchParamsInput;
  windowSize?: number; // how many numeric buttons to show
}) {
  const safePage = Math.min(Math.max(1, page || 1), Math.max(1, totalPages || 1));

  const pages = useMemo(() => {
    if (totalPages <= 1) return [1];
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, safePage - half);
    let end = Math.min(totalPages, start + windowSize - 1);
    // adjust left if we ran out on the right
    start = Math.max(1, Math.min(start, end - windowSize + 1));

    const arr: number[] = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }, [safePage, totalPages, windowSize]);

  const prevHref = buildHref(basePath, Math.max(1, safePage - 1), searchParams);
  const nextHref = buildHref(basePath, Math.min(totalPages, safePage + 1), searchParams);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Prev */}
      <Link
        href={prevHref}
        aria-disabled={safePage <= 1}
        className={`rounded border px-3 py-1 text-sm ${
          safePage <= 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
        }`}
      >
        Prev
      </Link>

      {/* First + leading ellipsis */}
      {pages[0] > 1 && (
        <>
          <Link
            href={buildHref(basePath, 1, searchParams)}
            className="rounded border px-3 py-1 text-sm hover:bg-muted"
          >
            1
          </Link>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}

      {/* Windowed numbers */}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, p, searchParams)}
          aria-current={p === safePage ? "page" : undefined}
          className={`rounded border px-3 py-1 text-sm ${
            p === safePage ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
        >
          {p}
        </Link>
      ))}

      {/* trailing ellipsis + last */}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <Link
            href={buildHref(basePath, totalPages, searchParams)}
            className="rounded border px-3 py-1 text-sm hover:bg-muted"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}
      <Link
        href={nextHref}
        aria-disabled={safePage >= totalPages}
        className={`rounded border px-3 py-1 text-sm ${
          safePage >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-muted"
        }`}
      >
        Next
      </Link>
    </div>
  );
}
