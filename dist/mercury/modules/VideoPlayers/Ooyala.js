/// <reference path="../../../../../typings/jquery/jquery.d.ts" />
/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/calculation.ts" />
/// <reference path="./Base.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            class OoyalaPlayer extends VideoPlayers.BasePlayer {
                constructor(provider, params) {
                    super(provider, params);
                    this.resourceURI = this.params.jsFile[0];
                    this.containerId = this.createUniqueId(this.params.playerId);
                    this.started = false;
                    this.ended = false;
                    this.containerSelector = '#' + this.containerId;
                    this.setupPlayer();
                }
                setupPlayer() {
                    this.params = $.extend(this.params, {
                        onCreate: () => { return this.onCreate.apply(this, arguments); }
                    });
                    if (!window.OO) {
                        this.loadPlayer();
                    }
                    else {
                        this.createPlayer();
                    }
                }
                createPlayer() {
                    window.OO.Player.create(this.containerId, this.params.videoId, this.params);
                }
                playerDidLoad() {
                    this.createPlayer();
                }
                onCreate(player) {
                    var messageBus = player.mb;
                    messageBus.subscribe(window.OO.EVENTS.PLAYER_CREATED, 'tracking', () => {
                        this.track('player-load');
                    });
                    messageBus.subscribe(window.OO.EVENTS.PLAYING, 'tracking', () => {
                        if (!this.started) {
                            this.track('content-begin');
                            this.started = true;
                        }
                    });
                    messageBus.subscribe(window.OO.EVENTS.WILL_PLAY_ADS, 'tracking', () => {
                        this.track('ad-start');
                    });
                    messageBus.subscribe(window.OO.EVENTS.ADS_PLAYED, 'tracking', () => {
                        this.track('ad-finish');
                    });
                }
            }
            VideoPlayers.OoyalaPlayer = OoyalaPlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
