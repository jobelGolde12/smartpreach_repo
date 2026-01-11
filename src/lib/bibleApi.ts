export interface BibleVerse {
  book_name: string
  book_id: string
  chapter: number
  verse: number
  text: string
  reference: string
}

export interface BibleResponse {
  reference: string
  verses: BibleVerse[]
  text: string
  translation_id: string
  translation_name: string
  translation_note: string
}

const BIBLE_API_BASE = 'https://bible-api.com'

export async function fetchVerse(reference: string): Promise<BibleVerse[]> {
  const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(reference)}?translation=kjv`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return []
  }

  const data: BibleResponse = await response.json()

  if (!data.verses || data.verses.length === 0) {
    return []
  }

  return data.verses.map((verse) => ({
    ...verse,
    reference: data.reference,
  }))
}

const KEYWORD_TO_VERSE_MAP: Record<string, BibleVerse[]> = {
  'love': [
    {
      book_name: 'John',
      book_id: 'JHN',
      chapter: 3,
      verse: 16,
      text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.',
      reference: 'John 3:16',
    },
    {
      book_name: '1 Corinthians',
      book_id: '1CO',
      chapter: 13,
      verse: 4,
      text: 'Charity suffereth long, and is kind; charity envieth not, charity vaunteth not itself, is not puffed up.',
      reference: '1 Corinthians 13:4',
    },
    {
      book_name: '1 John',
      book_id: '1JN',
      chapter: 4,
      verse: 8,
      text: 'He that loveth not knoweth God; for God is love.',
      reference: '1 John 4:8',
    },
  ],
  'faith': [
    {
      book_name: 'Hebrews',
      book_id: 'HEB',
      chapter: 11,
      verse: 1,
      text: 'Now faith is the substance of things hoped for, the evidence of things not seen.',
      reference: 'Hebrews 11:1',
    },
    {
      book_name: 'Romans',
      book_id: 'ROM',
      chapter: 10,
      verse: 17,
      text: 'So faith cometh by hearing, and hearing by the word of God.',
      reference: 'Romans 10:17',
    },
  ],
  'hope': [
    {
      book_name: 'Romans',
      book_id: 'ROM',
      chapter: 15,
      verse: 13,
      text: 'Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.',
      reference: 'Romans 15:13',
    },
    {
      book_name: 'Jeremiah',
      book_id: 'JER',
      chapter: 29,
      verse: 11,
      text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.',
      reference: 'Jeremiah 29:11',
    },
  ],
  'grace': [
    {
      book_name: 'Ephesians',
      book_id: 'EPH',
      chapter: 2,
      verse: 8,
      text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.',
      reference: 'Ephesians 2:8',
    },
    {
      book_name: '2 Corinthians',
      book_id: '2CO',
      chapter: 12,
      verse: 9,
      text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.',
      reference: '2 Corinthians 12:9',
    },
  ],
  'peace': [
    {
      book_name: 'Philippians',
      book_id: 'PHP',
      chapter: 4,
      verse: 7,
      text: 'And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.',
      reference: 'Philippians 4:7',
    },
    {
      book_name: 'John',
      book_id: 'JHN',
      chapter: 14,
      verse: 27,
      text: 'Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you.',
      reference: 'John 14:27',
    },
  ],
  'salvation': [
    {
      book_name: 'Ephesians',
      book_id: 'EPH',
      chapter: 2,
      verse: 8,
      text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.',
      reference: 'Ephesians 2:8',
    },
    {
      book_name: 'Romans',
      book_id: 'ROM',
      chapter: 10,
      verse: 9,
      text: 'That if thou shalt confess with thy mouth the Lord Jesus, and shalt believe in thine heart that God hath raised him from the dead, thou shalt be saved.',
      reference: 'Romans 10:9',
    },
  ],
  'prayer': [
    {
      book_name: 'Philippians',
      book_id: 'PHP',
      chapter: 4,
      verse: 6,
      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.',
      reference: 'Philippians 4:6',
    },
    {
      book_name: 'Matthew',
      book_id: 'MAT',
      chapter: 6,
      verse: 9,
      text: 'After this manner therefore pray ye: Our Father which art in heaven, Hallowed be thy name.',
      reference: 'Matthew 6:9',
    },
  ],
  'strength': [
    {
      book_name: 'Philippians',
      book_id: 'PHP',
      chapter: 4,
      verse: 13,
      text: 'I can do all things through Christ which strengtheneth me.',
      reference: 'Philippians 4:13',
    },
    {
      book_name: 'Isaiah',
      book_id: 'ISA',
      chapter: 40,
      verse: 31,
      text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.',
      reference: 'Isaiah 40:31',
    },
  ],
  'wisdom': [
    {
      book_name: 'Proverbs',
      book_id: 'PRO',
      chapter: 3,
      verse: 5,
      text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.',
      reference: 'Proverbs 3:5',
    },
    {
      book_name: 'James',
      book_id: 'JAS',
      chapter: 1,
      verse: 5,
      text: 'If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.',
      reference: 'James 1:5',
    },
  ],
}

export async function searchByKeyword(keyword: string): Promise<BibleVerse[]> {
  const normalizedKeyword = keyword.toLowerCase().trim()
  
  const matchingVerses = KEYWORD_TO_VERSE_MAP[normalizedKeyword]
  if (matchingVerses) {
    return matchingVerses
  }

  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(keyword)}?translation=kjv`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      return []
    }

    const data: BibleResponse = await response.json()

    if (!data.verses || data.verses.length === 0) {
      return []
    }

    return data.verses.map((verse) => ({
      ...verse,
      reference: data.reference,
    }))
  } catch (error) {
    console.error('Error searching by keyword:', error)
    return []
  }
}
