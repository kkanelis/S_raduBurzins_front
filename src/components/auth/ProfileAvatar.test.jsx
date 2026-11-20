import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import ProfileAvatar from './ProfileAvatar';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() },
}));

describe('ProfileAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:profile-avatar'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('loads the authenticated avatar and falls back to initials when unavailable', async () => {
    let resolveAvatar;
    api.get.mockReturnValue(new Promise((resolve) => {
      resolveAvatar = resolve;
    }));

    const user = {
      first_name: 'Jānis',
      last_name: 'Bērziņš',
      avatar_path: 'avatars/janis.png',
      updated_at: '2026-11-20T09:00:00.000000Z',
    };

    const { rerender } = render(<ProfileAvatar user={user} />);

    expect(screen.getByText('JB')).toBeTruthy();
    expect(api.get).toHaveBeenCalledWith('/api/profile/avatar', expect.objectContaining({
      responseType: 'blob',
      params: { updated_at: user.updated_at },
    }));

    await act(async () => {
      resolveAvatar({ data: new Blob(['image']) });
    });

    expect(screen.getByRole('img', { name: 'Jānis Bērziņš' }).getAttribute('src')).toBe('blob:profile-avatar');

    api.get.mockRejectedValueOnce(new Error('Avatar unavailable'));
    rerender(<ProfileAvatar user={{ ...user, updated_at: '2026-11-21T09:00:00.000000Z' }} />);

    expect(await screen.findByText('JB')).toBeTruthy();
  });
});
