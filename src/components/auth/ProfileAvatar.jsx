import { useEffect, useState } from 'react';
import api from '../../services/api';

function ProfileAvatar({ user, className = '' }) {
  const [imageUrl, setImageUrl] = useState('');
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl = '';

    setImageUrl('');

    if (!user?.avatar_path) {
      return () => controller.abort();
    }

    api.get('/api/profile/avatar', {
      responseType: 'blob',
      params: { updated_at: user.updated_at || '' },
      signal: controller.signal,
    })
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          objectUrl = URL.createObjectURL(data);
          setImageUrl(objectUrl);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setImageUrl('');
      });

    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [user?.avatar_path, user?.updated_at]);

  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-dark-purple to-medium-purple text-sm font-black text-white ${className}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={`${user.first_name} ${user.last_name}`} className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  );
}

export default ProfileAvatar;
