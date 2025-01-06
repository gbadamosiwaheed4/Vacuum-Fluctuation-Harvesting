import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let experimentCount = 0;
const particleExperiments = new Map();

// Simulated contract functions
function startExperiment(experimentType: string, parameters: Array<{name: string, value: number}>, researcher: string) {
  const experimentId = ++experimentCount;
  particleExperiments.set(experimentId, {
    researcher,
    experimentType,
    parameters,
    results: null,
    energyConsumed: 0,
    startTime: Date.now(),
    endTime: null
  });
  return experimentId;
}

function endExperiment(experimentId: number, results: string, energyConsumed: number, researcher: string) {
  const experiment = particleExperiments.get(experimentId);
  if (!experiment) throw new Error('Invalid experiment');
  if (experiment.researcher !== researcher) throw new Error('Not authorized');
  experiment.results = results;
  experiment.energyConsumed = energyConsumed;
  experiment.endTime = Date.now();
  particleExperiments.set(experimentId, experiment);
  return true;
}

describe('Particle Physics Integration Contract', () => {
  beforeEach(() => {
    experimentCount = 0;
    particleExperiments.clear();
  });
  
  it('should start a new particle physics experiment', () => {
    const parameters = [
      { name: 'energy', value: 13000 },
      { name: 'particles', value: 100000 }
    ];
    const id = startExperiment('Higgs Boson Search', parameters, 'researcher1');
    expect(id).toBe(1);
    const experiment = particleExperiments.get(id);
    expect(experiment.experimentType).toBe('Higgs Boson Search');
    expect(experiment.parameters.length).toBe(2);
  });
  
  it('should end an experiment and record results', () => {
    const parameters = [
      { name: 'temperature', value: 5 },
      { name: 'pressure', value: 1000000 }
    ];
    const id = startExperiment('Quark-Gluon Plasma', parameters, 'researcher2');
    const results = 'Observed quark-gluon plasma state for 10^-23 seconds';
    expect(endExperiment(id, results, 5000000, 'researcher2')).toBe(true);
    const experiment = particleExperiments.get(id);
    expect(experiment.results).toBe(results);
    expect(experiment.energyConsumed).toBe(5000000);
    expect(experiment.endTime).toBeTruthy();
  });
  
  it('should not allow unauthorized experiment termination', () => {
    const parameters = [
      { name: 'magnetic_field', value: 10 }
    ];
    const id = startExperiment('Muon g-2', parameters, 'researcher3');
    expect(() => endExperiment(id, 'Unauthorized results', 1000000, 'unauthorized_user')).toThrow('Not authorized');
  });
  
  it('should handle multiple experiments', () => {
    const params1 = [{ name: 'energy', value: 14000 }];
    const params2 = [{ name: 'duration', value: 3600 }];
    const id1 = startExperiment('Dark Matter Detection', params1, 'researcher4');
    const id2 = startExperiment('Neutrino Oscillation', params2, 'researcher5');
    expect(id1).toBe(1);
    expect(id2).toBe(2);
    const exp1 = particleExperiments.get(id1);
    const exp2 = particleExperiments.get(id2);
    expect(exp1.experimentType).toBe('Dark Matter Detection');
    expect(exp2.experimentType).toBe('Neutrino Oscillation');
  });
});

