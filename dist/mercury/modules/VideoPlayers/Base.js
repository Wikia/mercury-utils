/// <reference path="../../../baseline/mercury.d.ts" />
/// <reference path="../../utils/track.ts" />
/// <reference path="../../utils/load.ts" />
/// <reference path="../../utils/calculation.ts" />
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var VideoPlayers;
        (function (VideoPlayers) {
            class BasePlayer {
                constructor(provider, params) {
                    this.containerSelector = '.lightbox-content-inner > iframe';
                    if (!provider) {
                        throw new Error('VideoPlayer requires a provider as the first argument');
                    }
                    this.provider = provider;
                    this.params = params;
                    this.id = params.videoId;
                    this.videoWidth = params.size.width;
                    this.videoHeight = params.size.height;
                }
                loadPlayer() {
                    return M.load(this.resourceURI, () => {
                        this.playerDidLoad();
                    });
                }
                playerDidLoad() { }
                onResize(containerSelector = this.containerSelector) {
                    var $container = $(containerSelector), $lightbox = $('.lightbox-wrapper'), lightboxWidth = $lightbox.width(), lightboxHeight = $lightbox.height(), targetSize, sanitizedSize;
                    targetSize = Mercury.Utils.Calculation.containerSize(lightboxWidth, lightboxHeight, this.videoWidth, this.videoHeight);
                    if (targetSize.width > 0 && targetSize.height > 0) {
                        sanitizedSize = {
                            width: targetSize.width,
                            height: targetSize.height
                        };
                    }
                    else {
                        sanitizedSize = {
                            width: '100%',
                            height: '100%'
                        };
                    }
                    $container.css(sanitizedSize);
                }
                createUniqueId(id) {
                    var element = document.getElementById(id), newId = id + new Date().getTime();
                    if (element) {
                        element.id = newId;
                    }
                    return newId;
                }
                track(event = '') {
                    return M.track({
                        action: event,
                        label: this.provider,
                        category: 'video-player-' + event
                    });
                }
            }
            VideoPlayers.BasePlayer = BasePlayer;
        })(VideoPlayers = Modules.VideoPlayers || (Modules.VideoPlayers = {}));
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
