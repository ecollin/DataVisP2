import {select} from 'd3-selection';
import {csv} from 'd3-fetch';
import {makeVis2} from './vis2.js';
import {makeVis3} from './vis3.js';

const text1 = `
Our group looked at olympics data going as far back as 1896, when the modern Olympic Games began. 
We performed a general analysis of this data to look at trends and understand both how different countries and regions have fared over the years, 
and also how different demographics have fared in different Olympic events.
`;
const text2 = ` 
The first visualization we created was inspired by the famous 5 olympic rings. Many people probably don't realize what the rings represent: each of the 5 different regions of the world. That is, the Americas, Europe, Africa, Asia, and Oceania. These are the regions that the classic olympic symbol puts into competition with each other, so we decided to ask, over the years, how have these different regions fared against one another? Have their fates changed, as you would imagine they would have, as the number of olympic participants has grown dramatically and the world has shifted? 
`;
const text3 = `
Scrolling through the years, it's easy to be surprised that the results haven't changed as drastically as one might've expected. In the initial years, Asia, Africa, and Oceania are hardly represented; indeed, in the first modern olympic games in 1896, all of the participants were from European countries except for 1 alleged participant from Chile, a participant from the not-yet independent Australia, and a fair few from the Americas (https://en.wikipedia.org/wiki/1896_Summer_Olympics). But, after they gain some representation (taking from the European medal count), ignoring the occasional yearly outlier, their percentages hover around the same numbers. In recent years, with the fall of the Soviet Union and the rise of China, it seems the trend just described has become more severe, with the Americas and Asia more consistently hovering around 20 % and 17 %, respectively. Perhaps whether this trend holds in years to come will be an indicator of the path history has taken.
`;

const text4 = `
Our next visualization sought to zoom in moreso on contestants and examine which age groups win most of their medals from which events, and how this has changed overtime. At the top you can select which decades of Olympics to include data from, and at the bottom you can input a minimum age (the maximum age will be that age + 10). Then the visualization will display up to the top 7 events where people in those times in that age group won their medals from. If the axis labels are too small, you can hover over a bar to see its label.
`;

const text5 = `
A lot of information could be analyzed through this visualization. One interesting one is where people in the ages 50-60 get their medals. In recent years, by far the most common answer is equestrian events. If you go back in time though, other events take the lead, from the art events (which were non-athletic events in the categories of architecture, literature, music, painting, and sculpture, which were eventually removed because artists could use their works commercially and the olympics were supposed to be non-commercial in that sense) to other athletic events that youth doesn't give too much of an advantage in such as archery. Sailing has always also been common for the older olympian winners. (A flaw with this vis that I feel obligated to note is that it does not account for the total number of participants in each event over the years. Equestrianism likely has many more participants than it used to, at least partly explaining its rise in older medalists.
`;

/* 
 * setupPage just adds the texts above to the HTML and divs/svgs for the visualizations. 
 *
 * TODO: consider moving the div creations for text here to index.html. 
 * They were created in JS due to rushing to finish the project w/out 
 * much consideration.
 */
function setupPage() {
  const height = 500;
  const width = 500;
  select('#intro').text(text1);
  select('body').append('div').append('text').text(text2);
  select('body').append('div').append('text').text(text3);
  select('body').append('div')
    .attr('class', 'vis2')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center')
    .style('justify-content', 'center');
  
  select('.vis2').append('svg')
    .attr('class', 'medalChart')
    .attr('width', width)
    .attr('height', height);
  
  select('body').append('div').style('margin', '30px 0').append('text').text(text4);
  
  select('body').append('div')
    .attr('class', 'vis3')
    .style('display', 'flex')
    .style('flex-direction', 'column')
    .style('align-items', 'center')
    .style('justify-content', 'center')
  .append('div')
    .attr('class', 'checkbox-div');
  
  select('body').append('div').style('margin', '30px 0').append('text').text(text5);
  
  select('.vis3').append('svg')
    .attr('class', 'vis3Chart')
    .attr('width', width)
    .attr('height', height);
}
setupPage();

csv('data/athlete_events.csv')
  .then(data => {
    makeVises(data);
  });


function makeVises(data) {
  makeVis2(data);
  makeVis3(data);
}


