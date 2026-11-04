// Headless check: play the solver's hint to the end on every level and assert 3 stars; print par metrics.
import { LEVELS } from './levels.js';
import { initPond, feed, isWin, solveFrom, stars } from './logic.js';

let fail = 0;
for (const L of LEVELS) {
  let pond = initPond(L), turns = 0, food = 0;
  const sol = solveFrom(L, pond, L.turnLimit);
  while (!isWin(pond) && turns < L.turnLimit) {
    const s = solveFrom(L, pond, L.turnLimit - turns);
    if (!s) break;
    pond = feed(L, pond, s.first).pond; turns++; food += s.first.length;
  }
  const st = stars(L, turns, food, isWin(pond));
  const ok = st === 3 && sol.turns === L.parTurns && sol.food === L.parFood;
  if (!ok) fail++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} L${L.id} ${L.title}: solver par ${sol.turns}t/${sol.food}f (level ${L.parTurns}t/${L.parFood}f), hint play ${turns}t/${food}f -> ${st} stars`);
}
process.exit(fail ? 1 : 0);
