import {select} from 'd3-selection';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeSet2} from 'd3-scale-chromatic';
import {axisBottom, axisLeft} from 'd3-axis';

// Takes the original data--an array of objects where each entry is 
// an olympian-- and converts into an object where each prop is a year
// and holds an object with properties for each region and the number of medals
// that region won that year

const regions = ['Americas', 'Asia', 'Europe', 'Africa', 'Oceania'];

function processData(data) {
  const medalists = data.filter((entry) => {
    return entry['Medal'] !== 'NA';
  });
 
  const regionData = medalists.reduce((acc, entry) => {
    const year = Number(entry['Year']); 
    const region = getRegion(entry['Team']);
    // DELETE below line after getRegion fully written
    if (region === 'NA') return acc; 
    if (!acc[year]) {
      acc[year] = {total: 0};
    } 
    if (!acc[year][region]) {
      acc[year][region] = 0;	
    }
    // increment the region's medal count in current year and total yearly count
    acc[year][region]++;
    acc[year]['total']++;
    return acc;
  }, {});
  const ret = Object.keys(regionData).reduce((acc, year) => {
    acc[year] = regionData[year];
    regions.forEach((region) => {
      const numMedals = acc[year][region];
      if (acc[year][region] === 0) {
        acc[year][region] = 0;
        return;
      } 
      acc[year][region] = 100 * numMedals / acc[year]['total'];
    });
    return acc;
  }, {});
  return ret;
}

export function makeVis2(data) {

const teams = data.reduce((acc, entry) => {
  const team = entry['Team'];
  if (!acc[team] && entry['Medal'] !== 'NA'){
  acc[team] = team;
}
  return acc;
}, {});
console.log(teams);
 
  const height = 500;
  const width = 500;
  const div = select('#app').append('div')
    .attr('class', 'vis2');

  const svg = select('.vis2').append('svg')
    .attr('class', 'medalChart')
    .attr('width', width)
    .attr('height', height);

  makeSlider(data, svg);
  drawChart(data, svg);  
}

function drawChart(data, svg) {
  const width = 500;
  const height = 500;
  const margin = {top: 50, left: 80, right: 50, bottom: 150};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // medalData holds object with prop for every olympic year
  // and that prop holds an obj with medal counts for the 5 regions
  // in that year: Asia, Europe, Americas, Oceania, and Africa
  const medalData = processData(data);
  const year = 2008;//document.querySelector('.yearSlider').value;
  const regions = ['Americas', 'Asia', 'Europe', 'Africa', 'Oceania'];

  const yearlyVals = regions.reduce((acc, region) => {
    const newObj = {region, val: medalData[year][region]};
    acc.push(newObj); 
    return acc;
  }, []);

  const xScale = scaleBand()
    .domain(regions)
    .range([margin.left, plotWidth])
    .padding(0.4);
  const yScale = scaleLinear()
    .domain([0, 100])
    .range([plotHeight, margin.top]);
  const color = scaleOrdinal()
    .domain(regions)
    .range(schemeSet2.slice(0, 5));
  
  svg.selectAll('.bars')
    .data(yearlyVals)
    .enter()
    .append('rect')
      .attr('class', 'bars')
      .attr('x', d => xScale(d.region))
      .attr('y', d => yScale(d.val))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.val))
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('fill', d => color(d.region));
      
   svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(xScale));
  svg.append('text')
     .attr('transform', `translate(${plotWidth / 2 + margin.left / 2}, ${plotHeight + margin.bottom / 3})`)
     .attr('text-anchor', 'middle')
     .text('Region');

  svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
    .call(axisLeft(yScale));
  svg.append('text')
     .attr('transform', 'rotate(-90)')
     .attr('x', -plotHeight / 2)
     .attr('y', margin.left / 2)
     .attr('dx', '-4em')
     .attr('text-anchor', 'middle')
     .text('Percent of medals');
}

function makeSlider(data, svg) {
  const sliderDiv = select('.vis2')
    .append('div')
    .attr('class', 'sliderDiv');
  const range = data.reduce((acc, entry) => {
    const curr = Number(entry['Year']);
    acc.min = acc.min < curr ? acc.min : curr;
    acc.max = acc.max > curr ? acc.max : curr; 
    return acc;
  }, {min: Infinity, max: -Infinity});
  const slider = sliderDiv.append('input')
    .attr('class', 'yearSlider')
    .attr('type', 'range')
    .attr('value', range.min)
    .attr('step', 2)
    .attr('min', range.min)
    .attr('max', range.max);

  const label = sliderDiv.append('text')
    .attr('text-anchor', 'middle')	
    .text('Year: ' + range.min);

  slider.on('input', e => {
    const curr = Number(slider.property('value'));
    if (curr < 1924 && (curr - range.min) % 4 !== 0) {
      // Before 1924 there were only olympics ever 2 years b/c there were no winter
      // olympics. So move down 2 years if in this range.  
      document.querySelector('.yearSlider').value = curr - 2;
    }
    label.text('Year: ' + slider.property('value'))     
    
  });
}


function getRegion(country) {
  const regions = {
    'China': 'Asia',
    'Greece': 'Europe',
    'United States': 'Americas',
    'Australia': 'Oceania',
    'South Africa': 'Africa',
    'A North American Team': 'Americas',
    'Afghanistan': 'Asia',
    'Algeria': 'Africa',
    'Ali-Baba II': 'Europe',
    'Amateur Athletic Association': 'Europe',
    'Amstel Amsterdamn': 'Europe',
    'Ancora': 'Europe',
    'Angelita': 'Americas',
    'Antwerpia V': 'Europe',
    'Aphrodite': 'Americas', 
    'Argentina': 'Americas',
    'Argonaut Rowing Club': 'Americas',
    'Armenia': 'Asia',
    'Aschenbrodel': 'Europe',
    'Atalanta Boat Club-1': 'Americas',
    'Atalanta Boat Club-2': 'Americas', 
    'Atlanta': 'Americas',
    'Australasia': 'Oceania',
    'Australia': 'Oceania',
    'Australia-1': 'Oceania',
    'Australia/Great Britain': 'Oceania',
    'Austria': 'Europe',
    'Austria-1': 'Europe',
    'Austria-2': 'Europe',
    'Azerbaijan': 'NA',
    'BLO Polo Club, Rugby': 'Europe',
    'Baby-1': 'Europe',
    'Bagatelle Polo Club, Paris': 'Europe', 
    'Bahamas': 'Americas',
    'Bahrain': 'Asia',
    'Ballerina IV': 'Europe',
    'Barbados': 'Americas',
    'Barion/Bari-2': 'Europe',
    'Barrenjoey': 'Oceania',
    'Beatrijs III-1': 'Europe',
    'Belarus': 'Europe',
    'Belgium': 'Europe',
    'Belgium-1': 'Europe',
    'Bem II': 'Europe',
    'Bera': 'Europe',
    'Berliner Ruderclub': 'Europe',
    'Berliner Ruderverein von 1876-2': 'Europe',
    'Bermuda': 'Americas',
    'Bingo': 'Americas',
    'Bissbi': 'Europe',
    'Bluebottle': 'Europe',
    'Bohemia': 'Europe', 
    'Bohemia/Great Britain': 'Europe',
    'Bona Fide': 'Europe',
    'Bonaparte': 'Europe',
    'Bonzo': 'Europe',
    'Boreas-2': 'Europe', 
    'Boston Archers': 'Americas',
    'Botswana': 'Africa',
    'Brazil': 'Americas',
    'Brazil-1': 'Americas',
    'Brazil-2': 'Americas',
    'Brussels Swimming and Water Polo Club': 'Europe',
    'Brynhild-2': 'Europe',
    'Bucintoro Venezia': 'Europe',
    'Bucintoro Venezia-1': 'Europe',
    'Bulgaria': 'Europe',
    'Buraddoo': 'Oceania',
    'Burundi': 'Africa',
    'Cambridge University Boat Club-2': 'Europe',
    'Cameroon': 'Africa',
    'Camille': 'Europe',
    'Canada-1': 'Americas',
    'Canada-2': 'Americas',
    'Caprice': 'Americas', 
    'Carabinier-15': 'Europe',
    'Central Turnverein, Chicago': 'Americas',
    'Century Boat Club-1': 'Americas',
    'Cercle de l\'Aviron Roubaix-4': 'Europe',
    'Chicago Athletic Association': 'Americas',
    'Chicago Athletic Association-2': 'Americas',
    'Chile': 'Americas',
    'China':'Asia',
    'China-1':'Asia',
    'China-2':'Asia',
    'China-3':'Asia',
    'Chinese Taipei': 'Asia',
    'Christian Brothers\' College-1': 'Americas',
    'Chuckles': 'Europe',
    'Cicely-1': 'Europe', 
    'Cincinnati Archers': 'Americas',
    'Clearwater': 'Europe', 
    'Club Nautique de Lyon-2': 'Europe',
    'Cobweb-1': 'Europe',
    'Colombia': 'Americas',
    'Comanche': 'Americas',
    'Complex II': 'Americas',
    'Cornwall': 'Europe',
    'Costa Rica': 'Americas',
    'Cote d\'Ivoire': 'Africa',
    'Crabe II-1': 'Europe',
    'Crabe II-4': 'Europe',
    'Croatia': 'Euroep',
    'Cuba': 'Americas',
    'Cyprus': 'Europe',
    'Czech Republic': 'Europe',
    'Czech Republic-1': 'Europe',
    'Czechoslovakia': 'Europe',
    'Czechoslovakia-1': 'Europe',
    'Denmark': 'Europe',
    'Denmark-1': 'Europe',
    'Denmark-2': 'Europe',
    'Denmark/Sweden': 'Europe',
    'Deutscher Schwimm Verband Berlin': 'Europe',
    'Devon and Somerset Wanderers': 'Europe',
    'Digby': 'Oceania',
    'Djibouti': 'Africa',
    'Djinn': 'Americas',
    'Dominican Republic': 'Americas',
    'Don Schufro': 'Europe',
    'Dormy-1': 'Europe',
    'East Germany': 'Europe',
    'East Germany-1': 'Europe',
    'East Germany-2': 'Europe',
    'Ecuador': 'Americas',
    'Edelweiss II-1': 'Europe',
    'Egypt': 'Africa',
    'Eleda': 'Europe',
    'Elisabeth V': 'Europe',
    'Elisabeth X': 'Europe',
    'Elsie': 'Europe',
    'Elvis Va': 'Europe',
    'Emily': 'Europe',
    'Encore': 'Europe',
    'England': 'Europe',
    'England-1': 'Europe',
    'Eritrea': 'Africa',
    'Erna Signe': 'Europe',
    'Espadarte': 'Europe',
    'Esterel-1': 'Europe',
    'Estonia': 'Europe',
    'Ethiopia': 'Africa',
    'Ethnikos Gymnastikos Syllogos': 'Europe',
    'Falcon IV': 'Oceania',
    'Fantlet-7': 'Europe',
    'Favorite Hammonia-3': 'Europe',
    'Favorite-1': 'Europe',
    'Femur-1': 'Europe',
    'Fiji': 'Oceania',
    'Finland': 'Europe', 
    'Formosa': 'Americas',
    'Fornebo': 'Europe',
    'Foxhunters Hurlingham': 'Europe',
    'France': 'Europe',
    'France-1': 'Europe',
    'France-2': 'Europe',
    'France-3': 'Europe',
    'France/Great Britain': 'Europe',
    'Frankfurt Club': 'Europe',
    'Frimousse': 'Europe',
    'Gabon': 'Africa',
    'Gallant': 'Americas',
    'Gallia II': 'Europe',
    'Galt Football Club': 'Americas',
    'Gem': 'Americas',
    'Gem IV': 'Americas',
    'Georgia': 'Asia',
    'Germania II': 'Europe',
    'Germania Ruder Club, Hamburg-2': 'Europe',
    'Germany': 'Europe',
    'Germany-1': 'Europe',
    'Germany-2': 'Europe',
    'Ghana': 'Africa',
    'Gitana-2': 'Europe',
    'Great Britain': 'Europe',
    'Great Britain-1': 'Europe',
    'Great Britain-2': 'Europe',
    'Great Britain-3': 'Europe',
    'Great Britain/Germany': 'Europe',
    'Greece': 'Europe',
    'Greece-1': 'Europe',
    'Greece-2': 'Europe',
    'Grenada': 'Americas',
    'Guatemala': 'Americas',
    'Gustel X': 'Europe',
    'Guyana': 'Americas'
  };

  if (!regions[country]) return 'NA';
  return regions[country];
}
