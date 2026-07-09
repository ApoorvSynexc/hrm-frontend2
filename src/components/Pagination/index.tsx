import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export type PaginationSize = 'sm' | 'md' | 'lg'

export type PaginationProps = {
  /** 1-indexed current page. */
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  /** Page numbers kept visible on each side of the current page. */
  siblingCount?: number
  size?: PaginationSize
  className?: string
}

const DOTS = 'dots' as const

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

function getPageRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
): (number | typeof DOTS)[] {
  const totalPageNumbers = siblingCount * 2 + 5

  if (totalPageNumbers >= totalPages) {
    return range(1, totalPages)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftDots = leftSiblingIndex > 2
  const showRightDots = rightSiblingIndex < totalPages - 1

  if (!showLeftDots && showRightDots) {
    const leftItemCount = 3 + siblingCount * 2
    return [...range(1, leftItemCount), DOTS, totalPages]
  }

  if (showLeftDots && !showRightDots) {
    const rightItemCount = 3 + siblingCount * 2
    return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)]
  }

  return [1, DOTS, ...range(leftSiblingIndex, rightSiblingIndex), DOTS, totalPages]
}

const SIZE_CLASS: Record<PaginationSize, string> = {
  sm: 'h-7 min-w-7 text-xs',
  md: 'h-9 min-w-9 text-sm',
  lg: 'h-11 min-w-11 text-base',
}

const ICON_SIZE: Record<PaginationSize, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  siblingCount = 1,
  size = 'md',
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const currentPage = Math.min(Math.max(page, 1), totalPages)

  if (totalItems === 0) return null

  const pageNumbers = getPageRange(totalPages, currentPage, siblingCount)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const goTo = (target: number) => {
    if (target < 1 || target > totalPages || target === currentPage) return
    onPageChange(target)
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <p className="text-sm text-body">
        Showing <span className="font-medium text-heading">{startItem}</span>–
        <span className="font-medium text-heading">{endItem}</span> of{' '}
        <span className="font-medium text-heading">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1.5">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Rows per page"
            className="mr-1 h-9 rounded-lg border border-border bg-surface px-2 text-sm text-heading outline-none focus:border-accent"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className={`inline-flex items-center justify-center rounded-lg border border-border text-heading transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 ${SIZE_CLASS[size]}`}
        >
          <FiChevronLeft size={ICON_SIZE[size]} />
        </button>

        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((entry, index) =>
            entry === DOTS ? (
              <span
                key={`dots-${index}`}
                className={`inline-flex items-center justify-center text-body ${SIZE_CLASS[size]}`}
              >
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                onClick={() => goTo(entry)}
                aria-current={entry === currentPage ? 'page' : undefined}
                className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors ${
                  SIZE_CLASS[size]
                } ${
                  entry === currentPage
                    ? 'bg-accent text-accent-fg'
                    : 'text-heading hover:bg-surface-2'
                }`}
              >
                {entry}
              </button>
            ),
          )}
        </div>

        <span className="px-1 text-sm text-body sm:hidden">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className={`inline-flex items-center justify-center rounded-lg border border-border text-heading transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40 ${SIZE_CLASS[size]}`}
        >
          <FiChevronRight size={ICON_SIZE[size]} />
        </button>
      </div>
    </nav>
  )
}
