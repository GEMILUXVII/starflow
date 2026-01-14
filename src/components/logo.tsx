"use client";

import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = "" }: LogoProps) {
  return (
    <Image
      src="/favicon.svg"
      alt="Starflow Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
