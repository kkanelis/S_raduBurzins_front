export const profileDesignThemes = {
  radu: {
    key: 'radu',
    label: 'Radu Burziņš',
    description: 'Tīrs ģimenes izskats ar tumšu un siltu Radu Burziņš identitāti.',
    background: '#2d232e',
    accent: '#e0ddcf',
    surface: '#474448',
    text: '#f1f0ea',
    frame: 'classic',
    decorations: 'elegant',
  },
  midnight: {
    key: 'midnight',
    label: 'Pusnakts',
    description: 'Tumšs nakts dizains ar smalkiem violeta gaismas akcentiem.',
    background: '#17111f',
    accent: '#b59ad7',
    surface: '#2d2338',
    text: '#f7f1fb',
    frame: 'ornate',
    decorations: 'stars',
  },
  nature: {
    key: 'nature',
    label: 'Daba',
    description: 'Mierīgs zaļu un zemes toņu dizains ar dabas ornamentiem.',
    background: '#dfe8dc',
    accent: '#55755b',
    surface: '#f4f6f0',
    text: '#2d3a2f',
    frame: 'soft',
    decorations: 'nature',
  },
  elegant: {
    key: 'elegant',
    label: 'Elegants',
    description: 'Gaišs, minimālistisks un ļoti tīrs moderns izkārtojums.',
    background: '#f1f0ea',
    accent: '#534b52',
    surface: '#ffffff',
    text: '#2d232e',
    frame: 'classic',
    decorations: 'minimal',
  },
  floral: {
    key: 'floral',
    label: 'Ziedi',
    description: 'Maigs pasteļrozā stils ar ziedu dekorāciju noskaņu.',
    background: '#f3e8e8',
    accent: '#b87586',
    surface: '#fffaf8',
    text: '#47383d',
    frame: 'soft',
    decorations: 'floral',
  },
  ocean: {
    key: 'ocean',
    label: 'Okeāns',
    description: 'Svaigs zilo un tirkīza toņu dizains ar jūras motīviem.',
    background: '#dfecef',
    accent: '#39798a',
    surface: '#f5fbfc',
    text: '#263d43',
    frame: 'classic',
    decorations: 'geometric',
  },
};

export const defaultProfileDesign = {
  theme: 'radu',
  background: profileDesignThemes.radu.background,
  accent: profileDesignThemes.radu.accent,
  frame: profileDesignThemes.radu.frame,
  decorations: profileDesignThemes.radu.decorations,
  coverX: 50,
  coverY: 50,
  coverScale: 1,
};

export function resolveProfileDesign(design) {
  const preset = profileDesignThemes[design?.theme] || profileDesignThemes.radu;
  return { ...preset, ...preset, ...(design || {}) };
}
