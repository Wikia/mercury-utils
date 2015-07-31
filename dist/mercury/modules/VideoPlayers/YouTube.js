/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="./Base.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            class YouTubePlayer extends VideoPlayers.BasePlayer {
                constructor(provider, params) {
                    super(provider, params);
                    this.resourceURI = 'https://www.youtube.com/iframe_api';
                    this.containerId = this.createUniqueId('youtubeVideoPlayer');
                    this.started = false;
                    this.ended = false;
                    this.bindPlayerEvents();
                }
                bindPlayerEvents() {
                    this.params.events = {
                        'onReady': () => { return this.onPlayerReady.apply(this, arguments); },
                        'onStateChange': () => { return this.onPlayerStateChange.apply(this, arguments); }
                    };
                    if (window.YT) {
                        this.createPlayer();
                    }
                    else {
                        window.onYouTubeIframeAPIReady = () => {
                            this.createPlayer();
                        };
                        this.loadPlayer();
                    }
                }
                createPlayer() {
                    this.player = new window.YT.Player(this.containerId, this.params);
                }
                onPlayerReady() {
                    this.onResize();
                    this.track('player-loaded');
                }
                onPlayerStateChange(event) {
                    if (!this.started && event.data === 1) {
                        this.track('content-begin');
                        this.started = true;
                    }
                    if (!this.ended && event.data === 0) {
                        this.track('content-end');
                        this.ended = true;
                    }
                }
            }
            VideoPlayers.YouTubePlayer = YouTubePlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
