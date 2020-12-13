import './api.js'
import { getTracks, getRacers, getRace, createRace, 
	accelerate, defaultFetchOpts, startRace } from './api.js';

import { renderAt, renderRacerCars, renderTrackCards, 
	raceProgress, renderCountdown, renderRaceStartView, 
	renderRacerCard, renderTrackCard, resultsView } from './render.js';

// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
var store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		const tracks = await getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html);
				return tracks;
			})
		

		const racers = await getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html);
				return racers;
			});

		store.tracks = tracks;
		store.racers = racers;

	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event
		
		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// Get player_id and track_id from the store
	const { player_id, track_id } = store; 
	const selectedTrack = store.tracks.find(t => t.id.toString() === track_id);

	// render starting UI
	renderAt('#race', renderRaceStartView(selectedTrack, racers))
	
	
	// const race = invoke the API call to create the race, then save the result
	const race = await createRace(player_id, track_id);
	console.log(race)
	// update the store with the race id
	store.race_id = race.ID;

	// The race has been created, now start the countdown
	// call the async function runCountdown
	await runCountdown();

	// call the async function startRace
	await startRace(store.race_id);

	// call the async function runRace
	await runRace(store.race_id);
}

async function runRace(raceID) {
	let intervalId;
	const races = await getRacers();
	return new Promise(resolve => {
		// use Javascript's built in setInterval method to get race info every 500ms
		intervalId = setInterval(async () =>{
			const updateRace = await getRace(raceID);
			console.log(updateRace);
		}, 500 )
	/* 
		TODO - if the race info status property is "in-progress", update the leaderboard by calling:

		renderAt('#leaderBoard', raceProgress(res.positions))
	*/

	/* 
		TODO - if the race info status property is "finished", run the following:

		clearInterval(raceInterval) // to stop the interval from repeating
		renderAt('#race', resultsView(res.positions)) // to render the results view
		reslove(res) // resolve the promise
	*/
	})
	// remember to add error handling for the Promise
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3
		let intervalId = 0;

		return new Promise(resolve => {

			// use Javascript's built in setInterval method to count down once per second
			intervalId = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer
				if(timer <= 0){
					// if the countdown is done, clear the interval, resolve the promise, and return
					clearInterval(intervalId);
					resolve();
				}
			}, 1000);
		})
	} catch(error) {
		console.log(error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store
	store.player_id = target.id

}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')
	console.log(target.id)
	// save the selected track id to the store
	store.track_id = target.id
}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// Invoke the API call to accelerate
	accelerate(store.player_id);
}
