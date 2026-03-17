import Image from 'next/image';
import Link from 'next/link';

export function TopNav() {
  return (
    <div className="topnav topnav-compact">
      <Link aria-label="CAMIKey home" className="brand-mark" href="/">
        <Image alt="CAMIKey" className="brand-mark-image" height={56} priority src="/social-futures.gif" width={56} />
      </Link>
      <div className="nav-links nav-links-primary">
        <Link className="nav-link nav-link-text" href="/marketplace">
          Marketplace
        </Link>
        <Link className="nav-link nav-link-text" href="/start">
          Streamer
        </Link>
        <Link className="nav-link nav-link-text" href="/live">
          Pump.funAds
        </Link>
      </div>
      <div className="nav-links nav-links-compact">
        <Link aria-label="X" className="nav-link nav-link-icon" href="https://x.com/soboltoshi" rel="noreferrer" target="_blank">
          <Image alt="" aria-hidden className="nav-icon" height={18} src="/icons/x-logo.svg" width={18} />
        </Link>
        <Link
          aria-label="GitHub"
          className="nav-link nav-link-icon"
          href="https://github.com/InterloperProtocol/CamiKey"
          rel="noreferrer"
          target="_blank"
        >
          <Image alt="" aria-hidden className="nav-icon" height={18} src="/icons/github.svg" width={18} />
        </Link>
        <Link
          aria-label="Telegram"
          className="nav-link nav-link-icon"
          href="https://t.me/parastratemint"
          rel="noreferrer"
          target="_blank"
        >
          <Image alt="" aria-hidden className="nav-icon" height={18} src="/icons/telegram.svg" width={18} />
        </Link>
      </div>
    </div>
  );
}
