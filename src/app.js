import {csv} from 'd3-fetch';
import {makeGDPVis} from './GDPVis.js';
import {makeVis2} from './vis2.js';
import {makeVis3} from './vis3.js';
import {makeVis4} from './vis4.js';
import {makeVis5} from './vis5.js';

csv('data/athlete_events.csv')
  .then(data => {
    makeVises(data);
  });

function makeVises(data) {
  makeGDPVis(data); 
  makeVis2(data);
  makeVis3(data);
  makeVis4(data);
  makeVis5(data);
}
