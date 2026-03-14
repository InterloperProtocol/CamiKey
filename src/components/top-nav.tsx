import Link from 'next/link';

export function TopNav() {
  return (
    <div className="topnav">
      <div className="brand">
        <span className="brand-name">CAMIKey</span>
        <span className="brand-tag">Pump.fun Livestream Charts Only</span>
      </div>
      <div className="nav-links">
        <Link className="nav-link" href="/start">
          Start
        </Link>
        <Link className="nav-link" href="/ads">
          Ads
        </Link>
      </div>
    </div>
  );
}
