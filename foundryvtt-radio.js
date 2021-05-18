const RADIO_STATE_CONNECTING = "connecting"
const RADIO_STATE_PAUSED = "paused"
const RADIO_STATE_PLAYING = "playing"

Hooks.once("init", async function () {
  console.log('foundryvtt-radio | Initializing foundryvtt-radio');

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
    range: {
      min: 0,
      max: 1,
      step: 0.1
    },
    default: 0.5,   
	});

  // Preload Handlebars templates
  // Register custom sheets (if any)
});

Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  console.log('foundryvtt-radio | renderPlaylistDirectory');

  // Retrieve settings
  const audioSrc = game.settings.get("foundryvtt-radio", "audioSrc");
  const audioVolume = game.settings.get("foundryvtt-radio", "audioVolume");

  // Prepare Elements
  // radioWrapper
  // - radioPlayer
  // - - radioStatusElement
  // - - radioPlayElement
  // - - radioVolumeElement
  // - - audioElement
  const radioWrapper = $(`<li id="foundryvtt-radio" class="global-volume directory-item playlist flexrow">
    <header class="playlist-header flexrow"><h4>Radio player</h4></header>
  </li>`)

  const radioPlayer = $(`<div class="flexrow foundryvtt-radio__player"></div>`)
  const radioControlsElement = $(`<div class="flexrow foundryvtt-radio__controls"></div>`)
  const radioStatusElement = $(`<a class="sound-control inactive foundryvtt-radio__controls__status" title="Radio Status"><i class="fas fa-sync"></i></a>`)
  const radioPlayElement = $(`<a class="sound-control foundryvtt-radio__controls__play" title="Radio Play"><i class="fas fa-play"></i></a>`)
  const radioPauseElement = $(`<a class="sound-control foundryvtt-radio__controls__pause" title="Radio Pause"><i class="fas fa-pause"></i></a>`)

  const radioVolumeElement = $(`<input class="global-volume-slider" name="radioVolume" type="range" min="0" max="1" step="0.05" value="${audioVolume}">`)
  const audioElement = $(`<audio autoplay="" controls="" class="foundryvtt-radio__audio" preload="metadata" src="${audioSrc}" title="${audioSrc}"><p>Your browser does not support the <code>audio</code> element.</p></audio>`)

  // Add event listeners
  audioElement.on("canplay", () => setRadioState(radioWrapper, RADIO_STATE_PLAYING));
  audioElement.on("play", () => setRadioState(radioWrapper, RADIO_STATE_PLAYING));
  audioElement.on("pause", () => setRadioState(radioWrapper, RADIO_STATE_PAUSED));

  radioPlayElement.on("click", () => audioElement[0].play());
  radioPauseElement.on("click", () => audioElement[0].pause());
  radioVolumeElement.on("change", (e) => audioElement[0].volume = e.target.value);

  // Apply settings
  setRadioState(radioWrapper, RADIO_STATE_CONNECTING)
  audioElement[0].volume = audioVolume

  // Append to DOM
  radioControlsElement.append(radioStatusElement)
  radioControlsElement.append(radioPlayElement)
  radioControlsElement.append(radioPauseElement)
  radioPlayer.append(radioControlsElement)
  radioPlayer.append(radioVolumeElement)
  radioPlayer.append(audioElement)

  radioWrapper.append(radioPlayer)
  html.find(".directory-list").append(radioWrapper);
})

function setRadioState(element, state) {
  element.attr("data-radio-state", state)
}