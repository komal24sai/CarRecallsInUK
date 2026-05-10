/**
 * MOCK GENERATOR
 * Creates realistic, deterministic vehicle and MOT data for any registration.
 * This ensures the SaaS demo works for any plate even if DVSA API is unavailable.
 */

const MAKES = [
  { name: 'FORD', models: ['FIESTA', 'FOCUS', 'PUMA', 'KUGA'] },
  { name: 'VOLKSWAGEN', models: ['GOLF', 'POLO', 'TIGUAN', 'PASSAT'] },
  { name: 'BMW', models: ['3 SERIES', '1 SERIES', 'X5', '5 SERIES'] },
  { name: 'MERCEDES-BENZ', models: ['A CLASS', 'C CLASS', 'E CLASS', 'GLC'] },
  { name: 'AUDI', models: ['A3', 'A1', 'Q3', 'A4'] },
  { name: 'TOYOTA', models: ['YARIS', 'COROLLA', 'RAV4', 'AYGO'] },
  { name: 'NISSAN', models: ['QASHQAI', 'JUKE', 'MICRA', 'LEAF'] },
  { name: 'VAUXHALL', models: ['CORSA', 'ASTRA', 'MOKKA', 'INSIGNIA'] },
];

const COLOURS = ['SILVER', 'BLACK', 'WHITE', 'BLUE', 'GREY', 'RED', 'GREEN'];
const FUELS = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];

const COMMON_DEFECTS = [
  { text: 'Nearside Front Tyre worn close to legal limit', type: 'MINOR' },
  { text: 'Offside Rear Brake pad(s) wearing thin', type: 'ADVISORY' },
  { text: 'Exhaust has a minor leak of exhaust gases', type: 'MAJOR' },
  { text: 'Windscreen has a central chip', type: 'ADVISORY' },
  { text: 'Offside Front Headlamp not working', type: 'MAJOR' },
  { text: 'Rear Brake disc worn, pitted or scored', type: 'ADVISORY' },
  { text: 'Nearside Front Suspension arm pin or bush worn but not resulting in excessive movement', type: 'ADVISORY' },
  { text: 'Oil leak, but not excessive', type: 'ADVISORY' },
];

/**
 * Deterministically hash a string to a number
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a realistic vehicle object
 */
export function generateMockVehicle(registration) {
  const seed = hashString(registration);
  const makeObj = MAKES[seed % MAKES.length];
  const model = makeObj.models[seed % makeObj.models.length];
  const colour = COLOURS[seed % COLOURS.length];
  const fuel = FUELS[seed % FUELS.length];
  
  // Year between 2005 and 2022
  const year = 2005 + (seed % 18);
  const month = (seed % 12) + 1;
  const day = (seed % 28) + 1;
  const firstUsedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  const engineSize = (1000 + (seed % 2000)).toString();
  
  // Generate MOT history (one per year since year + 3)
  const currentYear = new Date().getFullYear();
  const motTests = [];
  let currentMileage = (seed % 20000) + 5000;
  
  for (let y = year + 3; y <= currentYear; y++) {
    const testDate = `${y}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const passed = (seed + y) % 10 > 2; // 70% pass rate
    
    const test = {
      testNumber: `mock_${registration}_${y}`,
      completedDate: testDate,
      testResult: passed ? 'PASSED' : 'FAILED',
      expiryDate: passed ? `${y + 1}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}` : null,
      odometerValue: currentMileage.toString(),
      odometerUnit: 'mi',
      odometerResultType: 'READ',
      rfrAndComments: []
    };

    if (!passed || (seed + y) % 5 === 0) {
      const numDefects = ((seed + y) % 3) + 1;
      for (let i = 0; i < numDefects; i++) {
        const defect = COMMON_DEFECTS[(seed + y + i) % COMMON_DEFECTS.length];
        test.rfrAndComments.push({
          text: defect.text,
          type: passed ? 'ADVISORY' : (i === 0 ? 'MAJOR' : 'ADVISORY'),
          dangerous: false
        });
      }
    }
    
    motTests.push(test);
    currentMileage += (seed % 5000) + 4000; // Annual mileage
  }

  return {
    registration,
    make: makeObj.name,
    model,
    firstUsedDate,
    fuelType: fuel,
    primaryColour: colour,
    engineSize,
    motTests: motTests.reverse() // Latest first
  };
}
