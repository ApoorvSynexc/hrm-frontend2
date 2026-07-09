import { useMemo, useState } from 'react'
import type { Key, ReactNode } from 'react'
import { Pagination } from '../Pagination'

export type TableSize = 'sm' | 'md' | 'lg'
export type TableAlign = 'left' | 'center' | 'right'

export type TableColumn<T> = {
  key: string
  header: ReactNode
  render?: (row: T, index: number) => ReactNode
  align?: TableAlign
  width?: string
}

export type TableProps<T> = {
  columns: TableColumn<T>[]
  data: T[]
  rowKey: (row: T, index: number) => Key
  size?: TableSize
  loading?: boolean
  emptyMessage?: ReactNode
  className?: string

  /** Turn on the built-in pagination footer. Defaults to off. */
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  /** Controlled current page (1-indexed). Omit to let Table manage it internally. */
  page?: number
  onPageChange?: (page: number) => void
  /**
   * Total row count for server-side pagination, where `data` is already
   * just the current page's rows. Omit for client-side pagination, where
   * `data` is the full dataset and Table slices it itself.
   */
  totalItems?: number
}

const CELL_PADDING: Record<TableSize, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-3 text-sm',
  lg: 'px-5 py-4 text-base',
}

const ALIGN_CLASS: Record<TableAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

export function Table<T>({
  columns,
  data,
  rowKey,
  size = 'md',
  loading = false,
  emptyMessage = 'No data to display',
  className = '',
  pagination = false,
  pageSize = 10,
  pageSizeOptions,
  page: controlledPage,
  onPageChange,
  totalItems,
}: TableProps<T>) {
  const [internalPage, setInternalPage] = useState(1)
  const [internalPageSize, setInternalPageSize] = useState(pageSize)

  const isControlled = controlledPage !== undefined
  const currentPage = isControlled ? controlledPage : internalPage
  const isServerPaginated = totalItems !== undefined
  const effectivePageSize = isControlled ? pageSize : internalPageSize

  const total = totalItems ?? data.length

  const visibleRows = useMemo(() => {
    if (!pagination || isServerPaginated) return data
    const start = (currentPage - 1) * effectivePageSize
    return data.slice(start, start + effectivePageSize)
  }, [data, pagination, isServerPaginated, currentPage, effectivePageSize])

  const handlePageChange = (nextPage: number) => {
    if (!isControlled) setInternalPage(nextPage)
    onPageChange?.(nextPage)
  }

  const handlePageSizeChange = pageSizeOptions
    ? (nextSize: number) => {
        setInternalPageSize(nextSize)
        handlePageChange(1)
      }
    : undefined

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse text-heading">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={`${CELL_PADDING[size]} font-medium text-body ${
                    ALIGN_CLASS[column.align ?? 'left']
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(effectivePageSize, 5) }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-border last:border-b-0">
                  {columns.map((column) => (
                    <td key={column.key} className={CELL_PADDING[size]}>
                      <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                    </td>
                  ))}
                </tr>
              ))
            ) : visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`${CELL_PADDING[size]} text-center text-body`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-2"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${CELL_PADDING[size]} ${ALIGN_CLASS[column.align ?? 'left']}`}
                    >
                      {column.render ? column.render(row, index) : String(row[column.key as keyof T] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && total > 0 && (
        <Pagination
          className="mt-3"
          page={currentPage}
          pageSize={effectivePageSize}
          totalItems={total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={pageSizeOptions}
          size={size === 'lg' ? 'md' : size}
        />
      )}
    </div>
  )
}
