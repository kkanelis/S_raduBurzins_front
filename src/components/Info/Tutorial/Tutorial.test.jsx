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
    const stepButtons = screen.getByRole('navigation', { name: 'Ceļveža soļi' }).querySelectorAll('button');
    expect(stepButtons).toHaveLength(13);

    stepButtons.forEach((button) => {
      fireEvent.click(button);
      expect(document.body.textContent).not.toMatch(/admin|administrator/i);
    });

    fireEvent.click(stepButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Nākamais →' }));
    expect(screen.getByRole('heading', { name: 'Sakārto savu profilu' })).toBeTruthy();
    expect(screen.getByRole('list').children.length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'Apskati ģimenes locekļus' }));
    expect(screen.getByText(/atsevišķa pilna profila lapa netiek atvērta/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Pievieno pasākumu kalendāram' }));
    expect(screen.getByRole('heading', { name: 'Pievieno pasākumu kalendāram' })).toBeTruthy();
    expect(screen.getByText(/HH:mm/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Nākamais →' }));
    expect(screen.getByRole('heading', { name: 'Pārvaldi savus notikumus' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Lasi un pārlūko kalendāru' }));
    expect(screen.getByRole('heading', { name: 'Lasi un pārlūko kalendāru' })).toBeTruthy();
    expect(screen.getByText(/Leģenda zem režģa paskaidro krāsas/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Iestati paziņojumus' }));
    expect(screen.getByRole('heading', { name: 'Iestati paziņojumus' })).toBeTruthy();
    expect(screen.getByText(/Kalendāra atgādinājumi/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Dalies ar Radu pērlēm' }));
    expect(screen.getByText(/līdz astoņiem fotoattēliem vai video/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Raksti ģimenes čatā' }));
    expect(screen.getByText(/\/family-chat/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Apskati Ziemassvētku loteriju' }));
    expect(screen.getByText(/\/christmas/)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Sākums, jaunumi un idejas' }));
    expect(screen.getByText(/Atsauksme vai ideja tiek nosūtīta privāti/)).toBeTruthy();
  });
});
