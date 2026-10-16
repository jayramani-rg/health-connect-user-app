import type { ChatMessage, OutgoingChatMessage } from '../types/chat.types';

export type ChatRow = ChatMessage | OutgoingChatMessage;

function isPendingOutgoing(row: ChatRow): row is OutgoingChatMessage {
  return 'clientId' in row && row.sendState !== 'sent';
}

export function mergeIncoming(rows: ChatRow[], incoming: ChatMessage, isMine: boolean): ChatRow[] {
  if (rows.some((row) => row.id === incoming.id)) return rows;

  if (isMine) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const row = rows[i];
      if (isPendingOutgoing(row) && row.body === incoming.body) {
        const next = [...rows];
        next[i] = { ...incoming, clientId: row.clientId, sendState: 'sent' };
        return next;
      }
    }
  }

  return [incoming, ...rows];
}

export function mergeSent(rows: ChatRow[], sent: ChatMessage, clientId: string): ChatRow[] {
  const isOwnRow = (row: ChatRow) => 'clientId' in row && row.clientId === clientId;
  const existing = rows.find((row) => row.id === sent.id);
  const merged: OutgoingChatMessage = { ...sent, readAtUtc: existing?.readAtUtc ?? sent.readAtUtc, clientId, sendState: 'sent' };

  return rows.filter((row) => row.id !== sent.id || isOwnRow(row)).map((row) => (isOwnRow(row) ? merged : row));
}

export function appendOlder(rows: ChatRow[], older: ChatMessage[]): ChatRow[] {
  const known = new Set(rows.map((row) => row.id));
  return [...rows, ...older.filter((row) => !known.has(row.id))];
}
