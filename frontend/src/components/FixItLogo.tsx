import type { CSSProperties, ImgHTMLAttributes } from "react";

import horizontalLogo from "../assets/brands/fixit-logo-horizontal.png";
import horizontalWhiteLogo from "../assets/brands/fixit-logo-horizontal-white.png";
import iconLogo from "../assets/brands/fixit-logo-icon.png";
import iconWhiteLogo from "../assets/brands/fixit-logo-icon-white.png";
import monochromeLogo from "../assets/brands/fixit-logo-monochrome.png";
import stackedLogo from "../assets/brands/fixit-logo-stacked.png";

export type FixItLogoVariant =
  | "horizontal"
  | "horizontal-white"
  | "icon"
  | "icon-white"
  | "stacked"
  | "monochrome";

export type FixItLogoSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

interface FixItLogoProps
  extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    "src" | "alt"
  > {
  variant?: FixItLogoVariant;
  size?: FixItLogoSize;
  alt?: string;
}

const logoSources: Record<
  FixItLogoVariant,
  string
> = {
  horizontal: horizontalLogo,
  "horizontal-white": horizontalWhiteLogo,
  icon: iconLogo,
  "icon-white": iconWhiteLogo,
  stacked: stackedLogo,
  monochrome: monochromeLogo,
};

const sizeStyles: Record<
  FixItLogoVariant,
  Record<
    FixItLogoSize,
    CSSProperties
  >
> = {
  horizontal: {
    xs: {
      width: "110px",
      height: "auto",
    },
    sm: {
      width: "140px",
      height: "auto",
    },
    md: {
      width: "170px",
      height: "auto",
    },
    lg: {
      width: "210px",
      height: "auto",
    },
    xl: {
      width: "260px",
      height: "auto",
    },
  },

  "horizontal-white": {
    xs: {
      width: "110px",
      height: "auto",
    },
    sm: {
      width: "140px",
      height: "auto",
    },
    md: {
      width: "170px",
      height: "auto",
    },
    lg: {
      width: "210px",
      height: "auto",
    },
    xl: {
      width: "260px",
      height: "auto",
    },
  },

  icon: {
    xs: {
      width: "20px",
      height: "20px",
    },
    sm: {
      width: "28px",
      height: "28px",
    },
    md: {
      width: "40px",
      height: "40px",
    },
    lg: {
      width: "56px",
      height: "56px",
    },
    xl: {
      width: "72px",
      height: "72px",
    },
  },

  "icon-white": {
    xs: {
      width: "20px",
      height: "20px",
    },
    sm: {
      width: "28px",
      height: "28px",
    },
    md: {
      width: "40px",
      height: "40px",
    },
    lg: {
      width: "56px",
      height: "56px",
    },
    xl: {
      width: "72px",
      height: "72px",
    },
  },

  stacked: {
    xs: {
      width: "80px",
      height: "auto",
    },
    sm: {
      width: "100px",
      height: "auto",
    },
    md: {
      width: "130px",
      height: "auto",
    },
    lg: {
      width: "170px",
      height: "auto",
    },
    xl: {
      width: "220px",
      height: "auto",
    },
  },

  monochrome: {
    xs: {
      width: "110px",
      height: "auto",
    },
    sm: {
      width: "140px",
      height: "auto",
    },
    md: {
      width: "170px",
      height: "auto",
    },
    lg: {
      width: "210px",
      height: "auto",
    },
    xl: {
      width: "260px",
      height: "auto",
    },
  },
};

export default function FixItLogo({
  variant = "horizontal",
  size = "md",
  alt = "FixIt",
  className = "",
  style,
  ...props
}: FixItLogoProps) {
  return (
    <img
      src={logoSources[variant]}
      alt={alt}
      className={[
        "block max-w-full object-contain",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...sizeStyles[variant][size],
        ...style,
      }}
      {...props}
    />
  );
}