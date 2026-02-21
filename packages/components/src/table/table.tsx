import {
  forwardRef,
  type HTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
} from 'react';
import { useNeuro, useReadability } from '@neuroui/core';
import { cn } from '../utils/cn';

// ── Types ───────────────────────────────────────────────────────────

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  stickyHeader?: boolean;
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}
export interface TableHeadProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | 'none';
  onSort?: () => void;
}
export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {}

// ── Sort icon ───────────────────────────────────────────────────────

function SortIcon({ direction }: { direction: 'asc' | 'desc' | 'none' }) {
  if (direction === 'asc') {
    return (
      <svg
        className="h-3 w-3 ml-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832 6.29 12.77a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (direction === 'desc') {
    return (
      <svg
        className="h-3 w-3 ml-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-3 w-3 ml-1 opacity-30"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ── TableRoot ───────────────────────────────────────────────────────

const TableRoot = forwardRef<HTMLTableElement, TableProps>(
  function Table(
    { striped = false, stickyHeader = false, className, children, ...rest },
    ref,
  ) {
    const { profile } = useNeuro();
    const { fontFamily, lineHeight, letterSpacing, wordSpacing, fontVariantLigatures } =
      useReadability();
    const readabilityStyle = {
      fontFamily,
      lineHeight,
      letterSpacing,
      wordSpacing,
      fontVariantLigatures,
    };

    return (
      <div className="w-full overflow-auto" data-neuro-component="table">
        <table
          ref={ref}
          className={cn(
            'w-full caption-bottom text-sm',
            'border-collapse',
            'forced-colors:border forced-colors:border-[ButtonBorder]',
            striped && '[&_tbody_tr:nth-child(even)]:bg-slate-50 dark:[&_tbody_tr:nth-child(even)]:bg-slate-900/30',
            stickyHeader && '[&_thead]:sticky [&_thead]:top-0 [&_thead]:bg-white dark:[&_thead]:bg-slate-950 [&_thead]:z-10',
            className,
          )}
          style={readabilityStyle}
          data-striped={striped || undefined}
          data-sticky-header={stickyHeader || undefined}
          {...rest}
        >
          {children}
        </table>
      </div>
    );
  },
);

// ── TableHeader ─────────────────────────────────────────────────────

const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...rest }, ref) {
    return (
      <thead
        ref={ref}
        className={cn(
          '[&_tr]:border-b border-slate-200 dark:border-slate-800',
          className,
        )}
        {...rest}
      />
    );
  },
);

// ── TableBody ───────────────────────────────────────────────────────

const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...rest }, ref) {
    return (
      <tbody
        ref={ref}
        className={cn('[&_tr:last-child]:border-0', className)}
        {...rest}
      />
    );
  },
);

// ── TableRow ────────────────────────────────────────────────────────

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({ className, ...rest }, ref) {
    const { profile } = useNeuro();
    const cellPadding =
      profile.spacing === 'relaxed'
        ? 'h-14'
        : profile.spacing === 'compact'
          ? 'h-10'
          : 'h-12';
    return (
      <tr
        ref={ref}
        className={cn(
          'border-b border-slate-200 dark:border-slate-800',
          cellPadding,
          'transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
          className,
        )}
        {...rest}
      />
    );
  },
);

// ── TableHead ───────────────────────────────────────────────────────

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  function TableHead(
    { sortable, sortDirection = 'none', onSort, className, children, ...rest },
    ref,
  ) {
    const { profile } = useNeuro();
    const cellPadding =
      profile.spacing === 'relaxed'
        ? 'px-6 py-4'
        : profile.spacing === 'compact'
          ? 'px-2 py-2'
          : 'px-4 py-3';

    return (
      <th
        ref={ref}
        aria-sort={
          sortable
            ? sortDirection === 'none'
              ? 'none'
              : sortDirection === 'asc'
                ? 'ascending'
                : 'descending'
            : undefined
        }
        className={cn(
          'text-left text-sm font-medium text-slate-900 dark:text-slate-50 whitespace-nowrap',
          cellPadding,
          sortable && 'cursor-pointer select-none',
          className,
        )}
        onClick={sortable ? onSort : undefined}
        {...rest}
      >
        <span className="inline-flex items-center">
          {children}
          {sortable && <SortIcon direction={sortDirection} />}
        </span>
      </th>
    );
  },
);

// ── TableCell ───────────────────────────────────────────────────────

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  function TableCell({ className, ...rest }, ref) {
    const { profile } = useNeuro();
    const cellPadding =
      profile.spacing === 'relaxed'
        ? 'px-6 py-4'
        : profile.spacing === 'compact'
          ? 'px-2 py-2'
          : 'px-4 py-3';
    return (
      <td
        ref={ref}
        className={cn('text-slate-900 dark:text-slate-50', cellPadding, className)}
        {...rest}
      />
    );
  },
);

// ── Export ──────────────────────────────────────────────────────────

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
});
