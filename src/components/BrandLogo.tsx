import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** CSS height for the logo image */
  height?: number;
  onClick?: () => void;
  /** Use as a non-link brand mark (e.g. footer) */
  asDiv?: boolean;
};

/**
 * Site logo from /public/assets/logo.jpeg
 */
export default function BrandLogo({
  href = "/",
  className = "logo brand-logo",
  height = 42,
  onClick,
  asDiv = false,
}: BrandLogoProps) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/logo.jpeg"
      alt="PropertyReply"
      className="brand-logo-img"
      height={height}
      style={{ height: `${height}px`, width: "auto", display: "block" }}
    />
  );

  if (asDiv) {
    return <div className={className}>{image}</div>;
  }

  // Hash links (landing nav) must stay as <a>
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className} onClick={onClick} aria-label="PropertyReply">
        {image}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      aria-label="PropertyReply"
    >
      {image}
    </Link>
  );
}
