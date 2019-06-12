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
  const width = 500;
  const height = 500;
  const margin = {top: 50, left: 80, right: 50, bottom: 150};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const svg = select('#app').append('svg')
    .attr('class', 'vis2')
    .attr('width', width)
    .attr('height', height);

  // medalData holds object with prop for every olympic year
  // and that prop holds an obj with medal counts for the 5 regions
  // in that year: Asia, Europe, Americas, Oceania, and Africa
  const medalData = processData(data);
  // CHANGE below so that gets year from slider or something
  const year = 2008;
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
     .attr('transform', `translate(${plotWidth / 2}, ${plotHeight + margin.bottom / 3})`)
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

 
    


//  console.log('vis2 is working!');
}

function getRegion(country) {
  const regions = {
    'China': 'Asia',
    'Greece': 'Europe',
    'United States': 'Americas',
    'Australia': 'Oceania',
    'South Africa': 'Africa'
  };

  if (!regions[country]) return 'NA';
  return regions[country];
}
