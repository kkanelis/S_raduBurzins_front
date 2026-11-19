import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Tutorial from './Tutorial';

vi.mock('../../../context/useAuth', () => ({
  useAuth: () => ({ user: null }),
}));

describe('Tutorial', () => {
  it('lets a new visitor step through the guide and open registration', () => {
    render(
      <MemoryRouter>
        <Tutorial />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Iepazīsti vietni soli pa solim' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '← Iepriekšējais' }).disabled).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Nākamais →' }));
    expect(screen.getByRole('heading', { name: 'Izveido kontu' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Atvērt reģistrāciju' }).getAttribute('href')).toBe('/register');

    fireEvent.click(screen.getByRole('button', { name: /Sagaidi konta apstiprinājumu/ }));
    expect(screen.getByRole('heading', { name: 'Sagaidi konta apstiprinājumu' })).toBeTruthy();
  });
});
