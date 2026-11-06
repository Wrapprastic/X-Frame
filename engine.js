// X Frame progression engine. Pure functions only: no DOM, no storage, no
// clock. Rules come from the design doc's Progression engine and Weekly effort
// sections; tests.html checks them.

const Engine = (() => {
  // Weights are kept to 0.01 kg so 2.5 kg steps never drift in floating point.
  const tidy = (kg) => Math.round(kg * 100) / 100;

  const roundUpToIncrement = (kg, inc) => tidy(Math.ceil(tidy(kg / inc) - 1e-9) * inc);
  const roundDownToIncrement = (kg, inc) => tidy(Math.floor(tidy(kg / inc) + 1e-9) * inc);

  // Next target from a baseline {weight, reps}. With no baseline yet the weight
  // is blank and the rep target is the bottom of the range. Above the top of
  // the range, the weight rises 5% (at least one increment) and reps reset.
  function nextTarget(baseline, repLow, repHigh, incrementKg) {
    if (!baseline) return { weight: null, reps: repLow };
    const { weight, reps } = baseline;
    if (reps > repHigh) {
      let next = roundUpToIncrement(weight * 1.05, incrementKg);
      if (next <= weight) next = tidy(weight + incrementKg);
      return { weight: next, reps: repLow };
    }
    return { weight, reps: reps + 1 };
  }

  // Target at the start of a new phase: the baseline weight at the bottom of
  // the range, so the new RIR targets are met at the same loads.
  function phaseStartTarget(baseline, repLow) {
    if (!baseline) return { weight: null, reps: repLow };
    return { weight: baseline.weight, reps: repLow };
  }

  // 'first' when there was no target weight yet, else 'hit' or 'miss'.
  // A hit is at or above target on both, or a heavier weight with reps still
  // inside the range. A lighter weight with more reps is a miss.
  function judgeSet(target, logged, repLow) {
    if (target.weight == null) return 'first';
    const w = tidy(logged.weight);
    if (w >= target.weight && logged.reps >= target.reps) return 'hit';
    if (w > target.weight && logged.reps >= repLow) return 'hit';
    return 'miss';
  }

  // True when a set that hit was easier than planned: RIR two or more above
  // the top of the target. It only shows a note; it never changes a target.
  function easierThanPlanned(result, loggedRir, targetRir) {
    return result === 'hit' && loggedRir >= targetRir[1] + 2;
  }

  // Replays the first-work-set history of one slot and exercise, oldest first,
  // and returns the baseline plus each entry's target and result. Each entry is
  // {weight, reps, phaseStart?, makeBaseline?}: phaseStart marks Phase 2 week 1,
  // makeBaseline marks a set the user chose as the baseline.
  function replayBaseline(entries, repLow, repHigh, incrementKg) {
    let baseline = null;
    const results = [];
    for (const e of entries) {
      const target = e.phaseStart
        ? phaseStartTarget(baseline, repLow)
        : nextTarget(baseline, repLow, repHigh, incrementKg);
      const result = judgeSet(target, e, repLow);
      if (result !== 'miss' || e.makeBaseline) baseline = { weight: tidy(e.weight), reps: e.reps };
      results.push({ target, result });
    }
    return { baseline, results };
  }

  // Block types: 'phase1', 'phase2', 'maintenance', 'phase1-no-intensifiers'.
  const usesPhase2 = (blockType) => blockType === 'phase2' || blockType === 'maintenance';

  const isDeloadWeek = (week) => week === 8;

  // Work sets for a slot in a given block and week. Maintenance runs Phase 2
  // with 20% fewer sets (rounded, minimum 1). A deload halves, rounding up.
  function setsFor(slot, blockType, week) {
    let n = usesPhase2(blockType) ? slot.sets.phase2 : slot.sets.phase1;
    if (n === 0) return 0;
    if (blockType === 'maintenance') n = Math.max(1, Math.round(n * 0.8));
    if (isDeloadWeek(week)) n = Math.ceil(n / 2);
    return n;
  }

  // Target RIR as [low, high] for an exercise type ('C' or 'I').
  function targetRir(rirTable, blockType, week, type) {
    const table = usesPhase2(blockType) ? rirTable.phase2 : rirTable.phase1;
    return table[week - 1][type];
  }

  // The RIR pre-filled on a set: the top of the target.
  const prefillRir = (target) => target[1];

  const dropSetsOn = (blockType, week) =>
    blockType !== 'phase1-no-intensifiers' && (week === 6 || week === 7);

  // A drop set is 50% of the last work set's actual weight, rounded down.
  const dropSetWeight = (lastWeight, incrementKg) => roundDownToIncrement(lastWeight * 0.5, incrementKg);

  // Deload sets use the baseline weight at the bottom of the range.
  const deloadTarget = (baseline, repLow) => phaseStartTarget(baseline, repLow);

  // A stall is three misses in a row, counting only sessions where the slot ran
  // (deloads and skipped sessions are left out before calling this).
  function isStalled(recentResults) {
    let misses = 0;
    for (let i = recentResults.length - 1; i >= 0; i--) {
      if (recentResults[i] !== 'miss') break;
      misses++;
    }
    return misses >= 3;
  }

  // Estimated one-rep max (Epley), for spotting trends only.
  const epley = (weight, reps) => tidy(weight * (1 + reps / 30));

  // Planned hard sets per muscle for one week of a block's templates.
  function weeklyVolume(sessions, blockType, week) {
    const totals = {};
    for (const s of sessions) {
      for (const slot of s.slots) {
        const n = setsFor(slot, blockType, week);
        totals[slot.primaryMuscle] = (totals[slot.primaryMuscle] || 0) + n;
      }
    }
    return totals;
  }

  return {
    roundUpToIncrement,
    roundDownToIncrement,
    nextTarget,
    phaseStartTarget,
    judgeSet,
    easierThanPlanned,
    replayBaseline,
    setsFor,
    isDeloadWeek,
    targetRir,
    prefillRir,
    dropSetsOn,
    dropSetWeight,
    deloadTarget,
    isStalled,
    epley,
    weeklyVolume,
  };
})();
