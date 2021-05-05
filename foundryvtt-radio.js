/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your module, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your module
 */

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  console.log('foundryvtt-radio | Initializing foundryvtt-radio');

  // Assign custom classes and constants here

  // Register custom module settings
  game.settings.register("foundryvtt-radio", "audioSrc", {
		name: "Audio Source",
    hint: "Source of the web radio (ex: https://radio.lucas.computer:27060/live)",
    scope: "world", 
		type: String,
		default: "https://radio.lucas.computer:27060/live",
		config: true
	});

  game.settings.register("foundryvtt-radio", "audioVolume", {
		name: "Audio default Volume",
    hint: "Set the default audio volume (effective on next reload)",
    scope: "client", 
		type: Number,
		config: true,
    range: {             // If range is specified, the resulting setting will be a range slider
      min: 0,
      max: 1,
      step: 0.1
    },
    default: 0.5,   
	});

  // Preload Handlebars templates

  // Register custom sheets (if any)
});

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
Hooks.once('setup', function () {
  console.log('foundryvtt-radio | setup foundryvtt-radio');
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once('ready', function () {
  console.log('foundryvtt-radio | ready foundryvtt-radio');
  // Do anything once the module is ready
});

// Add any additional hooks if necessary
Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  const radioWrapper = $(`<li class="global-volume directory-item playlist flexrow">
    <header class="playlist-header flexrow"><h4>Radio player</h4></header>
  </li>`)

  const audioSrc = game.settings.get("foundryvtt-radio", "audioSrc");
  const audioVolume = game.settings.get("foundryvtt-radio", "audioVolume");
  const audioElement = $(`<audio autoplay="" controls="" id="foundryvtt-radio" preload="metadata" src="${audioSrc}" title="${audioSrc}"><p>Your browser does not support the <code>audio</code> element.</p></audio>`)
  audioElement[0].volume = audioVolume

  radioWrapper.append(audioElement)
  html.find(".directory-list").append(radioWrapper);
})