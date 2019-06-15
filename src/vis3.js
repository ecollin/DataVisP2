import {select, enter} from 'd3-selection';
// MAKE A FORM TO SELECT YEAR: 50, 40 etc ?


// Each number is the bottom of an ~10 year range during which age will be examined. 
// No olympics from 36-48 hence the gap
const yearRanges = [1896, 1906, 1916, 1926, 1948, 1958, 1968, 1978, 1988, 1998, 2008];

export function makeVis3(data) {
  const height = 500;
  const width = 500;
  const div = select('#app').append('div')
    .attr('class', 'vis3');

  const svg = select('.vis3').append('svg')
    .attr('class', 'vis3Chart')
    .attr('width', width)
    .attr('height', height);

  
  const newData = processData(data);
console.log(newData);
  
makeRangeSelectors(newData);


}

function drawChart(data) {
  


}

// Creates yearRanges.length checkboxes. Each checkbox when selected will include
// the corresponding year range's data in vis2 and redraw it.
// Each is labelled with its year range and the # medalists > 50 in it.
function makeRangeSelectors(data) {
  const div = select('.vis3').append('div')
    .attr('class', 'checkbox-div');

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
      .text(d => d);
}


// Creates an array whose indices correspond to the indices of yearRanges
// and each entry of which holds an object with total medal count in that range
// and a prop for each event in that range where medals were won by people > 50 yrs old
function processData(data) {
  const medalists = data.filter((entry) => {
    return entry['Medal'] !== 'NA' && Number(entry['Age']) >= 50;
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
