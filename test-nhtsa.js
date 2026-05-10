async function testNhtsa() {
  console.time('fetch');
  const make = 'volkswagen';
  const model = 'golf';
  
  // Validate model
  const valRes = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${make}?format=json`);
  const valData = await valRes.json();
  const models = valData.Results.map(r => r.Model_Name.toUpperCase());
  console.log('Is valid:', models.includes(model.toUpperCase()));
  
  // Fetch 5 years
  const years = [2018, 2019, 2020, 2021, 2022];
  const promises = years.map(y => 
    fetch(`https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${model}&modelYear=${y}`).then(r => r.json())
  );
  
  const results = await Promise.all(promises);
  let total = 0;
  results.forEach(r => {
    if (r.results) total += r.results.length;
  });
  console.log('Total recalls:', total);
  console.timeEnd('fetch');
}
testNhtsa();
