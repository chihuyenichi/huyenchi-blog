import Link from "next/link";

export function Header() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://huyenchi-admin.vercel.app";
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Cipher Notes home">
          <span className="wordmark-mark">&gt;_</span>
          Cipher Notes
        </Link>
        <nav aria-label="Primary navigation">
          <Link href="/writeups">Writeups</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/events">Events</Link>
          <Link href="/archive">Archive</Link>
          <a href={adminUrl} className="nav-cta">Publish</a>
        </nav>
      </div>
    </header>
  );
}
