import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Size of the icon mark before the text */
  iconSize?: number;
  onClick?: () => void;
  /** Use as a non-link brand mark (e.g. footer) */
  asDiv?: boolean;
};

/**
 * Icon mark + classic PropertyReply wordmark.
 * Icon: /public/assets/favicon.png (logo mark)
 * Text: PropertyReply (same as before)
 */
export default function BrandLogo({
  href = "/",
  className = "logo brand-logo",
  iconSize = 36,
  onClick,
  asDiv = false,
}: BrandLogoProps) {
  const content = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/favicon.png"
        alt=""
        aria-hidden="true"
        className="brand-logo-mark"
        width={iconSize}
        height={iconSize}
        style={{ width: iconSize, height: iconSize }}
      />
      <span className="brand-logo-wordmark">
        Property<span>Reply</span>
      </span>
    </>
  );

  if (asDiv) {
    return <div className={className}>{content}</div>;
  }

  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        aria-label="PropertyReply"
      >
        {content}
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
      {content}
    </Link>
  );
}
