import Link from "next/link";

export function Footer() {
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://huyenchi-admin.vercel.app";
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div><span className="wordmark-mark">&gt;_</span> Cipher Notes</div>
        <p>CTF writeups, exploit notes, and methods worth preserving.</p>
        <div className="footer-links"><Link href="/categories">Categories</Link><Link href="/archive">Archive</Link><a href={adminUrl}>Admin</a></div>
      </div>
    </footer>
  );
}
