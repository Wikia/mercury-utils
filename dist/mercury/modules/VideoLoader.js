/// <reference path="../../baseline/mercury.d.ts" />
/// <reference path="./VideoPlayers/Base.ts" />
'use strict';
var Mercury;
(function (Mercury) {
    var Modules;
    (function (Modules) {
        var playerClassMap = {
            youtube: 'YouTube',
            ooyala: 'Ooyala'
        };
        class VideoLoader {
            constructor(data) {
                this.data = data;
                this.loadPlayerClass();
            }
            isProvider(name) {
                return !!this.data.provider.toLowerCase().match(name);
            }
            loadPlayerClass() {
                var provider = this.getProviderName(), playerClassStr = (playerClassMap[provider] || 'Base') + 'Player', players = Modules.VideoPlayers, params = $.extend(this.data.jsParams, {
                    size: {
                        height: this.data.height,
                        width: this.data.width
                    }
                });
                this.player = new players[playerClassStr](provider, params);
                this.player.onResize();
            }
            getProviderName() {
                return this.isProvider('ooyala') ? 'ooyala' : this.data.provider;
            }
            onResize() {
                this.player.onResize();
            }
        }
        Modules.VideoLoader = VideoLoader;
    })(Modules = Mercury.Modules || (Mercury.Modules = {}));
})(Mercury || (Mercury = {}));
