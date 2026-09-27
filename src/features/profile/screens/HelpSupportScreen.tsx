import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '../../../components/Card/Card';
import { Icon } from '../../../components/Icon/Icon';
import { ScreenContainer } from '../../../components/ScreenContainer/ScreenContainer';
import { colors, spacing, typography } from '../../../theme';

const FAQS = [
  {
    question: 'How do I book a doctor appointment?',
    answer: 'Go to the Book tab, choose Doctors, pick a specialty or search directly, then choose a consultation type and an available time slot.',
  },
  {
    question: 'How do I book a lab test?',
    answer: 'Go to the Book tab, switch to Labs, choose a test category or search for a lab, select your tests, and choose a home collection or lab visit slot.',
  },
  {
    question: 'How do I message a doctor or lab?',
    answer: 'Open a doctor or lab profile and use the chat option there. Once they accept your invitation, you can continue the conversation from your recent chats on Home.',
  },
  {
    question: 'How do I cancel or reschedule an appointment?',
    answer: 'Open the appointment from the Appointments tab — you can cancel a pending or confirmed appointment, or respond to a reschedule offer, from its detail screen.',
  },
  {
    question: 'How do I add a family member?',
    answer: 'Go to Profile → Family members to add, edit, or remove people you book appointments and lab tests on behalf of.',
  },
];

export default function HelpSupportScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScreenContainer>
      <Text style={[typography.label, { color: colors.inkFaint }]}>FREQUENTLY ASKED QUESTIONS</Text>
      <View style={{ gap: spacing.sm }}>
        {FAQS.map((faq, index) => {
          const open = openIndex === index;
          return (
            <Card key={faq.question} variant="outline" elevation="none">
              <Pressable onPress={() => setOpenIndex(open ? null : index)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={[typography.bodyStrong, { flex: 1, marginRight: spacing.sm }]}>{faq.question}</Text>
                  <Icon name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.inkFaint} />
                </View>
                {open && <Text style={[typography.body, { color: colors.inkSoft, marginTop: spacing.sm }]}>{faq.answer}</Text>}
              </Pressable>
            </Card>
          );
        })}
      </View>
    </ScreenContainer>
  );
}
