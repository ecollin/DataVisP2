import {select} from 'd3-selection';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeSet2} from 'd3-scale-chromatic';
import {axisBottom, axisLeft} from 'd3-axis';
import {getRegion} from './utils.js';

// Takes the original data--an array of objects where each entry is 
// an olympian-- and converts into an object where each prop is a year
// and holds an object with properties for each region and the number of medals
// that region won that year

const regions = ['Americas', 'Asia', 'Europe', 'Africa', 'Oceania'];

// Below is list of years in which you'd expect olympics but there were none
const badYears = ['1906', '1916', '1940', '1944'];

function processData(data) {
  const medalists = data.filter((entry) => {
    return entry['Medal'] !== 'NA' && 
    // Olympics were unofficial in 1906
      entry['Year'] !== '1906' && 
    // Olympics were cancelled in the years below
      entry['Year'] !== '1916' &&
      entry['Year'] !== '1940' &&
      entry['Year'] !== '1944';
  });
 
  const regionData = medalists.reduce((acc, entry) => {
    const year = Number(entry['Year']); 
    const region = getRegion(entry['Team']);
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

  // medalData holds object with prop for every olympic year
  // and that prop holds an obj with medal counts for the 5 regions
  // in that year: Asia, Europe, Americas, Oceania, and Africa
  const medalData = processData(data);

  makeSlider(data, medalData);
  drawChart(medalData);  
}

function drawChart(medalData) {
  const width = 500;
  const height = 500;
  const margin = {top: 50, left: 80, right: 50, bottom: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const year = document.querySelector('.yearSlider').value;
  const regions = ['Americas', 'Asia', 'Europe', 'Africa', 'Oceania'];

  const yearlyVals = regions.reduce((acc, region) => {
    const newObj = {region, val: medalData[year][region]};
    if (isNaN(newObj.val)) newObj.val = 0;
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
  
  const svg = select('.medalChart');
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
     .attr('transform', `translate(${plotWidth / 2 + margin.left / 2}, ${plotHeight + margin.bottom})`)
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

function makeSlider(data, medalData) {
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
    let curr = Number(slider.property('value'));
    if (curr < 1992 && (curr - range.min) % 4 !== 0) {
      // Before 1992 there were only olympics ever 2 years b/c there were no winter
      // olympics. So move down 2 years if in this range.  
      curr = curr - 2;
    }
    while (badYears.map(Number).includes(curr)) {
      curr -= 4;
    }
    document.querySelector('.yearSlider').value = curr;

    label.text('Year: ' + slider.property('value'))     
    select('.medalChart').selectAll('*').remove();
    drawChart(medalData);
    
  });
}


