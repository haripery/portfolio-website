"use client";

import Link from "next/link";
import type { ComponentPropsWithRef } from "react";
import posthog from "posthog-js";

type TrackedLinkProps = ComponentPropsWithRef<typeof Link> & {
  event: string;
  properties?: Record<string, unknown>;
};

export function TrackedLink({
  event,
  properties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        posthog.capture(event, properties);
        onClick?.(e);
      }}
    />
  );
}

type TrackedAnchorProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: string;
  properties?: Record<string, unknown>;
};

export function TrackedAnchor({
  event,
  properties,
  onClick,
  children,
  ...props
}: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(e) => {
        posthog.capture(event, properties);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
