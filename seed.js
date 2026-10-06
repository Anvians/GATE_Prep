require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('./models/Topic');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gate-tracker';

// Built from the IIT Madras GATE 2027 ME syllabus
const seedTopics = [
  // Engineering Mathematics
  { section: 'MATH', name: 'Linear algebra (matrices, systems, eigenvalues)', order: 1 },
  { section: 'MATH', name: 'Calculus (limits, Taylor series, maxima/minima, integrals)', order: 2 },
  { section: 'MATH', name: 'Vector calculus (gradient, divergence, curl, Gauss/Stokes/Green)', order: 3 },
  { section: 'MATH', name: 'Differential equations (ODEs, Laplace transforms, heat/wave/Laplace PDEs)', order: 4 },
  { section: 'MATH', name: 'Complex variables (Cauchy-Riemann, contour integrals, Laurent series)', order: 5 },
  { section: 'MATH', name: 'Probability & statistics', order: 6 },
  { section: 'MATH', name: 'Numerical methods (roots, Simpson/trapezoidal, ODE solvers)', order: 7 },
  { section: 'MATH', name: 'Timed topic-wise PYQs', order: 8 },

  // Applied Mechanics & Design
  { section: 'AMD', name: 'Engineering mechanics (FBD, friction, trusses, rigid-body dynamics)', order: 1 },
  { section: 'AMD', name: 'SOM: stress, strain & Mohr\'s circle', order: 2 },
  { section: 'AMD', name: 'SOM: SFD/BMD, bending & shear stress', order: 3 },
  { section: 'AMD', name: 'SOM: deflection, torsion & columns', order: 4 },
  { section: 'AMD', name: 'SOM: energy methods, thermal stress, pressure vessels', order: 5 },
  { section: 'AMD', name: 'TOM: mechanisms (velocity & acceleration analysis)', order: 6 },
  { section: 'AMD', name: 'TOM: cams, gears & gear trains', order: 7 },
  { section: 'AMD', name: 'TOM: flywheels, governors, balancing, gyroscope', order: 8 },
  { section: 'AMD', name: 'Vibrations (1-DOF, 2-DOF, damping, isolation, critical speed)', order: 9 },
  { section: 'AMD', name: 'Control systems, transfer function & PID', order: 10 },
  { section: 'AMD', name: 'Machine design: failure theories & fatigue (S-N)', order: 11 },
  { section: 'AMD', name: 'Machine elements (joints, shafts, springs, gears, bearings, brakes)', order: 12 },
  { section: 'AMD', name: 'Timed topic-wise PYQs', order: 13 },

  // Fluid Mechanics & Thermal Sciences
  { section: 'FTS', name: 'Fluid statics & kinematics', order: 1 },
  { section: 'FTS', name: 'Control volume analysis & Bernoulli', order: 2 },
  { section: 'FTS', name: 'Viscous flow, boundary layer & pipe flow', order: 3 },
  { section: 'FTS', name: 'Dimensional analysis', order: 4 },
  { section: 'FTS', name: 'Compressible flow & nozzles', order: 5 },
  { section: 'FTS', name: 'Heat transfer: conduction & fins', order: 6 },
  { section: 'FTS', name: 'Heat transfer: unsteady conduction & convection correlations', order: 7 },
  { section: 'FTS', name: 'Heat exchangers (LMTD, NTU) & boiling/condensation', order: 8 },
  { section: 'FTS', name: 'Radiation (view factors, networks)', order: 9 },
  { section: 'FTS', name: 'Thermodynamics: laws, properties & ideal/real gases', order: 10 },
  { section: 'FTS', name: 'Thermodynamics: entropy, availability & relations', order: 11 },
  { section: 'FTS', name: 'Power cycles (Rankine, Brayton, reheat, regeneration)', order: 12 },
  { section: 'FTS', name: 'IC engines & combustion basics', order: 13 },
  { section: 'FTS', name: 'Refrigeration, air-conditioning & psychrometrics', order: 14 },
  { section: 'FTS', name: 'Turbomachinery (turbines, pumps, compressors)', order: 15 },
  { section: 'FTS', name: 'Timed topic-wise PYQs', order: 16 },

  // Materials, Manufacturing & Industrial Engineering
  { section: 'MMI', name: 'Engineering materials, phase diagrams & heat treatment', order: 1 },
  { section: 'MMI', name: 'Casting (gating, risers, defects)', order: 2 },
  { section: 'MMI', name: 'Forming & powder metallurgy', order: 3 },
  { section: 'MMI', name: 'Welding, brazing, soldering & NDT', order: 4 },
  { section: 'MMI', name: 'Machining: mechanics, tool life & economics', order: 5 },
  { section: 'MMI', name: 'Non-traditional machining, jigs & fixtures', order: 6 },
  { section: 'MMI', name: 'Metrology: limits, fits, tolerances, CMM', order: 7 },
  { section: 'MMI', name: 'CAD/CAM, CNC programming, PLC & automation', order: 8 },
  { section: 'MMI', name: 'Additive manufacturing', order: 9 },
  { section: 'MMI', name: 'Production planning: forecasting, inventory, scheduling, MRP', order: 10 },
  { section: 'MMI', name: 'Quality, six sigma, lean & reliability', order: 11 },
  { section: 'MMI', name: 'Operations research (LP, transportation, assignment, PERT/CPM, queuing)', order: 12 },
  { section: 'MMI', name: 'Timed topic-wise PYQs', order: 13 },

  // General Aptitude
  { section: 'GA', name: 'Verbal: grammar, vocabulary, sentence completion', order: 1 },
  { section: 'GA', name: 'Reading comprehension', order: 2 },
  { section: 'GA', name: 'Quantitative aptitude (ratios, percentages, TSD, mixtures)', order: 3 },
  { section: 'GA', name: 'Logical reasoning & sequences', order: 4 },
  { section: 'GA', name: 'Data interpretation & charts', order: 5 },
  { section: 'GA', name: 'Spatial & visual reasoning', order: 6 },
  { section: 'GA', name: 'Daily timed GA set (10 questions in ~15 min)', order: 7 },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  const existingCount = await Topic.countDocuments();
  if (existingCount > 0) {
    console.log(`Topics collection already has ${existingCount} documents. Skipping seed.`);
    console.log('Delete existing topics first if you want to reseed.');
    process.exit(0);
  }

  await Topic.insertMany(seedTopics);
  console.log(`Seeded ${seedTopics.length} topics.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
