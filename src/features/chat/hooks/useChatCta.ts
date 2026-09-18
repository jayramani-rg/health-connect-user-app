import { useCallback, useEffect, useState } from 'react';
import { chatService } from '../../../services/chatService';
import type { ChatProviderType } from '../types/chat.types';

export type ChatCtaState =
  | { kind: 'loading' }
  | { kind: 'invite' }
  | { kind: 'sending' }
  | { kind: 'pending'; invitationId: string }
  | { kind: 'chat'; conversationId: string };

/** Resolves the "Chat with Doctor/Laboratory" CTA state for a provider profile screen — backend remains the
 * source of truth (this just reads the caller's own invitations/conversations), never inferred locally. */
export function useChatCta(providerType: ChatProviderType, providerId: string) {
  const [state, setState] = useState<ChatCtaState>({ kind: 'loading' });

  const refresh = useCallback(async () => {
    try {
      const [conversationsRes, invitationsRes] = await Promise.all([
        chatService.listConversations(),
        chatService.listInvitations('PENDING'),
      ]);

      const conversation = conversationsRes.data.find(
        (c) => c.providerType === providerType && (providerType === 'DOCTOR' ? c.doctorProfileId : c.laboratoryId) === providerId,
      );
      if (conversation) {
        setState({ kind: 'chat', conversationId: conversation.id });
        return;
      }

      const invitation = invitationsRes.data.find(
        (i) => i.providerType === providerType && (providerType === 'DOCTOR' ? i.doctorProfileId : i.laboratoryId) === providerId,
      );
      if (invitation) {
        setState({ kind: 'pending', invitationId: invitation.id });
        return;
      }

      setState({ kind: 'invite' });
    } catch {
      setState({ kind: 'invite' });
    }
  }, [providerType, providerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendInvitation() {
    setState({ kind: 'sending' });
    try {
      await chatService.sendInvitation(providerType, providerId);
      await refresh();
    } catch {
      await refresh();
    }
  }

  return { state, refresh, sendInvitation };
}
