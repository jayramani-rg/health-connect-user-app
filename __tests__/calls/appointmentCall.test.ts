import { callTypeForConsultation, resolveAppointmentCall, type CallableAppointment } from '../../src/features/calls/utils/appointmentCall';

const START = '2026-10-07T10:00:00Z';

function appointment(overrides: Partial<CallableAppointment> = {}): CallableAppointment {
  return { consultationType: 'VOICE', status: 'CONFIRMED', scheduledStartAtUtc: START, durationMinutes: 30, ...overrides };
}

describe('callTypeForConsultation', () => {
  it('maps the consultation type to exactly one call type', () => {
    expect(callTypeForConsultation('VOICE')).toBe('VOICE');
    expect(callTypeForConsultation('VIDEO')).toBe('VIDEO');
    expect(callTypeForConsultation('IN_CLINIC')).toBeNull();
    expect(callTypeForConsultation('SOMETHING_ELSE')).toBeNull();
  });
});

describe('resolveAppointmentCall', () => {
  const during = new Date('2026-10-07T10:05:00Z');

  it('offers only a voice call for a voice appointment', () => {
    const result = resolveAppointmentCall(appointment({ consultationType: 'VOICE' }), during);

    expect(result).toEqual({ visible: true, callType: 'VOICE', enabled: true, hint: null });
  });

  it('offers only a video call for a video appointment', () => {
    const result = resolveAppointmentCall(appointment({ consultationType: 'VIDEO' }), during);

    expect(result).toEqual({ visible: true, callType: 'VIDEO', enabled: true, hint: null });
  });

  it('offers no call for an in clinic appointment', () => {
    expect(resolveAppointmentCall(appointment({ consultationType: 'IN_CLINIC' }), during)).toEqual({ visible: false });
  });

  it.each(['PENDING', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED', 'NO_SHOW', 'RESCHEDULE_PROPOSED'])(
    'offers no call for a %s appointment',
    (status) => {
      expect(resolveAppointmentCall(appointment({ status }), during)).toEqual({ visible: false });
    },
  );

  it('shows a disabled button with a hint before the window opens', () => {
    const result = resolveAppointmentCall(appointment(), new Date('2026-10-07T08:00:00Z'));

    expect(result).toMatchObject({ visible: true, enabled: false });
    expect(result.visible && result.hint).toMatch(/open/i);
  });

  it('opens fifteen minutes before the start', () => {
    expect(resolveAppointmentCall(appointment(), new Date('2026-10-07T09:44:00Z'))).toMatchObject({ enabled: false });
    expect(resolveAppointmentCall(appointment(), new Date('2026-10-07T09:45:00Z'))).toMatchObject({ enabled: true });
  });

  it('closes after the duration plus the grace period', () => {
    expect(resolveAppointmentCall(appointment(), new Date('2026-10-07T10:45:00Z'))).toMatchObject({ enabled: true });
    const closed = resolveAppointmentCall(appointment(), new Date('2026-10-07T10:46:00Z'));
    expect(closed).toMatchObject({ visible: true, enabled: false });
  });

  it('ignores the time window once the appointment is in progress', () => {
    const result = resolveAppointmentCall(appointment({ status: 'IN_PROGRESS' }), new Date('2026-10-07T14:00:00Z'));

    expect(result).toEqual({ visible: true, callType: 'VOICE', enabled: true, hint: null });
  });
});
