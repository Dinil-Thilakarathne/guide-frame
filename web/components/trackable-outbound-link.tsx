"use client";

import posthog from "posthog-js";

type TrackableOutboundLinkProps = {
  href: string;
  children: React.ReactNode;
  analyticsLabel: string;
  className?: string;
};

export default function TrackableOutboundLink({
  href,
  children,
  analyticsLabel,
  className,
}: TrackableOutboundLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        posthog.capture("landing_outbound_link_clicked", {
          destination: analyticsLabel,
          href,
          page_name: "guideframe_landing_page",
        });
      }}
      className={className}
    >
      {children}
    </a>
  );
}
