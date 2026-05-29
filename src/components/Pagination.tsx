import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={currentPage === 2 ? basePath : `${basePath}?page=${currentPage - 1}`}
          className="px-3 py-1.5 text-sm border border-border rounded text-text-secondary hover:text-text hover:border-accent transition-colors"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={page === 1 ? basePath : `${basePath}?page=${page}`}
          className={`px-3 py-1.5 text-sm border rounded transition-colors ${
            page === currentPage
              ? 'bg-accent text-bg border-accent'
              : 'border-border text-text-secondary hover:text-text hover:border-accent'
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-1.5 text-sm border border-border rounded text-text-secondary hover:text-text hover:border-accent transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  )
}
