import { patientProgress } from '../../src/features/labBookings/utils/labProgress';

const home = { collectionMethod: 'HOME_COLLECTION' as const, collectorName: null, laboratoryName: 'City Lab' };

describe('patientProgress', () => {
  it('shows the lab handling collection when nobody is assigned', () => {
    const progress = patientProgress({ ...home, status: 'CONFIRMED' });
    expect(progress.steps.map(step => step.state)).toEqual(['done', 'done', 'current', 'upcoming']);
    expect(progress.steps[2].detail).toBe('Arranged by the lab');
    expect(progress.reportsExpected).toBe(false);
  });

  it('names the collector when one is assigned', () => {
    const progress = patientProgress({ ...home, status: 'ON_THE_WAY', collectorName: 'Ravi Patel' });
    expect(progress.message).toContain('Ravi Patel');
    expect(progress.steps[2].detail).toBe('On the way');
  });

  it('does not claim a report is ready before it is uploaded', () => {
    expect(patientProgress({ ...home, status: 'SAMPLE_COLLECTED' }).headline).not.toMatch(/ready/i);
    expect(patientProgress({ ...home, status: 'PROCESSING' }).steps[3].state).toBe('current');
    expect(patientProgress({ ...home, status: 'REPORT_READY' }).steps.every(step => step.state === 'done')).toBe(true);
  });

  it('labels the lab visit path without collector wording', () => {
    const progress = patientProgress({ ...home, collectionMethod: 'LAB_VISIT', status: 'CONFIRMED' });
    expect(progress.steps[2].label).toBe('Lab visit');
    expect(progress.message).toContain('Visit City Lab');
  });

  it('hides the tracker for closed bookings', () => {
    ['CANCELLED', 'REJECTED', 'EXPIRED', 'NO_SHOW'].forEach(status => {
      expect(patientProgress({ ...home, status: status as never }).steps).toEqual([]);
    });
  });
});
