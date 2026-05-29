export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-text-muted text-sm">
        <p>&copy; {new Date().getFullYear()} writeup blog. Built with Next.js.</p>
      </div>
    </footer>
  )
}
