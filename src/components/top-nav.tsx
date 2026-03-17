import Image from 'next/image';
import Link from 'next/link';

interface TopNavProps {
  compact?: boolean;
}

export function TopNav({ compact = false }: TopNavProps) {
  if (compact) {
    return (
      <div className="topnav topnav-compact">
        <Link aria-label="CAMIKey home" className="brand-mark" href="/">
          <Image alt="CAMIKey" className="brand-mark-image" height={56} priority src="/social-futures.gif" width={56} />
        </Link>
        <div className="nav-links nav-links-compact">
          <Link className="nav-link nav-link-compact" href="/marketplace">
            Marketplace
          </Link>
          <Link
            aria-label="X"
            className="nav-link nav-link-icon"
            href="https://x.com/soboltoshi"
            rel="noreferrer"
            target="_blank"
          >
            X
          </Link>
          <Link
            aria-label="GitHub"
            className="nav-link nav-link-icon"
            href="https://github.com/InterloperProtocol/CamiKey"
            rel="noreferrer"
            target="_blank"
          >
            GH
          </Link>
          <Link
            aria-label="Telegram"
            className="nav-link nav-link-icon"
            href="https://t.me/parastratemint"
            rel="noreferrer"
            target="_blank"
          >
            TG
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="topnav">
      <div className="brand">
        <Link className="brand-name" href="/">
          CAMIUP
        </Link>
        <span className="brand-tag">Creator Attention Marketplace Interface</span>
      </div>
      <div className="nav-links">
        <Link className="nav-link" href="/marketplace">
          Marketplace
        </Link>
        <Link className="nav-link" href="/start">
          Streamer
        </Link>
        <Link className="nav-link" href="/advertisers">
          Advertisers
        </Link>
      </div>
    </div>
  );
}
