// Open seats posted by demo teams, so the board has something to rank from day one.
const TEAM_NAMES = [
  'Night Shift', 'Edge Cases', 'Cold Start', 'Hot Path',
  'Dead Letter', 'Rubber Duck', 'Stack Trace', 'Merge Conflict',
];

const SEATS = [
  { title: 'Computer vision engineer', skills: ['Computer Vision', 'PyTorch'], pitch: 'We are detecting crop disease from phone photos and need someone who has trained a model before.' },
  { title: 'Frontend with taste', skills: ['React', 'Framer Motion'], pitch: 'Our API works. Our interface does not. We need someone who sweats the details.' },
  { title: 'DevOps to keep us alive', skills: ['Docker', 'CI_CD'], pitch: 'We want a deploy that works on the first try and a pipeline that catches our mistakes.' },
  { title: 'Designer who ships', skills: ['Figma', 'UI/UX Design'], pitch: 'Two engineers, zero designers. Help us build something people open twice.' },
  { title: 'Realtime backend', skills: ['Express', 'WebSockets'], pitch: 'A live dashboard for event volunteers that cannot fall over on demo day.' },
  { title: 'Data storyteller', skills: ['Data Visualization', 'Pandas'], pitch: 'We have the dataset and no idea how to show what it says.' },
  { title: 'Pitch lead', skills: ['Product Pitching', 'Technical Writing'], pitch: 'The build is on track. We need someone to turn it into three clear minutes.' },
  { title: 'ML engineer', skills: ['PyTorch', 'Hugging Face'], pitch: 'We want to fine-tune a small model on campus data and need a second pair of hands.' },
];

export function generateBoard(people) {
  return SEATS.map((seat, i) => {
    const owner = people[(i * 5 + 3) % people.length];
    const member = people[(i * 5 + 11) % people.length];
    return {
      id: `demo-board-${i + 1}`,
      name: TEAM_NAMES[i],
      createdBy: owner.githubLogin,
      size: 4,
      members: [owner.githubLogin, member.githubLogin],
      seatId: `demo-seat-${i + 1}`,
      seatTitle: seat.title,
      seatPitch: seat.pitch,
      seatSkills: seat.skills,
      agoMs: (i * 53 + 7) * 60 * 1000,
    };
  });
}