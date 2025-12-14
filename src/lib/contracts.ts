export interface Contract {
  id: string;
  title: string;
  category: Category;
  tags?: string[];
  description: string;
}

export type Category =
  | 'featured'
  | 'producer'
  | 'licensing'
  | 'studio'
  | 'creator'
  | 'other';

export const categories: Record<Category, string> = {
  featured: 'Featured Contracts',
  producer: 'Producer Agreements',
  licensing: 'Licensing',
  studio: 'Studio Agreements',
  creator: 'Creator & Influencer Contracts',
  other: 'Other Documents',
};

export const contracts: Contract[] = [
  {
    id: 'mpc',
    title: 'Comprehensive Music Producer Contract Package',
    category: 'featured',
    tags: ['comprehensive', 'all-in-one'],
    description:
      'A complete package of contracts used to help record producers set up and run their business.',
  },
  {
    id: 'fa3',
    title: 'Featured Artist Agreement (Royalty and Song Rights)',
    category: 'featured',
    tags: ['royalty', 'song-rights'],
    description:
      'Agreement for featured artists, including royalty payments and retention of song rights for their contribution to the recording.',
  },
  {
    id: 'fa2',
    title: 'Featured Artist Agreement (Royalty/No Song Rights)',
    category: 'featured',
    tags: ['royalty', 'no-song-rights'],
    description:
      'Agreement for featured artists, including royalty payments but no rights to the lyrics or music of the song recorded.',
  },
  {
    id: 'fa1',
    title: 'Featured Artist Agreement (No Royalty/Song Rights)',
    category: 'featured',
    tags: ['no-royalty', 'song-rights'],
    description:
      'Agreement for featured artists with no royalty payments, but retention of rights to their contribution to the song.',
  },
  {
    id: 'lod',
    title: 'Letter of Direction (To Record Company)',
    category: 'other',
    tags: ['direction', 'payment'],
    description:
      'Used to notify and direct a record company to make payments of fees or royalties to the producer.',
  },
  {
    id: 'mul1',
    title: 'Master Use License (Audiovisual Work)',
    category: 'licensing',
    tags: ['master-use', 'audiovisual'],
    description:
      'License for using a master recording in films, videos, music videos, TV programs, or TV advertisements.',
  },
  {
    id: 'mul2',
    title: 'Master Use License (Compilation)',
    category: 'licensing',
    tags: ['master-use', 'compilation'],
    description:
      'License for using a master recording owned by one record company in a compilation album by another company.',
  },
  {
    id: 'ml',
    title: 'Mechanical License',
    category: 'licensing',
    tags: ['mechanical', 'cover-song'],
    description:
      'License for recording and distributing a song written by someone else (cover song).',
  },
  {
    id: 'pcg',
    title: 'Parental Consent and Guarantee (Used with Minors)',
    category: 'other',
    tags: ['minor', 'consent', 'guarantee'],
    description:
      'Document for parental consent and guarantee when contracting with a minor (under 18).',
  },
  {
    id: 'pada',
    title: 'Producer and Artist Development Agreement',
    category: 'producer',
    tags: ['development', 'speculative'],
    description:
      'Agreement for a producer to provide services to an artist on a speculative basis.',
  },
  {
    id: 'papa',
    title: 'Producer and Artist Production Agreement',
    category: 'producer',
    tags: ['production', 'artist-owned'],
    description:
      'Agreement for a producer to produce recordings for an artist, whether the artist owns the recordings or is signed to a label.',
  },
  {
    id: 'ppca',
    title: 'Producer and Production Company Agreement',
    category: 'producer',
    tags: ['production', 'exclusive'],
    description:
      'Contract for a producer to create instrumental tracks exclusively for a production company.',
  },
  {
    id: 'prcpa',
    title: 'Producer and Record Company Production Agreement',
    category: 'producer',
    tags: ['production', 'record-label'],
    description:
      "Agreement for a producer to produce recordings for a record company's contracted artist.",
  },
  {
    id: 'pd',
    title: 'Producer Declaration',
    category: 'producer',
    tags: ['declaration', 'ownership'],
    description:
      'Declaration used by a record label to obtain ownership rights in a master recording produced under an artist-producer contract.',
  },
  {
    id: 'pt1a',
    title: 'Producer of Tracks Agreement #1-Artist (No Royalty/Song Rights)',
    category: 'producer',
    tags: ['no-royalty', 'song-rights', 'artist'],
    description:
      'Agreement for producers creating tracks for artists, with no royalties but retention of song rights.',
  },
  {
    id: 'pt2a',
    title: 'Producer of Tracks Agreement #2-Artist (No Royalty/No Song Rights)',
    category: 'producer',
    tags: ['no-royalty', 'no-song-rights', 'artist'],
    description:
      'Agreement for producers creating tracks for artists, with no royalties and no song rights.',
  },
  {
    id: 'pt3a',
    title: 'Producer of Tracks Agreement #3-Artist (Royalty/Song Rights)',
    category: 'producer',
    tags: ['royalty', 'song-rights', 'artist'],
    description:
      'Agreement for producers creating tracks for artists, including royalties and retention of song rights.',
  },
  {
    id: 'pt4a',
    title: 'Producer of Tracks Agreement #4-Artist (Royalty/No Song Rights)',
    category: 'producer',
    tags: ['royalty', 'no-song-rights', 'artist'],
    description:
      'Agreement for producers creating tracks for artists, including royalties but no song rights.',
  },
  {
    id: 'pt1l',
    title: 'Producer of Tracks Agreement #1-Label (No Royalty/Song Rights)',
    category: 'producer',
    tags: ['no-royalty', 'song-rights', 'label'],
    description:
      'Agreement for producers creating tracks for record labels, with no royalties but retention of song rights.',
  },
  {
    id: 'pt2l',
    title: 'Producer of Tracks Agreement #2-Label (No Royalty/No Song Rights)',
    category: 'producer',
    tags: ['no-royalty', 'no-song-rights', 'label'],
    description:
      'Agreement for producers creating tracks for record labels, with no royalties and no song rights.',
  },
  {
    id: 'pt3l',
    title: 'Producer of Tracks Agreement #3-Label (Royalty/Song Rights)',
    category: 'producer',
    tags: ['royalty', 'song-rights', 'label'],
    description:
      'Agreement for producers creating tracks for record labels, including royalties and retention of song rights.',
  },
  {
    id: 'pt4l',
    title: 'Producer of Tracks Agreement #4-Label (Royalty/No Song Rights)',
    category: 'producer',
    tags: ['royalty', 'no-song-rights', 'label'],
    description:
      'Agreement for producers creating tracks for record labels, including royalties but no song rights.',
  },
  {
    id: 'ptla',
    title: 'Producer of Tracks License Agreement (Non-Exclusive)',
    category: 'licensing',
    tags: ['non-exclusive', 'lease'],
    description:
      'Non-exclusive license agreement for producers to lease their tracks to artists.',
  },
  {
    id: 'rea',
    title: 'Recording Engineer Agreement',
    category: 'studio',
    tags: ['engineer', 'recording'],
    description:
      'Contract for a recording engineer to provide services for an artist or record label.',
  },
  {
    id: 'rsra',
    title: 'Recording Studio Rental Agreement',
    category: 'studio',
    tags: ['studio-rental', 'facilities'],
    description:
      'Agreement for renting recording studio facilities and services.',
  },
  {
    id: 'rpa',
    title: 'Release From Production Agreement',
    category: 'producer',
    tags: ['release', 'termination'],
    description:
      'Agreement to release parties from obligations under a previously signed production contract.',
  },
  {
    id: 'saa',
    title: 'Side Artist Agreement (No Royalty/No Song Rights)',
    category: 'other',
    tags: ['side-artist', 'no-royalty', 'no-song-rights'],
    description:
      'Agreement for side artists performing on a recording, with no royalties and no song rights.',
  },
  {
    id: 'bsa',
    title: 'Brand Sponsorship Agreement',
    category: 'creator',
    tags: ['sponsorship', 'brand-deal', 'influencer', 'streamer'],
    description:
      'Agreement for streamers and influencers to promote brands through sponsored content, including payment terms, content requirements, and FTC compliance.',
  },
  {
    id: 'ppa-twitch',
    title: 'Twitch Partnership Agreement',
    category: 'creator',
    tags: ['twitch', 'platform', 'partnership', 'streamer'],
    description:
      'Partnership agreement for Twitch streamers, including revenue share terms, exclusivity requirements, and platform-specific obligations.',
  },
  {
    id: 'ppa-youtube',
    title: 'YouTube Partner Program Agreement',
    category: 'creator',
    tags: ['youtube', 'platform', 'partnership', 'creator'],
    description:
      'Partnership agreement for YouTube creators, including monetization terms, content ownership, and platform policies.',
  },
  {
    id: 'ppa-tiktok',
    title: 'TikTok Creator Fund Agreement',
    category: 'creator',
    tags: ['tiktok', 'platform', 'partnership', 'creator'],
    description:
      'Creator Fund agreement for TikTok creators, including payment terms, content requirements, and platform-specific terms.',
  },
  {
    id: 'imc',
    title: 'Influencer Management Contract',
    category: 'creator',
    tags: ['management', 'influencer', 'streamer', 'agent'],
    description:
      'Management contract for influencers and streamers, including management fees, services provided, term length, and commission structure.',
  },
];
