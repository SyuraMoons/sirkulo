export const USER_MODES = ['Customer', 'Recycler', 'Business'] as const;

export type UserMode = (typeof USER_MODES)[number];

export interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  online: boolean;
}

export const MOCK_CHATS: ChatItem[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    lastMessage: 'Apakah botol kaca masih tersedia?',
    time: '10:30',
    online: true,
  },
  {
    id: '2',
    name: 'Siti Aminah',
    lastMessage: 'Saya tertarik dengan vas bunga Anda',
    time: '09:15',
    online: false,
  },
  {
    id: '3',
    name: 'Dedi Cahyono',
    lastMessage: 'Bisa dikirim ke alamat saya?',
    time: 'Kemarin',
    online: false,
  },
];

export interface MessageItem {
  id: number;
  text: string;
  sent: boolean;
  time: string;
}

export const MOCK_MESSAGES: Record<string, MessageItem[]> = {
  '1': [
    { id: 1, text: 'Apakah botol kaca masih tersedia?', sent: false, time: '10:30' },
    { id: 2, text: 'Ya, masih tersedia', sent: true, time: '10:32' },
    { id: 3, text: 'Apakah Anda ingin membelinya?', sent: true, time: '10:33' },
  ],
};
