// X Frame seed data: session templates, the RIR table and the exercise library.
// Transcribed from the design doc (Session templates, Weekly effort, Exercise
// library). A program change belongs here, not in engine.js or the app.

const SEED = (() => {
  // Default weight step in kg for each kind of equipment (doc: Progression engine).
  // Bodyweight lifts are loaded with plates or a dumbbell, so they step by 2.5 kg.
  const INCREMENT_KG = {
    barbell: 2.5,
    smith: 2.5,
    plate: 2.5,
    dumbbell: 2.5,
    cable: 2.5,
    machine: 5,
    bodyweight: 2.5,
  };

  // Rest after a set, in seconds, by exercise type.
  const REST_SECONDS = { C: 150, I: 90 };

  // Each role lists its exercises as [name, equipment]. Type is C (compound) or
  // I (isolation) and applies to every exercise in the role. Equipment is not
  // in the source; it is our best reading of each name and only sets the
  // default increment, which the user can edit.
  const ROLES = [
    { name: 'Lateral raise', type: 'I', exercises: [
      ['Machine lateral raise', 'machine'],
      ['Cable lateral raise', 'cable'],
      ['DB lateral raise', 'dumbbell'],
      ['Single-arm cable lateral raise', 'cable'],
      ['Lean-away DB lateral raise', 'dumbbell'],
      ['Cable Y-raise', 'cable'],
    ] },
    { name: 'Flat press', type: 'C', exercises: [
      ['Flat DB press', 'dumbbell'],
      ['Smith flat press', 'smith'],
      ['Machine chest press', 'machine'],
      ['Barbell bench press', 'barbell'],
    ] },
    { name: 'Incline press', type: 'C', exercises: [
      ['Incline Hammer Strength chest press', 'plate'],
      ['Incline DB press', 'dumbbell'],
      ['Incline Smith press', 'smith'],
      ['Incline machine press', 'machine'],
    ] },
    { name: 'Chest fly', type: 'I', exercises: [
      ['Pec deck fly', 'machine'],
      ['Chest cable fly', 'cable'],
      ['Low-to-high cable fly', 'cable'],
      ['Flat DB fly', 'dumbbell'],
    ] },
    { name: 'Rear delt fly', type: 'I', exercises: [
      ['Reverse pec deck fly', 'machine'],
      ['Reverse cable fly', 'cable'],
      ['Chest-supported DB rear delt raise', 'dumbbell'],
    ] },
    { name: 'Triceps pushdown', type: 'I', exercises: [
      ['Shoulder-width overhand pushdown', 'cable'],
      ['Rope pushdown', 'cable'],
      ['Single-arm cable pushdown', 'cable'],
      ['Dip machine', 'machine'],
    ] },
    { name: 'Overhead triceps', type: 'I', exercises: [
      ['Overhead triceps extension', 'cable'],
      ['Rope overhead cable extension', 'cable'],
      ['Single-arm cable overhead extension', 'cable'],
      ['DB overhead extension', 'dumbbell'],
    ] },
    { name: 'Ab crunch', type: 'I', exercises: [
      ['Machine crunch', 'machine'],
      ['Cable rope crunch', 'cable'],
      ['Hip raise', 'bodyweight'],
      ['GHR crunch', 'bodyweight'],
      ['Decline crunch', 'bodyweight'],
    ] },
    { name: 'Shoulder press', type: 'C', exercises: [
      ['Shoulder press machine', 'machine'],
      ['Seated DB press', 'dumbbell'],
      ['Smith seated press', 'smith'],
      ['Barbell military press', 'barbell'],
    ] },
    { name: 'Close-grip press', type: 'C', exercises: [
      ['Close-grip press', 'barbell'],
      ['Smith close-grip press', 'smith'],
      ['Narrow-grip machine press', 'machine'],
      ['Close-grip bench press', 'barbell'],
    ] },
    { name: 'Lat vertical pull', type: 'C', exercises: [
      ['Lat-bias pulldown', 'cable'],
      ['Single-arm cable pulldown', 'cable'],
      ['Nautilus or Hammer Strength high row', 'plate'],
      ['Close neutral-grip pulldown', 'cable'],
      ['Machine pulldown', 'machine'],
    ] },
    { name: 'Upper-back vertical pull', type: 'C', exercises: [
      ['Wide-grip pulldown', 'cable'],
      ['Wide-grip machine pulldown', 'machine'],
    ] },
    { name: 'Upper-back row', type: 'C', exercises: [
      ['Chest-supported row', 'plate'],
      ['Chest-supported T-bar row', 'plate'],
      ['Incline DB row', 'dumbbell'],
      ['Hammer Strength iso row', 'plate'],
      ['Wide-grip seated cable row', 'cable'],
      ['Seal row', 'barbell'],
    ] },
    { name: 'Lat row', type: 'C', exercises: [
      ['Single-arm cable row', 'cable'],
      ['Kneeling single-arm cable row', 'cable'],
      ['Prime or Hammer Strength row', 'plate'],
      ['Single-arm landmine row', 'barbell'],
      ['Close-grip seated cable row', 'cable'],
      ['Machine row', 'machine'],
    ] },
    { name: 'Biceps curl', type: 'I', exercises: [
      ['DB preacher curl', 'dumbbell'],
      ['Incline cable curl', 'cable'],
      ['Machine preacher curl', 'machine'],
      ['EZ-bar preacher curl', 'barbell'],
      ['Incline bench DB curl', 'dumbbell'],
      ['Bayesian cable curl', 'cable'],
      ['Machine curl', 'machine'],
    ] },
    { name: 'Hammer curl', type: 'I', exercises: [
      ['Rope hammer curl', 'cable'],
      ['Preacher DB hammer curl', 'dumbbell'],
      ['DB hammer curl', 'dumbbell'],
      ['Cross-body hammer curl', 'dumbbell'],
      ['Cable hammer curl', 'cable'],
    ] },
    { name: 'Wrist extension', type: 'I', exercises: [
      ['DB wrist extension', 'dumbbell'],
      ['Cable wrist extension', 'cable'],
      ['Barbell wrist extension', 'barbell'],
    ] },
    { name: 'Hamstring curl', type: 'I', exercises: [
      ['Seated hamstring curl', 'machine'],
      ['Lying hamstring curl', 'machine'],
      ['Single-leg seated curl', 'machine'],
      ['Prone DB curl', 'dumbbell'],
    ] },
    { name: 'Squat', type: 'C', exercises: [
      ['Squat of choice', 'plate'],
      ['Safety-bar squat', 'barbell'],
      ['Hack squat', 'plate'],
      ['Pendulum squat', 'plate'],
      ['Smith squat', 'smith'],
      ['Belt squat', 'plate'],
    ] },
    { name: 'Leg press', type: 'C', exercises: [
      ['Leg press of choice', 'plate'],
      ['45-degree leg press', 'plate'],
      ['Horizontal (Cybex) leg press', 'machine'],
    ] },
    { name: 'Hip hinge', type: 'C', exercises: [
      ['Romanian deadlift', 'barbell'],
      ['DB RDL', 'dumbbell'],
      ['Smith RDL', 'smith'],
      ['Pit Shark RDL', 'plate'],
    ] },
    { name: 'Single-leg quad', type: 'C', exercises: [
      ['Front-foot-elevated split squat', 'dumbbell'],
      ['Smith split squat', 'smith'],
      ['DB split squat', 'dumbbell'],
      ['Single-leg leg press', 'plate'],
      ['Single-leg hip press', 'plate'],
    ] },
    { name: 'Adductor', type: 'I', exercises: [
      ['Adductor machine', 'machine'],
      ['Cable adduction', 'cable'],
    ] },
    { name: 'Leg extension', type: 'I', exercises: [
      ['Leg extension', 'machine'],
      ['Single-leg extension', 'machine'],
    ] },
    { name: 'Calf raise', type: 'I', exercises: [
      ['Straight-leg calf raise', 'machine'],
      ['Standing calf machine', 'machine'],
      ['Donkey calf raise', 'plate'],
      ['Leg press calf raise', 'plate'],
      ['Smith calf raise', 'smith'],
    ] },
  ];

  // The six sessions in weekly order. Each slot is
  // [label, label in Phase 2, role, default exercise, muscle, P1 sets, P2 sets, rep low, rep high, drop-set eligible].
  // Slots sharing a letter (D1, D2) alternate set by set. A null label means the
  // slot is not run in that phase. Default exercises follow the library's
  // Default column, which names a concrete lift where the template is generic.
  const SESSIONS = [
    { name: 'Chest Focused Push', slots: [
      ['A1', 'A1', 'Lateral raise', 'Machine lateral raise', 'Side delts', 4, 4, 10, 15, true],
      ['B1', 'B1', 'Flat press', 'Flat DB press', 'Chest', 3, 3, 8, 12, false],
      ['C1', 'C1', 'Incline press', 'Incline Hammer Strength chest press', 'Chest', 3, 3, 8, 12, false],
      ['D1', 'D1', 'Chest fly', 'Pec deck fly', 'Chest', 2, 2, 10, 15, false],
      ['D2', 'D2', 'Rear delt fly', 'Reverse pec deck fly', 'Rear delts', 3, 3, 12, 20, false],
      ['E1', 'E1', 'Triceps pushdown', 'Shoulder-width overhand pushdown', 'Triceps', 4, 4, 12, 20, false],
      ['E2', 'E2', 'Ab crunch', 'Machine crunch', 'Abs', 4, 4, 10, 15, false],
    ] },
    { name: 'Pull A', slots: [
      ['A1', 'A1', 'Lat vertical pull', 'Lat-bias pulldown', 'Lats', 3, 4, 8, 12, false],
      ['B1', 'B1', 'Upper-back row', 'Chest-supported row', 'Upper back', 2, 2, 8, 12, false],
      ['C1', 'C1', 'Lat row', 'Single-arm cable row', 'Lats', 3, 3, 10, 15, true],
      ['D1', 'D1', 'Upper-back row', 'Chest-supported row', 'Upper back', 2, 2, 12, 20, false],
      ['E1', 'E1', 'Biceps curl', 'DB preacher curl', 'Biceps', 3, 3, 10, 15, false],
      ['F1', 'F1', 'Hammer curl', 'Rope hammer curl', 'Biceps', 3, 3, 10, 15, false],
      ['G1', 'G1', 'Wrist extension', 'DB wrist extension', 'Forearms', 2, 2, 12, 15, false],
    ] },
    { name: 'Legs', slots: [
      ['A1', 'A1', 'Hamstring curl', 'Seated hamstring curl', 'Hamstrings', 4, 4, 8, 12, false],
      ['B1', 'B1', 'Squat', 'Squat of choice', 'Quads', 2, 2, 8, 12, false],
      ['C1', 'C1', 'Leg press', 'Leg press of choice', 'Quads', 3, 3, 12, 20, false],
      ['D1', 'D1', 'Adductor', 'Adductor machine', 'Adductors', 2, 2, 10, 15, false],
      ['E1', 'E1', 'Leg extension', 'Leg extension', 'Quads', 3, 4, 10, 15, true],
      ['F1', 'F1', 'Calf raise', 'Straight-leg calf raise', 'Calves', 4, 4, 12, 16, false],
    ] },
    { name: 'Shoulder Focused Push', slots: [
      ['A1', 'A1', 'Lateral raise', 'Machine lateral raise', 'Side delts', 4, 4, 10, 15, true],
      ['B1', 'B1', 'Shoulder press', 'Shoulder press machine', 'Front delts', 3, 3, 8, 12, false],
      ['C1', 'C1', 'Close-grip press', 'Close-grip press', 'Chest', 3, 3, 8, 12, false],
      ['D1', 'D1', 'Rear delt fly', 'Reverse cable fly', 'Rear delts', 3, 3, 10, 15, false],
      ['D2', 'D2', 'Chest fly', 'Chest cable fly', 'Chest', 3, 3, 10, 15, false],
      ['E1', 'E1', 'Overhead triceps', 'Overhead triceps extension', 'Triceps', 4, 4, 10, 15, false],
      ['E2', 'E2', 'Ab crunch', 'Machine crunch', 'Abs', 4, 4, 10, 15, false],
    ] },
    { name: 'Pull B', slots: [
      ['A1', 'A1', 'Upper-back vertical pull', 'Wide-grip pulldown', 'Upper back', 3, 3, 10, 15, false],
      ['B1', 'B1', 'Upper-back row', 'Chest-supported row', 'Upper back', 3, 3, 8, 12, false],
      ['C1', 'C1', 'Lat row', 'Single-arm cable row', 'Lats', 2, 3, 8, 12, true],
      ['D1', 'D1', 'Lat vertical pull', 'Lat-bias pulldown', 'Lats', 2, 2, 12, 20, false],
      ['E1', 'E1', 'Biceps curl', 'Incline cable curl', 'Biceps', 3, 3, 10, 15, false],
      ['F1', 'F1', 'Hammer curl', 'Preacher DB hammer curl', 'Biceps', 3, 3, 10, 15, false],
      ['G1', 'G1', 'Wrist extension', 'DB wrist extension', 'Forearms', 2, 2, 12, 15, false],
    ] },
    { name: 'Hamstring Focused Legs', slots: [
      [null, 'A1', 'Lateral raise', 'Cable lateral raise', 'Side delts', 0, 4, 12, 15, true],
      ['A1', 'B1', 'Hamstring curl', 'Lying hamstring curl', 'Hamstrings', 4, 4, 8, 12, false],
      ['B1', 'C1', 'Hip hinge', 'Romanian deadlift', 'Hamstrings', 2, 2, 8, 12, false],
      ['C1', 'D1', 'Single-leg quad', 'Front-foot-elevated split squat', 'Quads', 3, 4, 10, 15, false],
      ['D1', 'E1', 'Adductor', 'Adductor machine', 'Adductors', 3, 3, 10, 15, false],
      ['E1', 'F1', 'Calf raise', 'Straight-leg calf raise', 'Calves', 4, 4, 6, 10, false],
    ] },
  ];

  // Target RIR as [low, high] by week (1-8) and exercise type. Phase 2 reaches
  // full effort one week sooner. Week 8 is the deload.
  const RIR = {
    phase1: [
      { C: [2, 2], I: [2, 2] },
      { C: [2, 2], I: [1, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [3, 4], I: [3, 4] },
    ],
    phase2: [
      { C: [2, 2], I: [1, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [1, 1], I: [0, 1] },
      { C: [3, 4], I: [3, 4] },
    ],
  };

  // Planned hard sets per muscle per week, from the doc's Weekly volume table.
  // tests.html checks the templates add up to these.
  const PLANNED_VOLUME = {
    'Side delts': [8, 12],
    'Quads': [11, 13],
    'Lats': [10, 12],
    'Rear delts': [6, 6],
    'Upper back': [10, 10],
    'Chest': [14, 14],
    'Hamstrings': [10, 10],
    'Biceps': [12, 12],
    'Triceps': [8, 8],
    'Calves': [8, 8],
    'Abs': [8, 8],
    'Adductors': [5, 5],
    'Front delts': [3, 3],
    'Forearms': [4, 4],
  };

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const roles = ROLES.map((r) => ({
    id: slug(r.name),
    name: r.name,
    type: r.type,
    exerciseIds: r.exercises.map(([name]) => slug(name)),
  }));

  const exercises = [];
  for (const r of ROLES) {
    for (const [name, equipment] of r.exercises) {
      exercises.push({
        id: slug(name),
        name,
        role: slug(r.name),
        type: r.type,
        equipment,
        incrementKg: INCREMENT_KG[equipment],
        restSeconds: REST_SECONDS[r.type],
        isCustom: false,
      });
    }
  }

  const sessions = SESSIONS.map((s, i) => ({
    id: slug(s.name),
    name: s.name,
    position: i + 1,
    slots: s.slots.map(([label, labelP2, role, exercise, muscle, p1, p2, repLow, repHigh, drop]) => ({
      id: `${slug(s.name)}-${slug(role)}-${labelP2.toLowerCase()}`,
      label,
      labelP2,
      pairGroup: labelP2[0],
      role: slug(role),
      defaultExercise: slug(exercise),
      primaryMuscle: muscle,
      sets: { phase1: p1, phase2: p2 },
      repLow,
      repHigh,
      dropSetEligible: drop,
      userAdded: false,
    })),
  }));

  return { roles, exercises, sessions, rir: RIR, plannedVolume: PLANNED_VOLUME, slug };
})();
