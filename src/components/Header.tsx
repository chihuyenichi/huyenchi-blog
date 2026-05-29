import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-accent hover:text-accent-hover transition-colors">
          HuyenChi-WU
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-text-secondary hover:text-text transition-colors">Home</Link>
          <Link href="/search" className="text-text-secondary hover:text-text transition-colors">Search</Link>
          <Link href="/about" className="text-text-secondary hover:text-text transition-colors">About</Link>
          <Link href="/admin" className="text-text-muted hover:text-text transition-colors text-xs">Admin</Link>
        </nav>
      </div>
    </header>
  )
}
