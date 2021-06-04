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

  game.settings.register("foundryvtt-radio", "autoPlay", {
		name: "Auto-play",
    hint: "Radio should start automatically",
    scope: "client", 
		type: Boolean,
		config: true,
    default: true,   
	});

  // Preload Handlebars templates
  // Register custom sheets (if any)
  game.radioPlayer = new RadioPlayer({
    src: game.settings.get("foundryvtt-radio", "audioSrc"),
    volume: game.settings.get("foundryvtt-radio", "audioVolume"),
    autoPlay: game.settings.get("foundryvtt-radio", "autoPlay"),
  })
});

Hooks.on("renderPlaylistDirectory", (app, html, data) => {
  console.log('foundryvtt-radio | renderPlaylistDirectory');

  game.radioPlayer.render(html)
})

class RadioPlayer {
  constructor({ src, volume, autoPlay }) {
    this.audioSrc = src
    this.audioVolume = volume
    // Prepare Elements
    // radioWrapper
    // - radioPlayer
    // - - radioStatusElement
    // - - radioPlayElement
    // - - radioVolumeElement
    // - - audioElement
    this.radioWrapper = $(`<div id="foundryvtt-radio" class="global-volume playlist flexrow">
      <header class="playlist-header flexrow"><h4>Radio player</h4></header>
    </div>`)
    this.isRendered = false;

    const radioPlayer = $(`<div class="flexrow foundryvtt-radio__player"></div>`)
    const radioControlsElement = $(`<div class="flexrow foundryvtt-radio__controls"></div>`)
    const radioStatusElement = $(`<a class="inactive foundryvtt-radio__controls__status" title="Radio Status"><i class="fas fa-sync"></i></a>`)
    this.radioPlayElement = $(`<a class="foundryvtt-radio__controls__play" title="Radio Play"><i class="fas fa-play"></i></a>`)
    this.radioPauseElement = $(`<a class="foundryvtt-radio__controls__pause" title="Radio Pause"><i class="fas fa-pause"></i></a>`)

    this.radioVolumeElement = $(`<input class="global-volume-slider" name="radioVolume" type="range" min="0" max="1" step="0.05" value="${this.audioVolume}">`)
    this.audioElement = $(`<audio ${autoPlay ? 'autoplay=""' : ''} controls="" class="foundryvtt-radio__audio" preload="metadata" src="${this.audioSrc}" title="${this.audioSrc}"><p>Your browser does not support the <code>audio</code> element.</p></audio>`)

    // Add event listeners
    if (autoPlay) {
      this.audioElement.on("canplay", () => this.setRadioState(RADIO_STATE_PLAYING));
      // Force it at the end of the stack
      setTimeout(() => {
        this.audioElement[0].play();
      }, 0)
    }
    this.audioElement.on("play", () => this.setRadioState(RADIO_STATE_PLAYING));
    this.audioElement.on("pause", () => this.setRadioState(RADIO_STATE_PAUSED));
    this.audioElement.on("error", () => this.setRadioState(RADIO_STATE_PAUSED));

    // Apply settings
    this.setRadioState(autoPlay ? RADIO_STATE_CONNECTING : RADIO_STATE_PAUSED)
    this.audioElement[0].volume = this.audioVolume

    // Append to DOM
    radioControlsElement.append(radioStatusElement)
    radioControlsElement.append(this.radioPlayElement)
    radioControlsElement.append(this.radioPauseElement)
    radioPlayer.append(radioControlsElement)
    radioPlayer.append(this.radioVolumeElement)

    this.radioWrapper.append(radioPlayer)
  }

  render(html) {
    console.log('foundryvtt-radio | render', this.isRendered);
    if (!this.isRendered) {
      this.inject()
      this.isRendered = true;
    }
    this.removeControlsListeners();
    this.renderControls(html)
  }

  inject() {
    console.log('foundryvtt-radio | inject', this.isRendered);
    $('body').append(this.audioElement);
  }

  renderControls(html) {
    console.log('foundryvtt-radio | renderControls', this.isRendered);
    html.find(".directory-list").append(this.radioWrapper);
    this.setControlsListeners()
  }

  setRadioState(state) {
    this.radioWrapper.attr("data-radio-state", state)
  }

  setControlsListeners() {
    this.radioPlayElement.on("click", () => this.audioElement[0].play());
    this.radioPauseElement.on("click", () => this.audioElement[0].pause());
    this.radioVolumeElement.on("input", (e) => this.audioElement[0].volume = e.target.value);
  }

  removeControlsListeners() {
    this.radioPlayElement.off()
    this.radioPauseElement.off()
    this.radioVolumeElement.off()
  }
}