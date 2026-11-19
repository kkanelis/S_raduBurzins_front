import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import Tutorial from './Tutorial';

describe('Tutorial', () => {
  it('walks through detailed website instructions without links to other pages', () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Iepazīsti vietni soli pa solim' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '← Iepriekšējais' }).disabled).toBe(true);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByRole('navigation', { name: 'Ceļveža soļi' }).querySelectorAll('button')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Nākamais →' }));
    expect(screen.getByRole('heading', { name: 'Sakārto savu profilu' })).toBeTruthy();
    expect(screen.getByRole('list').children.length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'Pievieno pasākumu kalendāram' }));
    expect(screen.getByRole('heading', { name: 'Pievieno pasākumu kalendāram' })).toBeTruthy();
    expect(screen.getByText(/HH:mm/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Nākamais →' }));
    expect(screen.getByRole('heading', { name: 'Pārvaldi savus notikumus' })).toBeTruthy();
  });
});
