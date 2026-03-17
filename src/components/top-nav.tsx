import Link from 'next/link';

export function TopNav() {
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
