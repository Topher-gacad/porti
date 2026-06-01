type Props = {
  currentPage: number
  lastPage: number
  total: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, lastPage, total, onPageChange }: Props) {
  if (lastPage <= 1) return null

  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-xs text-slate-400">
        Page <span className="text-slate-300 font-medium">{currentPage}</span> of{' '}
        <span className="text-slate-300 font-medium">{lastPage}</span>
        <span className="ml-1.5 text-slate-600">({total} total)</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
            .reduce<(number | '…')[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('…')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-600 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`min-w-[30px] px-2 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                    p === currentPage
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {p}
                </button>
              ),
            )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 hover:border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
