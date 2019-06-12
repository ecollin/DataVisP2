import {csv} from 'd3-fetch';

csv('data/athlete_events.csv')
  .then(data => {
    processData(data);
  });

function processData(data) {
  console.log(data);
}

