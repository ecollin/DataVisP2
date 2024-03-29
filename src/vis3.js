import {select, selectAll, enter} from 'd3-selection';
import {scaleBand, scaleLinear, scaleOrdinal} from 'd3-scale';
import {schemeCategory10} from 'd3-scale-chromatic';
import {axisBottom, axisLeft} from 'd3-axis';

// MAKE A FORM TO SELECT YEAR: 50, 40 etc ?


// Each number is the bottom of an ~10 year range during which age will be examined. 
// No olympics from 36-48 hence the gap
const yearRanges = [1896, 1906, 1916, 1926, 1948, 1958, 1968, 1978, 1988, 1998, 2008];

export function makeVis3(data) {

  
  makeAgeSelector(data);
  const newData = processData(data);
    makeRangeSelectors(newData);
  drawChart(newData);
}

function makeAgeSelector(data) {
  const div = select('.vis3').append('div')
    .attr('class', 'ageDiv');

    div.append('label')
      .attr('class', 'label')
      .attr('for', 'ageSelector')
      .text('Bottom of 10 year age range displayed (10-50 are valid): ')
    const ageSelector = div.append('input')
      .attr('id', 'ageSelector')
      .attr('type', 'number')
      .attr('min', 10)
      .attr('max', 50)
      .property('value', 50);
    const button = div.append('input')
      .attr('id', 'ageSelectorButton')
      .attr('type', 'button')
      .attr('value', 'Change age range');
    button.on('click', () => {
      const val = Number(ageSelector.property('value'));
      if (val > 50 || val < 10) {
        return; 
      }
      select('.vis3Chart').selectAll('*').remove();
      select('.checkbox-div').selectAll('*').remove();
      const newData = processData(data); 
      makeRangeSelectors(newData);
      drawChart(newData);
    }) ;

/*  ageSelector.on('input', () => {
console.log(val);
    if (val > 70 || val < 10) {
    }
  });
  ageSelector.on('change', () => {
    select('.vis3Chart').selectAll('*').remove();
    select('.checkbox-div').selectAll('*').remove();
    const newData = processData(data); 
    makeRangeSelectors(newData);
    drawChart(newData);
  });
*/

}


function drawChart(data) {
  const width = 500;
  const height = 500;
  const margin = {top: 50, left: 80, right: 50, bottom: 50};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  // fill checkedObjs with the objects from data representing
  // data ranges that the user checked.
  // these objects have a prop for every sport where someone between 
  // ageMin and ageMax won a medal and the count, and also a prop 
  // 'total' for the total # people in that age range in that time
  const checkedObjs = [];
  yearRanges.forEach((_, i) => {
    const box = document.getElementById(`${i}`);
    if (box.checked) checkedObjs.push(data[i]);
  }); 
  // tot holds total # medals won by people >=50 in all selected ranges
  let tot = 0; 
  // each prop in combinedData is an obj with a sport and a value holding
  // % of people >= 50 who won a medal in the selected time range who won it in that sport
  const combinedData = checkedObjs.reduce((acc, obj) => {
    tot += obj['total'];
    Object.keys(obj).forEach(key => {
      if (key === 'total') return;
      // truncKey holds first word of key. This makes things like 
      // sailing women's vs sailing men's map to the same event
      const truncKey = key.substr(0, key.indexOf(' '));
      if (!acc[truncKey]) acc[truncKey] = 0;
      acc[truncKey] += obj[key]; 
    }); 
    return acc;
  }, {});  

  // turn counts into %s
  Object.keys(combinedData).forEach((key) => {
    combinedData[key] = 100 * combinedData[key] / tot; 
  });
  // Now collect the top N largest % sports into an array; these are the ones graphed
  const sports = getTopN(combinedData, 7);
  const finalData = sports.reduce((acc, sport) => {
    const newObj = {sport, value: combinedData[sport]};
    acc.push(newObj);
    return acc;
  }, []);

  const x = scaleBand()
    .domain(sports)
    .range([margin.left, plotWidth])
    .padding(0.4);
    const y = scaleLinear()
    .domain([0, 100])
    .range([plotHeight, margin.bottom]);
  const color = scaleOrdinal()
    .domain(sports)
    .range(schemeCategory10);

  const svg = select('.vis3Chart');
  svg.selectAll('.bars')
    .data(finalData)
    .enter()
    .append('rect')
      .attr('class', 'bars')
      .attr('x', d => x(d.sport))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => y(0) - y(d.value))
      .attr('stroke-width', 1)
      .attr('stroke', 'black')
      .attr('fill', d => color(d.sport))
      .on('mouseover', d => {
        svg.append('text')
          .attr('id', 'hover-text')
          .attr('x', x(d.sport))
          .attr('y', margin.top + 20)
          .attr('fill', 'black')
          .attr('font-family', 'sans-serif')
          .attr('font-size', '20px')
          .text(d.sport);
      })
      .on('mouseout', d => {
        select('#hover-text').remove();
      });
     
  svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${plotHeight})`)
    .call(axisBottom(x));
  svg.append('text')
     .attr('transform', `translate(${plotWidth / 2 + margin.left / 2}, ${plotHeight + margin.bottom})`)
     .attr('text-anchor', 'middle')
     .text('Event');
  select('.vis3').selectAll('.tick')
    .attr('font-size', 8);

  svg.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, 0)`)
    .call(axisLeft(y));
  svg.append('text')
     .attr('transform', 'rotate(-90)')
     .attr('x', -plotHeight / 2)
     .attr('y', margin.left / 2)
     .attr('dx', '-4em')
     .attr('text-anchor', 'middle')
     .text('% medals (for selected age range)');
}

//Given an object with properties that are numbers,
// returns an array holding the n largest properties
function getTopN(obj, n) {
  const vals = [];
  for (const prop in obj) {
    vals.push(obj[prop]);
  }
  vals.sort((a, b) => b-a);
  const min = vals.length < n ? vals[vals.length - 1] : vals[n-1]; 
  const res = [];
  for (const prop in obj) {
    if (obj[prop] >= min) res.push(prop);
    if (res.length === n) return res;
  }
  // get here if fewer than n properties.
  return res; 
  

}

// Creates yearRanges.length checkboxes. Each checkbox when selected will include
// the corresponding year range's data in vis2 and redraw it.
// Each is labelled with its year range and the # medalists > 50 in it.
function makeRangeSelectors(data) {
  const div = select('.checkbox-div');

  const labels = yearRanges.map((year) => {
    const rangeStr = getRangeString(year);
    const i = getRangeIndex(year);
    return rangeStr + ` (n=${data[i]['total']}) `; 
  });

  div.selectAll('.label')
    .data(labels)
    .enter()
    .append('label')
      .attr('class', 'label')
      .attr('for', (d, i) => i)
      .text(d => d)
   .append('input')
      .attr('class', 'checkboxes')
      .attr('type', 'checkbox')
      .attr('id', (d, i) => i)
      .property('checked', (d, i) => i === yearRanges.length - 1)
      .on('change', () => {
        select('.vis3Chart').selectAll('*').remove();
        drawChart(data);
      });
}


// Creates an array whose indices correspond to the indices of yearRanges
// and each entry of which holds an object with total medal count in that range
// and a prop for each event in that range where medals were won by people > 50 yrs old
function processData(data) {
  const ageMin = select('#ageSelector').property('value');
  const ageMax = ageMin + 10;

  const medalists = data.filter((entry) => {
    return entry['Medal'] !== 'NA' && 
      Number(entry['Age']) >= ageMin && Number(entry['Age']) <= ageMax;
  });
  const res = medalists.reduce((acc, entry) => {
    const i = getRangeIndex(Number(entry['Year']));
    if (i === -1) alert('Hell nah');
    if (!acc[i]) {
      acc[i] = {total: 0};
    }
    const event = entry['Event']; 
    if (!(acc[i][event])) acc[i][event] = 0;
    acc[i][event]++;
    acc[i]['total']++;
    return acc;
  }, []);
  return res;
}

// Given a year beween 1896-2016, returns the index in the array yearRanges
// that coresponds to the year range that the year is in. Ex: 1896 returns 0,
// 1910 returns 1, etc. Returns -1 if given an invalid year.
function getRangeIndex(year) {
  // Note that there should be no data between 1936-1948 exclusive.
  if (year >= 1896 && year <= 1936) {
    const temp = year - 1896; 
    return Math.floor(temp / 10);
  } else if (year >= 1948 && year <= 2016) {
    const temp = year - 1948;
    return Math.floor(temp / 10) + 4; 
  } else {
    return -1;
  }
}

// Given an index for yearRanges, returns the years included in that range as a string
// Ex: getRangeString(0) returns "1896-1906", getRangeString(3) returns "1928-1936". 
function getRangeString(year) {
  const index = getRangeIndex(year);
  if (index < yearRanges.length - 1) {
    const initial = yearRanges[index];
    const final = initial + 10;
    return `${initial}-${final}`;
  } else {
    return "2008-2016"; //last year range is not 10 years
  }
}
