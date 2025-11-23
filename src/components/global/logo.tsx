import Image from "next/image";
import * as React from "react";

interface LogoProps extends React.HTMLAttributes<HTMLImageElement> {
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Deprecated: kept for backwards compatibility */
  size?: number;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({
  width,
  height,
  size,
  alt = "Gestion RAD",
  className,
  ...props
}) => {
  const computedWidth = width ?? size ?? 180;
  const computedHeight = height ?? Math.round((computedWidth * 70) / 180);

  return (
    <Image
      src="/imgs/logo.png"
      alt={alt}
      width={computedWidth}
      height={computedHeight}
      className={className}
      priority
      {...props}
    />
  );
};

export default Logo;
