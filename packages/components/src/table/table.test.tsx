import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { NeuroProvider, type SensoryProfileOverrides } from '@neuroui/core';

import { Table } from './table';

// ── Test Helpers ────────────────────────────────────────────────────

function renderWithProfile(
  profile: SensoryProfileOverrides,
  ui: React.ReactElement,
) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <NeuroProvider profile={profile}>{children}</NeuroProvider>
    ),
  });
}

// ── Setup/Teardown ──────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
  document.documentElement.removeAttribute('style');
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-neuro');
  document.documentElement.removeAttribute('style');
});

// ── Tests ───────────────────────────────────────────────────────────

describe('Table', () => {
  it('renders table structure with data-neuro-component', () => {
    renderWithProfile(
      {},
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>John</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const wrapper = document.querySelector('[data-neuro-component="table"]');
    expect(wrapper).toBeInTheDocument();

    const table = wrapper?.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderWithProfile(
      {},
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Name</Table.Head>
            <Table.Head>Email</Table.Head>
          </Table.Row>
        </Table.Header>
      </Table>,
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    const thead = document.querySelector('thead');
    expect(thead).toBeInTheDocument();
  });

  it('renders table body with cells', () => {
    renderWithProfile(
      {},
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>John</Table.Cell>
            <Table.Cell>john@example.com</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();

    const tbody = document.querySelector('tbody');
    expect(tbody).toBeInTheDocument();
  });

  it('renders multiple rows', () => {
    renderWithProfile(
      {},
      <Table>
        <Table.Body>
          <Table.Row>
            <Table.Cell>John</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Jane</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const rows = document.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
  });

  describe('striped variant', () => {
    it('renders data-striped attribute when striped is true', () => {
      renderWithProfile(
        {},
        <Table striped>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table).toHaveAttribute('data-striped', 'true');
    });

    it('does not render data-striped when striped is false', () => {
      renderWithProfile(
        {},
        <Table striped={false}>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table).not.toHaveAttribute('data-striped');
    });

    it('applies alternating background classes when striped', () => {
      renderWithProfile(
        {},
        <Table striped>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Row 2</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table?.className).toContain('[&_tbody_tr:nth-child(even)]:bg-slate-50');
    });
  });

  describe('sticky header', () => {
    it('renders data-sticky-header attribute when stickyHeader is true', () => {
      renderWithProfile(
        {},
        <Table stickyHeader>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table).toHaveAttribute('data-sticky-header', 'true');
    });

    it('does not render data-sticky-header when stickyHeader is false', () => {
      renderWithProfile(
        {},
        <Table stickyHeader={false}>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table).not.toHaveAttribute('data-sticky-header');
    });

    it('applies sticky positioning classes when stickyHeader is true', () => {
      renderWithProfile(
        {},
        <Table stickyHeader>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const table = document.querySelector('table');
      expect(table?.className).toContain('[&_thead]:sticky');
      expect(table?.className).toContain('[&_thead]:top-0');
      expect(table?.className).toContain('[&_thead]:z-10');
    });
  });

  describe('sortable columns', () => {
    it('renders sortable header with aria-sort', () => {
      const handleSort = vi.fn();

      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable onSort={handleSort}>
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).toHaveAttribute('aria-sort', 'none');
      expect(header?.className).toContain('cursor-pointer');
    });

    it('renders ascending sort direction', () => {
      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable sortDirection="asc">
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).toHaveAttribute('aria-sort', 'ascending');
    });

    it('renders descending sort direction', () => {
      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable sortDirection="desc">
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).toHaveAttribute('aria-sort', 'descending');
    });

    it('calls onSort when clicking sortable header', () => {
      const handleSort = vi.fn();

      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable onSort={handleSort}>
                Name
              </Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      header?.click();

      expect(handleSort).toHaveBeenCalledTimes(1);
    });

    it('does not have aria-sort when not sortable', () => {
      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header).not.toHaveAttribute('aria-sort');
    });

    it('renders sort icon for sortable header', () => {
      renderWithProfile(
        {},
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head sortable>Name</Table.Head>
            </Table.Row>
          </Table.Header>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      const svg = header?.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('spacing preferences', () => {
    it('applies relaxed spacing to cells', () => {
      renderWithProfile(
        { spacing: 'relaxed' },
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header?.className).toContain('px-6');
      expect(header?.className).toContain('py-4');

      const cell = screen.getByText('John');
      expect(cell.className).toContain('px-6');
      expect(cell.className).toContain('py-4');
    });

    it('applies compact spacing to cells', () => {
      renderWithProfile(
        { spacing: 'compact' },
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header?.className).toContain('px-2');
      expect(header?.className).toContain('py-2');

      const cell = screen.getByText('John');
      expect(cell.className).toContain('px-2');
      expect(cell.className).toContain('py-2');
    });

    it('applies standard spacing to cells', () => {
      renderWithProfile(
        { spacing: 'normal' },
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.Head>Name</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const header = screen.getByText('Name').closest('th');
      expect(header?.className).toContain('px-4');
      expect(header?.className).toContain('py-3');

      const cell = screen.getByText('John');
      expect(cell.className).toContain('px-4');
      expect(cell.className).toContain('py-3');
    });

    it('applies relaxed row height', () => {
      renderWithProfile(
        { spacing: 'relaxed' },
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const row = screen.getByText('John').closest('tr');
      expect(row?.className).toContain('h-14');
    });

    it('applies compact row height', () => {
      renderWithProfile(
        { spacing: 'compact' },
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell>John</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>,
      );

      const row = screen.getByText('John').closest('tr');
      expect(row?.className).toContain('h-10');
    });
  });

  it('forwards ref to table element', () => {
    const ref = vi.fn();
    renderWithProfile(
      {},
      <Table ref={ref}>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Cell</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    expect(ref).toHaveBeenCalled();
    const firstCall = ref.mock.calls[0];
    expect(firstCall?.[0]).toBeInstanceOf(HTMLTableElement);
  });

  it('applies custom className to table', () => {
    renderWithProfile(
      {},
      <Table className="custom-table">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Cell</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const table = document.querySelector('table');
    expect(table?.className).toContain('custom-table');
  });

  it('applies custom className to components', () => {
    renderWithProfile(
      {},
      <Table>
        <Table.Header className="custom-header">
          <Table.Row className="custom-row">
            <Table.Head className="custom-head">Name</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body className="custom-body">
          <Table.Row>
            <Table.Cell className="custom-cell">John</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>,
    );

    const thead = document.querySelector('thead');
    expect(thead?.className).toContain('custom-header');

    const headerRow = thead?.querySelector('tr');
    expect(headerRow?.className).toContain('custom-row');

    const head = screen.getByText('Name').closest('th');
    expect(head?.className).toContain('custom-head');

    const tbody = document.querySelector('tbody');
    expect(tbody?.className).toContain('custom-body');

    const cell = screen.getByText('John');
    expect(cell.className).toContain('custom-cell');
  });
});
