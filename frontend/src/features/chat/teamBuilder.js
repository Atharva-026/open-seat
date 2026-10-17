export const SIZE_INTENT = /\b(?:team|group) of ([2-4])\b|\b([2-4]) (?:members?|people|persons?|teammates?)\b/i;

// stage: 'size' | 'need' | 'pick' | 'ready'. size counts you.
export const emptyBuilder = (extra = {}) => ({
  stage: 'size', size: null, fixed: [], picked: [], teamId: null, teamName: '', ...extra,
});

export const filledCount = (b) => 1 + b.fixed.length + b.picked.length;
export const isFull = (b) => b.size !== null && filledCount(b) >= b.size;
export const seatPrompt = (b) =>
  `Seat ${filledCount(b) + 1} of ${b.size}. What do you need for this seat? Describe a role or skills.`;

export function seatsOf(b, myName) {
  const people = [
    { label: myName, you: true, state: 'filled' },
    ...[...b.fixed, ...b.picked].map((p) => ({ label: p.name, state: 'filled' })),
  ];
  const open = Math.max((b.size ?? people.length) - people.length, 0);
  return [...people, ...Array.from({ length: open }, () => ({ label: 'Open', state: 'open' }))];
}

export function composerPlaceholder(b) {
  if (!b) return 'Describe who you need';
  if (b.stage === 'size') return 'Type 2, 3 or 4, or use the buttons above';
  if (b.stage === 'ready') return 'Send the invitations above, or ask something else';
  return `Seat ${filledCount(b) + 1} of ${b.size}: describe the role or skills`;
}