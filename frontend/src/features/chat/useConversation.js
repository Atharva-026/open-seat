import { useCallback, useRef, useState } from 'react';
import { askMatcher } from '../../api/agent.api.js';
import { createTeam, inviteMore } from '../../api/teams.api.js';
import {
  SIZE_INTENT, emptyBuilder, filledCount, isFull, seatPrompt, seatsOf,
} from './teamBuilder.js';

const HISTORY_SENT = 10;
const newId = () => crypto.randomUUID();
const userMessage = (text) => ({ id: newId(), role: 'user', kind: 'text', text });
const botMessage = (text, extra = {}) => ({ id: newId(), role: 'assistant', kind: 'builder', text, ...extra });

// One conversation: free chat with the agent, plus a guided team builder that fills the seats.
export function useConversation({ myName, onTeamChanged }) {
  const [messages, setMessagesState] = useState([]);
  const [builder, setBuilderState] = useState(null);
  const [pending, setPending] = useState(false);
  const messagesRef = useRef([]);
  const builderRef = useRef(null);

  const append = useCallback((...items) => {
    messagesRef.current = [...messagesRef.current, ...items];
    setMessagesState(messagesRef.current);
  }, []);

  const setBuilder = useCallback((next) => {
    builderRef.current = next;
    setBuilderState(next);
  }, []);

  const askAgent = useCallback(async (shown, query) => {
    const history = messagesRef.current
      .filter((m) => m.kind === 'text' && !m.failed)
      .slice(-HISTORY_SENT)
      .map((m) => ({ role: m.role, content: m.text }));

    append(userMessage(shown));
    setPending(true);
    try {
      const result = await askMatcher(query, history);
      append({
        id: newId(), role: 'assistant', kind: 'text',
        text: result.answer, steps: result.steps, candidates: result.candidates,
      });
      return result;
    } catch (err) {
      append({
        id: newId(), role: 'assistant', kind: 'text', failed: true,
        text: err.status === 429 ? 'The AI service is busy right now.' : 'Something went wrong on my side.',
      });
      return null;
    } finally {
      setPending(false);
    }
  }, [append]);

  // Moves to the next open seat, or to the final card when the team is complete.
  const advance = useCallback((next) => {
    if (isFull(next)) {
      setBuilder({ ...next, stage: 'ready' });
      append(botMessage('Your team is complete. Name it, then send the invitations.', { ready: true }));
      return;
    }
    setBuilder({ ...next, stage: 'need' });
    append(botMessage(seatPrompt(next), { seats: seatsOf(next, myName) }));
  }, [append, setBuilder, myName]);

  const startBuilder = useCallback(() => {
    if (builderRef.current) return;
    setBuilder(emptyBuilder());
    append(botMessage('How many people should the team have, counting you?', { sizeAsk: true }));
  }, [append, setBuilder]);

  const applySize = useCallback((n) => {
    const b = builderRef.current;
    if (!b || b.stage !== 'size') return;
    advance({ ...b, size: Math.max(n, filledCount(b)) });
  }, [advance]);

  const chooseSize = useCallback((n) => {
    if (builderRef.current?.stage !== 'size') return;
    append(userMessage(`${n} people`));
    applySize(n);
  }, [append, applySize]);

  const pick = useCallback((candidate) => {
    const b = builderRef.current;
    if (!b) {
      setBuilder(emptyBuilder({ picked: [candidate] }));
      append(botMessage(
        `${candidate.name} takes a seat. How many people should the team have, counting you?`,
        { sizeAsk: true },
      ));
      return;
    }
    const taken = [...b.fixed, ...b.picked].some((p) => p.githubLogin === candidate.githubLogin);
    if (taken || b.stage === 'ready' || isFull(b)) return;

    const next = { ...b, picked: [...b.picked, candidate] };
    if (b.stage === 'size') {
      setBuilder(next);
      return;
    }
    append(botMessage(`${candidate.name} takes seat ${filledCount(next)}.`));
    advance(next);
  }, [append, advance, setBuilder]);

  const removePick = useCallback((login) => {
    const b = builderRef.current;
    const removed = b?.picked.find((p) => p.githubLogin === login);
    if (!removed) return;
    const next = { ...b, picked: b.picked.filter((p) => p.githubLogin !== login), stage: 'need' };
    setBuilder(next);
    append(botMessage(`${removed.name} is off the team. ${seatPrompt(next)}`, { seats: seatsOf(next, myName) }));
  }, [append, setBuilder, myName]);

  const cancel = useCallback(() => {
    if (!builderRef.current) return;
    setBuilder(null);
    append(botMessage('Team building cancelled. Ask me anything.'));
  }, [append, setBuilder]);

  // Continue filling an existing team that still has open seats.
  const startFill = useCallback((team, me) => {
    if (builderRef.current?.teamId === team.id) return;
    const holders = [
      ...team.members.filter((m) => m.githubLogin !== me),
      ...team.invites.filter((i) => i.status === 'pending').map((i) => ({ githubLogin: i.login, name: i.name })),
    ].map(({ githubLogin, name }) => ({ githubLogin, name }));

    const b = emptyBuilder({
      stage: 'need', size: team.size, fixed: holders, teamId: team.id, teamName: team.name,
    });
    if (isFull(b)) {
      append(botMessage(`${team.name} has no open seats.`));
      return;
    }
    setBuilder(b);
    append(botMessage(
      `${team.name} has ${team.size - filledCount(b)} open seat(s). ${seatPrompt(b)}`,
      { seats: seatsOf(b, myName) },
    ));
  }, [append, setBuilder, myName]);

  const submitTeam = useCallback(async (teamName) => {
    const b = builderRef.current;
    if (!b || b.stage !== 'ready') return;
    const logins = b.picked.map((p) => p.githubLogin);
    const picks = b.picked.map((p) => ({ login: p.githubLogin, skills: p.fills.map((f) => f.name) }));
    try {
      if (b.teamId) await inviteMore(b.teamId, logins, picks);
      else await createTeam({ name: teamName, members: logins, size: b.size, picks });
      setBuilder(null);
      append(botMessage(
        `Invitations sent to ${b.picked.map((p) => p.name).join(', ')}. Replies and the team status appear under Teams.`,
        { sent: true },
      ));
      onTeamChanged?.();
    } catch {
      append(botMessage('I could not send the invitations. Please try again.', { failed: true }));
    }
  }, [append, setBuilder, onTeamChanged]);

  const send = useCallback(async (text) => {
    const b = builderRef.current;

    if (b?.stage === 'size') {
      append(userMessage(text));
      const n = Number(text.match(/[2-4]/)?.[0]);
      if (n) applySize(n);
      else append(botMessage('Pick a team size of 2, 3 or 4 people, counting yourself.', { sizeAsk: true }));
      return;
    }

    if (b && b.stage !== 'ready') {
      const team = [...b.fixed, ...b.picked].map((p) => p.githubLogin);
      const query = `Seat ${filledCount(b) + 1} of ${b.size}: ${text}. My team so far: ${team.length ? team.join(', ') : 'just me'}.`;
      const result = await askAgent(text, query);
      if (result?.candidates?.length && builderRef.current) {
        setBuilder({ ...builderRef.current, stage: 'pick' });
      }
      return;
    }

    const wanted = !b && text.match(SIZE_INTENT);
    if (wanted) {
      const size = Number(wanted[1] ?? wanted[2]);
      const next = emptyBuilder({ stage: 'need', size });
      append(userMessage(text));
      setBuilder(next);
      append(botMessage(
        `A team of ${size} means ${size - 1} seats besides yours. ${seatPrompt(next)}`,
        { seats: seatsOf(next, myName) },
      ));
      return;
    }

    await askAgent(text, text);
  }, [append, applySize, askAgent, setBuilder, myName]);

  const retry = useCallback(() => {
    const list = messagesRef.current;
    if (!list[list.length - 1]?.failed) return;
    const lastUser = [...list].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    messagesRef.current = list.slice(0, list.lastIndexOf(lastUser));
    setMessagesState(messagesRef.current);
    send(lastUser.text);
  }, [send]);

  const reset = useCallback(() => {
    messagesRef.current = [];
    setMessagesState([]);
    setBuilder(null);
  }, [setBuilder]);

  const seats = builder ? seatsOf(builder, myName) : [];

  return {
    messages, pending, builder, seats,
    send, retry, reset, startBuilder, startFill, pick, chooseSize, removePick, cancel, submitTeam,
  };
}