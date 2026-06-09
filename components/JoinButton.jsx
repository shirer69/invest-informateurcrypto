"use client";

import { useJoin } from "./JoinProvider";

export default function JoinButton({ className = "", children, ...props }) {
  const { open } = useJoin();
  return (
    <button type="button" onClick={open} className={className} {...props}>
      {children}
    </button>
  );
}
