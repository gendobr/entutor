!function(){function extend(a,b){for(var c in b)a[c]=b[c];return a}if(!window.SP){var SprutoError=function(a){return this instanceof SprutoError?(this.message=a,void 0):new SprutoError(a)};SprutoError.prototype=Error.prototype;var mobileOs={Android:function(){return navigator.userAgent.match(/Android/i)},BlackBerry:function(){return navigator.userAgent.match(/BlackBerry/i)},iOS:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},Opera:function(){return navigator.userAgent.match(/Opera Mini/i)},Windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return this.Android()||this.BlackBerry()||this.iOS()||this.Opera()||this.Windows()}},clone=function(a){switch(Object.prototype.toString.apply(a)){case"[object Array]":for(var b=[],c=0;c<a.length;c++)b[c]=clone(a[c]);return b;case"[object Object]":var d={};for(var c in a)d[c]=clone(a[c]);return d;default:return a}},utils={show:function(a,b){"[object Array]"!==Object.prototype.toString.call(a)&&(a=[a]),"string"!=typeof b&&(b="block");for(var c in a)"object"==typeof a[c]&&(a[c].style.display=b)},hide:function(a){"[object Array]"!==Object.prototype.toString.call(a)&&(a=[a]);for(var b in a)"object"==typeof a[b]&&(a[b].style.display="none")},createElement:function(a,b,c){var d=document.createElement(a);if("object"==typeof b)for(var e in b)d.setAttribute(e,b[e]);return"undefined"!=typeof c&&c.appendChild(d),d},removeElement:function(a){a.parentElement&&a.parentElement.removeChild(a)},addClass:function(a,b){a&&a.setAttribute("class",((a.getAttribute("class")||"")+" "+b).trim())},removeClass:function(a,b){if(a&&a.getAttribute("class")){for(var c=a.getAttribute("class").split(" "),d="",e=0;e<c.length;e++)c[e]!=b&&(d+=c[e].trim()+" ");d=d.trim(),a.setAttribute("class",d)}},hasClass:function(a,b){return a&&-1!=a.getAttribute("class").split(" ").indexOf(b)}},requestUtils={getXmlHttp:function(){var a;try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(b){try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(c){a=!1}}return a||"undefined"==typeof XMLHttpRequest||(a=new XMLHttpRequest),a},request:function(url,data,accept,headers,type,async,success,error){var xmlhttp=this.getXmlHttp();if(xmlhttp.open(type||"GET",url+data,async===!0),"[object Array]"===Object.prototype.toString.call(headers))for(var i=0;i<headers.length;i++)"string"==typeof headers[i].header&&"string"==typeof headers[i].value&&xmlhttp.setRequestHeader(headers[i].header,headers[i].value);return"string"==typeof accept?xmlhttp.setRequestHeader("Accept",accept):xmlhttp.setRequestHeader("Accept","application/json;charset=utf-8"),xmlhttp.onreadystatechange=function(){if(4==xmlhttp.readyState)if(200==xmlhttp.status){var response=JSON&&JSON.parse(xmlhttp.responseText)||eval("("+xmlhttp.responseText+")");success&&success(response)}else error&&error(xmlhttp.status,xmlhttp.statusText)},xmlhttp.send(null),200==xmlhttp.status?JSON.parse(xmlhttp.responseText):null}},callFunction=function(a,b){var c=Array.prototype.slice.call(arguments,2);if("[object Function]"==Object.prototype.toString.apply(a))return a.apply(b,c);for(var d=a.split("."),e=d.pop(),f=0;f<d.length;f++)b=b[d[f]];return b[e].apply(b,c)},assetsroot=splayer.assetsroot?splayer.assetsroot:"http://s3.spruto.org/images/",css='div.splayer{display:block;position:relative;background-color:#000}div.splayer .iframe-container{position:absolute;left:0;top:0;width:100%;height:100%}div.splayer video{background:black;position:absolute;left:0;top:0;z-index:150}div.splayer .preview{position:relative;width:100%;height:100%;z-index:1;cursor:pointer;background-repeat:no-repeat;background-position:center center;-webkit-background-size:cover;-moz-background-size:cover;-o-background-size:cover;background-size:cover}div.splayer .preview.playlist{z-index:1}div.splayer>a.play-button:before{content:"";display:block;padding-top:100%}div.splayer>a.play-button{background:url("'+assetsroot+'play-btn.png") no-repeat scroll center center;background-size:cover;-webkit-background-size:cover;left:50%;margin-left:-6.75%;margin-top:-6.75%;position:absolute;top:50%;width:13.5%;z-index:100}div.splayer .iframe-container iframe{cursor:pointer;opacity:.01;position:absolute;top:0;left:0;z-index:150}div.splayer .iframe-container iframe.play{opacity:1}div.splayer div.error{display:block;position:relative;width:100%;height:100%;line-height:100%;vertical-align:top;background-color:#303030;z-index:175}div.splayer div.error div.error-container{display:block;position:absolute;top:50%;width:100%}div.splayer div.error div.error-img{display:inline-block;margin:0 5% 0 10%;background-color:#883232;text-align:center;-webkit-border-radius:50em;-moz-border-radius:50em;-o-border-radius:50em;border-radius:50em;width:70px;height:70px}div.splayer div.error div.error-img span{color:white;display:inline-block;font-weight:bold;font-size:50px;vertical-align:middle;line-height:68px}div.splayer div.error span.error-text{width:63%;font-size:1.3em;display:inline-block;line-height:130%;vertical-align:middle;color:white;font-size:14px;font-family:Tahoma}.splayer{margin:0;padding:0;border:0;position:relative}.splayer .playlist-overlay{background:none repeat scroll 0 0 rgba(0,0,0,0.85);display:none;font-family:Tahoma;height:100%;left:0;position:absolute;text-align:center;top:0;width:100%;z-index:250}.splayer .playlist-overlay.after-play a.replay-btn{display:none}.splayer .playlist{display:block;height:58%;margin-top:35px;position:relative;text-align:left;width:100%}.splayer .playlist .arrow{position:absolute;display:inline-block;border-radius:100px;vertical-align:middle;top:45%}.splayer .playlist-overlay.square .arrow{top:35%}.splayer .playlist .arrow.right{padding:2.5%;right:.75%;background:rgba(255,255,255,0.1) url("'+assetsroot+'right-icon.png") 50% 50% no-repeat;background-size:35% auto}.splayer .playlist .arrow.left{padding:2.5%;left:.75%;background:rgba(255,255,255,0.1) url("'+assetsroot+'left-icon.png") 40% 50% no-repeat;background-size:35% auto}.splayer .playlist-content{width:85%;height:100%;margin:8% auto 0}.splayer .playlist-overlay.square .playlist-content{margin:17% auto 0}.splayer .nodisplay{display:none}.splayer .video-item{display:inline-block;height:46%;margin:0 0 3% 3.5%;overflow:hidden;position:relative;vertical-align:top;width:22.3%}.splayer .video-item.first{margin-left:0}.splayer .playlist-overlay.square .video-item{height:35%}.splayer .video-item .img{height:100%;width:100%;background-repeat:no-repeat;background-position:center center;-webkit-background-size:cover;-moz-background-size:cover;-o-background-size:cover;background-size:cover}.splayer .video-item .num{background:none repeat scroll 0 0 #000;border-radius:0 0 3px 3px;color:#969696;font-size:1.1em;left:3%;padding:1% 8% 2%;position:absolute;top:0;z-index:100}.splayer .playlist-overlay:not(.after-play) .video-item.current-video .replay-over{background:rgba(255,255,255,0.3);position:absolute;width:100%;height:99%;top:0;left:0;cursor:pointer;z-index:20}.splayer .video-item.current-video .replay-over .icon{background:url("'+assetsroot+'replay-big-icon.png") 0 0 no-repeat;width:20%;height:30%;position:relative;display:block;margin:22% auto 0;background-size:100% auto}.splayer .video-item .title-video{position:absolute;bottom:0;left:0;width:100%;background:rgba(51,51,51,0.7);color:#fff;z-index:1;padding:1% 0 2% 3%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.splayer .playlist-overlay:not(.after-play) .video-item.current-video .title-video{display:none}.splayer .replay-btn,.splayer .show-playlist-btn{border-radius:2px;color:#fff;display:inline-block;font-size:1.1em;line-height:2em;margin-top:2.5%;position:relative;text-align:center;text-decoration:none}.splayer .replay-btn{background:url("'+assetsroot+'replay-small-icon.png") no-repeat scroll 8% center / 12% auto rgba(255,255,255,0.1);padding:0 3% 0 8%}.splayer .show-playlist-container{display:block;position:relative;text-align:center}.splayer .show-playlist-btn{background:rgba(255,255,255,0.1);padding:0 3% 0 3%}.splayer .playlist-overlay.square .replay-btn{line-height:1.8em;font-size:1.1em;margin-top:0}div.splayer>.plugin{z-index:200;pointer-events:none}div.splayer>.plugin>*{pointer-events:auto}',tag=document.createElement("style");tag.innerHTML=css,document.getElementsByTagName("head")[0].appendChild(tag);var behavior={beforePlay:{none:"none",playlist:"playlist"},afterPlay:{black:"black",playlist:"playlist",nextvideo:"nextvideo",repeat:"repeat",start:"start",picture:"picture"},loopMode:{none:"none",playlist:"playlist"}},playerTypes={youtube:"youtube",video:"video",myvi:"myvi",unknown:"unknown"},errorMessages={0:"unspecified_error"},options={playerClassName:"splayer",playBtnClassName:"play-button",previewClassName:"preview",videoUrlClassName:"video-url",videoTypeClassName:"type",playlistClassName:"playlist-overlay",playlistOptions:{defaultPosterURL:assetsroot+"default-poster.png",videoNotFoundPosterUrl:assetsroot+"video-not-found.jpg",playlistContentClass:"playlist-content",currentPlaylistContentClass:"current",nodisplayPlaylistContentClass:"nodisplay",currentVideoClass:"current-video"},localization:{ru:{repeat_button:"\u041f\u043e\u0432\u0442\u043e\u0440\u0438\u0442\u044c",video_not_found:"\u0432\u0438\u0434\u0435\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e",show_playlist:"\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043f\u043b\u0435\u0439\u043b\u0438\u0441\u0442",player:{unspecified_error:"\u041e\u0448\u0438\u0431\u043a\u0430 \u043f\u043b\u0435\u0435\u0440\u0430. \u041f\u0440\u043e\u0432\u0435\u0440\u044c\u0442\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c \u0432\u0438\u0434\u0435\u043e \u0438 \u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438 \u043f\u043b\u0435\u0435\u0440\u0430."}},en:{repeat_button:"Repeat",video_not_found:"video not found",show_playlist:"Show Playlist",player:{unspecified_error:"Player error. Check whether the video is available and whether the player is configured correctly."}}},getPlayerParamUrl:"http://spruto.com/cabinet/api/public/GetPlayerSettings"},settingsUtils={detectPlayerType:function(a){return-1!=a.indexOf(".mp4")?playerTypes.video:/^(?:(?:https?:)?\/\/)?www.youtube.com\//i.test(a)?playerTypes.youtube:/^(?:(?:https?:)?\/\/)?youtu.be\//.test(a)?playerTypes.youtube:/^https?:\/\/fs[0-9]*.myvi.ru\//i.test(a)?playerTypes.video:/^(?:(?:https?:)?\/\/)?([a-z0-9]*.)?myvi.ru\//i.test(a)||/^(?:(?:https?:)?\/\/)?([a-z0-9]*.)?myvi.tv\//i.test(a)?playerTypes.myvi:playerTypes.unknown},detectVideoType:function(a){return"undefined"==typeof a?null:-1!=a.indexOf(".mp4")?"video/mp4":null},getConstrainedString:function(a,b,c){return b[a]?a:c},getMyviVideoId:function(a){var b=a.replace(/\/+$/,"");if(/^(?:(?:https?:)?\/\/)?myvi.ru\/ru\/videodetail.aspx/i.test(b)){if(b=b.split("?")[1])for(var c=b.split("&"),d=0;d<c.length;d++)"video"==c[d].split("=")[0]&&(b=c[d].split("=")[1])}else if(-1!=b.toLowerCase().indexOf("/embed/html/"))b=b.split("/embed/html/")[1],b&&(b=b.split("?")[0]);else{-1!=b.indexOf("?")&&(b=b.slice(0,b.indexOf("?")));var e=b.split("/");b=e.pop(),23!=b.length&&-1!=b.indexOf("_")&&(b=b.slice(b.indexOf("_")+1))}return b},getYTVideoId:function(a){var b=void 0;if(/^(?:(?:https?:)?\/\/)?www.youtube.com\/v\//i.test(a))b=a.replace(/^(?:(?:https?:)?\/\/)?www.youtube.com\/v\//i,"");else if(/^(?:(?:https?:)?\/\/)?youtu.be\//.test(a))b=a.replace(/^(?:(?:https?:)?\/\/)?youtu.be\//,"");else for(var c=a.split("?")[1].split("&"),d=0;d<c.length;d++)if(t=c[d].split("="),"v"==t[0]){b=t[1];break}return b},getDefaultPosterUrl:function(a){switch(a.type){case playerTypes.myvi:return"http://fs.myvi.ru/thumbnail/"+a.id+"/default_hq.jpg";case playerTypes.youtube:return"http://img.youtube.com/vi/"+a.id+"/hqdefault.jpg";default:return options.playlistOptions.defaultPosterURL}},getVideoData:function(a){if(a.video){for(var b=0;b<a.video.length;b++){var c=a.video[b];c["default"]&&(a.default_url=c),c.type=this.detectVideoType(c.url)}switch(a.default_url||(a.default_url=a.video[0]),a.type=a.getVideoFunction?"video":this.detectPlayerType(a.default_url.url),a.type){case playerTypes.myvi:a.id=this.getMyviVideoId(a.default_url.url);break;case playerTypes.youtube:a.id=this.getYTVideoId(a.default_url.url)}}return a.posterUrl||(a.posterUrl=this.getDefaultPosterUrl(a)),a.secondPosterUrl||(a.secondPosterUrl=a.posterUrl),a.thumbnailUrl||(a.thumbnailUrl=a.posterUrl),a},checkParams:function(a,b){if(a.partial&&b&&(b.playlist&&(a.playlist=b.playlist),b.playlistIndex&&(a.playlistIndex=b.playlistIndex),b.behavior&&(b.behavior.beforePlay&&(a.behavior.beforePlay=b.behavior.beforePlay),b.behavior.afterPlay&&(a.behavior.afterPlay=b.behavior.afterPlay),b.behavior.loopMode&&(a.behavior.loopMode=b.behavior.loopMode),b.behavior.autoplay&&(a.behavior.autoplay=b.behavior.autoplay))),a.playlist)for(var c=0;c<a.playlist.length;c++)settingsUtils.getVideoData(a.playlist[c]);else a.playlist=[];if(a.playlistIndex?a.playlistIndex<1?a.playlistIndex=1:a.playlistIndex>a.playlist.length&&(a.playlistIndex=a.playlist.length):a.playlistIndex=1,a.uiLanguage=this.getConstrainedString(a.uiLanguage,{ru:"ru",en:"en"},"en"),a.behavior){if(a.behavior.beforePlay=this.getConstrainedString(a.behavior.beforePlay,behavior.beforePlay,behavior.beforePlay.none),a.behavior.afterPlay=this.getConstrainedString(a.behavior.afterPlay,behavior.afterPlay,behavior.afterPlay.start),a.behavior.loopMode=this.getConstrainedString(a.behavior.loopMode,behavior.loopMode,behavior.loopMode.none),a.behavior.autoplay=Boolean(splayer.playerFeatures.autoplay&&a.behavior.autoplay&&"true"==a.behavior.autoplay.toString()),a.behavior.afterPlay==behavior.afterPlay.start)switch(a.behavior.beforePlay){case behavior.beforePlay.none:a.behavior.afterPlay=behavior.afterPlay.picture;break;case behavior.beforePlay.playlist:a.behavior.afterPlay=behavior.afterPlay.playlist}}else a.behavior={afterPlay:behavior.afterPlay.picture,beforePlay:behavior.beforePlay.none,loopMode:behavior.loopMode.none,autoplay:!1};return a},getParams:function(a,b,c){if("undefined"!=typeof a.UserID){var d="";return"undefined"!=typeof a.UserID&&(d+=(d.length?"&":"?")+"public_user_id="+a.UserID),"undefined"!=typeof a.AlbumID&&(d+=(d.length?"&":"?")+"album_id="+a.AlbumID),"undefined"!=typeof a.VideoID&&(d+=(d.length?"&":"?")+"video_id="+a.VideoID),requestUtils.request(options.getPlayerParamUrl,d,null,[{header:"Content-Type",value:"application/json;charset=utf-8"}],null,!0,function(a){b(settingsUtils.checkParams(a))},c),void 0}return"undefined"!=typeof a.settingsUrl?(requestUtils.request(a.settingsUrl,"","*/*",[{header:"Content-Type",value:"application/json;charset=utf-8"}],null,!0,function(c){b(settingsUtils.checkParams(c,a))},c),void 0):(setTimeout(function(){b(settingsUtils.checkParams(clone(a)))},0),void 0)}},getLocalResource=function(a,b){var c=options.localization[b];return void 0==typeof c&&(c=options.localization.en),c[a]},MyviPlayer=function(a,b){var c=this,d=splayer.playerFeatures.autoplay,e=void 0,f=void 0,i=!1,j=!1,k=!1,l=1,m=!0,n=!1,o=function(){f.setSize("100%","100%"),"function"==typeof c.oninit&&c.oninit()},p=function(){utils.addClass(f.getIframe(),"play"),f.setSize("100%","100%")},q=function(){utils.removeClass(f.getIframe(),"play"),f.setSize("1px","1px")},r=function(a){switch(isPlaying=!1,a.data){case window.Myvi.PlayerState.BUFFERING:case window.Myvi.PlayerState.PLAYING:isPlaying=!0,m=!1,utils.addClass(f.getIframe(),"play"),k?"function"==typeof c.onresume&&c.onresume():(n||(n=!0,"function"==typeof c.onload&&c.onload()),"function"==typeof c.onplay&&c.onplay());break;case window.Myvi.PlayerState.ENDED:k=!1,m=!0,n=!1,"function"==typeof c.onended&&c.onended();break;case window.Myvi.PlayerState.PAUSED:k=!0,m=!1,"function"==typeof c.onpause&&c.onpause()}},s=function(){},t=function(){},u=function(){};this.lock=function(){i=!0,q(),f.pauseVideo()},this.unlock=function(){i=!1,m||(p(),j&&d&&f.playVideo())},this.init=function(){for(var c="player",d=1;null!=document.getElementById(c+"-"+ ++d););if(c+="-"+d,e=utils.createElement("div",{id:c},b),readyMyvi)f=new window.Myvi.Player({id:c,videoId:a.id,width:"1px",height:"1px",listeners:{onReady:o,onStateChange:r,onVolumeChange:t,onTimeChange:s,onError:u}});else{requestedMyvi||(tag=document.createElement("script"),tag.src="//myvi.ru/playertest/content/scripts/iframe_api.min.js?v="+Math.floor(new Date/864e5),document.getElementsByTagName("head")[0].appendChild(tag));var g=window.SP.myviReady;window.SP.myviReady=function(){g&&g(),f=new window.Myvi.Player({id:c,videoId:a.id,width:"1px",height:"1px",listeners:{onReady:o,onStateChange:r,onVolumeChange:t,onTimeChange:s,onError:u}})}}},this.play=function(){i||(j=!0,m=!1,n||(n=!0,"function"==typeof c.onload&&c.onload()),i||(p(),f&&d&&f.playVideo()))},this.pause=function(){i||f&&f.pauseVideo()},this.getVolume=function(){return f?f.getVolume():l},this.setVolume=function(a){a>100&&(a=100),0>a&&(a=0),l=a,f&&f.setVolume(a)},this.hide=function(){q()},this.remove=function(){f&&f.destroy(),e.parentNode.removeChild(e)}},VideoPlayer=function(a,b){var c=this,d=!1,e=0,f=!1,g=!1,h=void 0,i=1,j=!1,k=!1,l=!1,m=!1,n=!1,o=function(){d||(console.log("VideoPlayer.onPlay",b.seeking),b.seeking||(k&&!l?(k=!1,h&&(b._currentTime=h,h=void 0),g?n||(n=!0,"function"==typeof c.onplay&&c.onplay()):b.pause()):j?"function"==typeof c.onresume&&c.onresume():(n=!0,"function"==typeof c.onplay&&c.onplay()),l=!1))},p=function(){},q=function(){d||(g=!1,j=!1,k=!1,l=!0,"function"==typeof c.onended&&c.onended())},r=function(){d||(console.log("VideoPlayer.onPause",b.seeking),b.seeking||(g=!1,j=!0,"function"==typeof c.onpause&&c.onpause()))},s=function(){d||m||!b.error||"function"==typeof c.onerror&&c.onerror()},t=function(){i=b.volume,"function"==typeof c.onvolumechange&&c.onvolumechange()};this.lock=function(){d=!0,k=!1,b&&(h=b._currentTime,m=!0,b.autoplay=!1,b.pause(),b.removeAttribute("controls"),b.poster="",b.src="",b.removeAttribute("src"))},this.unlock=function(){d=!1,f&&(k=!0,l||(b.src=a.video[e].url,m=!1,utils.removeClass(b,"nodisplay"),b.load(),b.play()),b.controls=!0)},this.init=function(){"function"==typeof c.oninit&&c.oninit()},this.play=function(){d||(g=!0,utils.removeClass(b,"nodisplay"),f?(m&&(b.poster=a.posterUrl,b.autoplay=!0,b.controls=!0,b.src=a.video[e].url,b.load()),l&&(l=!1,"function"==typeof c.onload&&c.onload()),d||b.play()):(f=!0,b.poster=a.posterUrl,b.autoplay=!0,b.controls=!0,b.src=a.video[e].url,b.volume=i,b.addEventListener("play",o),b.addEventListener("ended",q),b.addEventListener("pause",r),b.addEventListener("error",s),b.addEventListener("durationchange",p),b.addEventListener("volumechange",t),b.load(),"function"==typeof c.onload&&c.onload(),d||b.play()))},this.pause=function(){d||(g=!1,b.pause())},this.getVolume=function(){return 100*i},this.setVolume=function(a){0>a&&(a=0),a>100&&(a=100),volume=a/100,b&&(b.volume=a/100)},this.hide=function(){d||utils.addClass(b,"nodisplay")},this.remove=function(){b&&(b.removeEventListener("play",o),b.removeEventListener("ended",q),b.removeEventListener("pause",r),b.removeEventListener("error",s),b.removeEventListener("durationchange",p),b.removeEventListener("volumechange",t),f=!1,b.pause(),b.autoplay=!1,b.src="",b.removeAttribute("src"))}},YoutubePlayerManager=function(a){var b=splayer.playerFeatures.autoplay,c=this,d=!1,e=!1,f=void 0,g="1px",h="1px";this.onStateChange=void 0,this.onError=void 0;var i=function(){d=!0,f&&c.player.cueVideoById(f),e&&c.player.playVideo()},j=function(a){switch(a.target.getPlayerState()){case window.YT.PlayerState.BUFFERING:case window.YT.PlayerState.PLAYING:utils.addClass(c.player.getIframe(),"play");break;case window.YT.PlayerState.ENDED:utils.removeClass(c.player.getIframe(),"play")}a.data==window.YT.PlayerState.PLAYING&&(b=!0),"function"==typeof c.onStateChange&&c.onStateChange(a)},k=function(a){"function"==typeof c.onError&&c.onError(a)};this.player=void 0,this.show=function(){g="100%",h="100%",c.player&&c.player.setSize("100%","100%")},this.hide=function(){g="1px",h="1px",c.player&&c.player.setSize("1px","1px")},this.loadVideo=function(b){if(f=b,c.player)d&&c.player.cueVideoById(b);else{for(var e="player",l=1;null!=document.getElementById(e+"-"+ ++l););if(e+="-"+l,utils.createElement("div",{id:e},a),readyYoutube)c.player=new window.YT.Player(e,{width:g,height:h,playerVars:{autoplay:"0",controls:"1",rel:"0",egm:"1",showsearch:"0",showinfo:"0",wmode:"opaque"},events:{onReady:i,onStateChange:j,onError:k}});else{requestedYoutube||(tag=document.createElement("script"),tag.src="https://www.youtube.com/iframe_api",document.getElementsByTagName("head")[0].appendChild(tag));var m=window.SP.youtubeReady;window.SP.youtubeReady=function(){m&&m(),c.player=new window.YT.Player(e,{width:g,height:h,playerVars:{autoplay:"0",controls:"1",rel:"0",egm:"1",showsearch:"0",showinfo:"0",wmode:"opaque"},events:{onReady:i,onStateChange:j,onError:k}})}}}},this.play=function(){b?(e=!0,d&&c.player.playVideo()):(utils.addClass(c.player.getIframe(),"play"),"function"==typeof c.onNoAutoplay&&c.onNoAutoplay())},this.pause=function(){e=!1,d&&c.player.pauseVideo()},this.getVolume=function(){return c.player.getVolume()},this.setVolume=function(a){c.player.setVolume(a)}},YTPlayer=function(a,b){var c=this,d=!1,e=!1,f=!1,i=!1,j=!1,k=function(){e=!1,j=!1},l=function(a){if(!d)switch(e=!1,a.target.getPlayerState()){case window.YT.PlayerState.BUFFERING:case window.YT.PlayerState.PLAYING:e=!0,j=!1,f?"function"==typeof c.onresume&&c.onresume():(i||(i=!0,"function"==typeof c.onload&&c.onload()),"function"==typeof c.onplay&&c.onplay());break;case window.YT.PlayerState.ENDED:f=!1,i=!1,j=!0,"function"==typeof c.onended&&c.onended();break;case window.YT.PlayerState.PAUSED:f=!0,"function"==typeof c.onpause&&c.onpause()}},m=function(){"function"==typeof c.onerror&&c.onerror()};this.init=function(){b.onNoAutoplay=k,b.onStateChange=l,b.onError=m,b.loadVideo(a.id),b.show(),"function"==typeof c.oninit&&c.oninit()},this.play=function(){d||(b.show(),i||(i=!0,"function"==typeof c.onload&&c.onload(),e=!0,d||b.play()))},this.pause=function(){d||b.pause()},this.getVolume=function(){return b.getVolume()},this.setVolume=function(a){b.setVolume(a)},this.lock=function(){d=!0,b.hide(),e&&b.player.pauseVideo()},this.unlock=function(){d=!1,j||(b.show(),e&&b.play())},this.hide=function(){b.hide()},this.remove=function(){b.hide()}},Playlist=function(a,b){var c=this,d=void 0,e=function(a,e,f){b?b.uiLanguage||"en":"en";var i,j,h=utils.createElement("div",{"class":"video-item"+(f==b.playlistIndex-1?" "+options.playlistOptions.currentVideoClass:"")+(0==f%4?" first":"")},a);if("unknown"==e.type){var k=utils.createElement("div",{"class":"img"},h);k.style.backgroundImage="url("+options.playlistOptions.videoNotFoundPosterUrl+")",i=utils.createElement("span",{"class":"num"},h),i.innerHTML=f+1,j=utils.createElement("span",{"class":"title-video"},h),j.innerHTML=getLocalResource("video_not_found",b.uiLanguage)}else{var k=utils.createElement("div",{"class":"img"},h);k.style.backgroundImage="url("+e.thumbnailUrl+")",i=utils.createElement("span",{"class":"num"},h),i.innerHTML=f+1,null!=e.title&&e.title.length&&(j=utils.createElement("span",{"class":"title-video"},h),j.innerHTML=e.title);var l=utils.createElement("div",{"class":"replay-over"},h);utils.createElement("span",{"class":"icon"},l),h.addEventListener("click",function(){c.onChangeVideo&&"[object Function]"==Object.prototype.toString.apply(c.onChangeVideo)&&c.onChangeVideo(f),utils.removeClass(d.getElementsByClassName(options.playlistOptions.currentVideoClass)[0],options.playlistOptions.currentVideoClass),utils.addClass(this,options.playlistOptions.currentVideoClass)})}},f=function(a,c){c=c||parseInt((a-1)/8+1);var f=8*(c-1),g=d.getElementsByClassName("page-"+c)[0];if(!g.getElementsByTagName("*").length)for(var h=f;f+8>h&&h<=b.playlist.length-1;++h){var i=b.playlist[h];e(g,i,h)}},g=function(){var e=utils.createElement("div",{"class":"playlist-overlay"},a);d=e;var f=utils.createElement("div",{"class":"playlist"},e),g=utils.createElement("a",{"class":"left arrow",href:"javascript:void(0)"},f);g.addEventListener("click",function(){h("left")});for(var i=parseInt(b.playlistIndex/8+1),j=1;j<b.playlist.length/8+1;j++)utils.createElement("div",{"class":options.playlistOptions.playlistContentClass+" page-"+j+(j==i?" "+options.playlistOptions.currentPlaylistContentClass:" "+options.playlistOptions.nodisplayPlaylistContentClass)},f);var k=utils.createElement("a",{"class":"right arrow",href:"javascript:void(0)"},f);k.addEventListener("click",function(){h("right")});var l=utils.createElement("a",{href:"javascript:void(0)","class":"replay-btn"},e);l.innerHTML+=getLocalResource("repeat_button",b.uiLanguage),l.addEventListener("click",function(){c.onChangeVideo&&"[object Function]"==Object.prototype.toString.apply(c.onChangeVideo)&&c.onChangeVideo(index)})},h=function(a){for(var b=-1,c=-1,e=d.getElementsByClassName(options.playlistOptions.playlistContentClass),g=e.length,h=0;h<e.length;h++)if(utils.hasClass(e[h],options.playlistOptions.currentPlaylistContentClass)){c=h,b=h-1,g=h+1;break}utils.hide(e[c]),utils.removeClass(e[c],options.playlistOptions.currentPlaylistContentClass),utils.addClass(e[c],options.playlistOptions.nodisplayPlaylistContentClass);var i;switch(a){case"left":0>b&&(b=e.length-1),i=b;break;default:g>e.length-1&&(g=0),i=g}utils.addClass(e[i],options.playlistOptions.currentPlaylistContentClass),utils.removeClass(e[i],options.playlistOptions.nodisplayPlaylistContentClass),utils.show(e[i]),e[i].getElementsByTagName("*").length||f(null,i+1)},i=function(a,b){var c=!1;if(a.video.length==b.video.length){c=!0;for(var d=0;d<a.video.length;d++)c=c&&a.video[d].url==b.video[d].url}return c||a.link&&a.link==b.link||a.videoId&&a.videoId==b.videoId},j=function(a){k=!0;try{for(var d=-1,e=0;e<a.length;e++)settingsUtils.getVideoData(a[e]),i(b.playlist[b.playlistIndex-1],a[e])&&(d=e);if(-1!=d)b.playlist=a,b.playlistIndex=d+1;else for(var e=0;e<a.length;e++)b.push(a[e])}catch(f){}c.show()},k=!0;this.available=b.playlist.length>1,this.show=function(e){k?(d||g(),d.setAttribute("style","font-size:"+a.clientHeight*(12/365)+"px"),a.clientWidth/a.clientHeight<1.5?utils.addClass(d,"square"):utils.removeClass(d,"square"),e?utils.addClass(d,"after-play"):utils.removeClass(d,"after-play"),utils.show(d),f(b.playlistIndex)):requestUtils.request(b.playlistUrl,"","*/*",[{header:"Content-Type",value:"application/json;charset=utf-8"}],null,!0,j,function(){k=!0,c.show()})},this.hide=function(){utils.hide(d)}},readyYoutube=!1,readyMyvi=!1,requestedYoutube=!1,requestedMyvi=!1;window.YT&&(youtubeReady=!0),window.Myvi&&(myviReady=!0),window.SP={ready:!0,myviReady:function(){readyMyvi=!0},youtubeReady:function(){readyYoutube=!0},Player:function(a,b,c){var d=this,e=void 0,f={},g=-1,h=void 0,i=void 0,j=void 0,k=void 0,l=void 0,m=!1,n=document.getElementById(a),o=1,p=void 0,q=b.Width||b.width,r=b.Height||b.height;q&&(q.toString().match(/(?:%|in|cm|mm|em|ex|pt|pc|px)$/)||(q+="px"),n.style.width=q),r&&(r.toString().match(/(?:%|in|cm|mm|em|ex|pt|pc|px)$/)||(r+="px"),n.style.height=r),utils.addClass(n,"splayer");var s={playBtn:void 0,preview:void 0,iframeContainer:void 0,errorContainer:void 0};s.preview=utils.createElement("div",{"class":"preview nodisplay"},n),s.playBtn=utils.createElement("a",{"class":"play-button nodisplay",href:"javascript:void(0)"},n),s.iframeContainer=utils.createElement("div",{"class":"iframe-container"},n),e=utils.createElement("video",{width:n.style.width,height:n.style.height},n),utils.addClass(e,"nodisplay");var t={onError:[],onPlayerLoaded:[],onPlayerSkipped:[],onPlayerVideoComplete:[],onPlayerStopped:[],onPlayerStarted:[],onPlayerPaused:[],onPlayerPlaying:[],onPlayerRemainingTimeChange:[],onPlayerVolumeChange:[],onPlayerVideoStart:[],onBeforeCurrentVideoChange:[],onCurrentVideoChange:[],onLockPlayer:[],onUnlockPlayer:[]},u=function(a,b){var c=!0;if(t[a])for(var d=0;d<t[a].length;d++){var e=callFunction(t[a][d],window,b);c=c&&e!==!1}return c},v=new YoutubePlayerManager(s.iframeContainer),w=void 0,x=function(a,c){if(u("onError",{code:a})){var d=b?b.uiLanguage||"en":"en";if(s.errorContainer)for(;s.errorContainer.childNodes.length;)s.errorContainer.removeChild(s.errorContainer.childNodes[0]);else s.errorContainer=utils.createElement("div",{"class":"error unspecified-error"},n);var e=utils.createElement("div",{"class":"error-container"},s.errorContainer),f=utils.createElement("div",{"class":"error-img"},e),g=utils.createElement("span",{},f);g.textContent="!";var h=utils.createElement("span",{"class":"error-text"},e);if(h.textContent=getLocalResource("player",d)[errorMessages[a]],e.style.marginTop="-"+e.offsetHeight/2+"px",c){var i=utils.createElement("div",{"class":"show-playlist-container"},erroContainer),j=utils.createElement("a",{href:"javascript:void(0)","class":"show-playlist-btn"},i);j.innerHtml+=getLocalResource("show_playlist",d),j.addEventListener("click",function(){utils.removeElement(s.errorContainer),utils.show([s.preview]),w.show(!0)})}}},y=function(a){s.preview.style.backgroundImage="url("+a+")",utils.show(s.preview)},z=function(a){switch(a.type){case playerTypes.myvi:return new MyviPlayer(a,s.iframeContainer);case playerTypes.youtube:return new YTPlayer(a,v);default:return new VideoPlayer(a,e)}},A=function(a){m=!1,k&&(k.remove(),k=void 0),j?k=z(j):x(0),k.oninit=a?E:F,k.onload=J,k.onplay=I,k.onended=L,k.onpause=G,k.onerror=M,k.onresume=H,k.init()},B=function(){if(!i)switch(b.behavior.beforePlay){case behavior.beforePlay.playlist:w.available?w.show(!0):(y(j.posterUrl),utils.show([s.playBtn]));break;default:y(j.posterUrl),utils.show(s.playBtn)}},C=function(){if(j.getVideoFunction){l=function(){utils.hide([s.playBtn,s.preview]),w.hide(),k.play()};var a=j.getVideoFunction;j.getVideoFunction=void 0,callFunction(a,window,j.video)}else utils.hide([s.playBtn,s.preview]),w.hide(),k.play()},D=function(){k&&k.pause()};s.playBtn.addEventListener("click",C),s.preview.addEventListener("click",C);var E=function(){g=5,m=!0,u("onPlayerLoaded"),i?h=C:C()},F=function(){g=5,m=!0,u("onPlayerLoaded"),B()},G=function(){g=2,u("onPlayerPaused")},H=function(){g=1,u("onPlayerPlaying")},I=function(){g=1,u("onPlayerVideoStart")},J=function(){g=1,u("onPlayerStarted")},K=function(){if(!i)switch(k.hide(),b.behavior.afterPlay){case behavior.afterPlay.black:utils.show([s.playBtn]);break;case behavior.afterPlay.nextvideo:if(b.playlistIndex++,b.playlistIndex>b.playlist.length){if("playlist"!=b.behavior.loopMode){b.playlistIndex=b.playlist.length,w.available?w.show():(y(j.secondPosterUrl),utils.show([s.playBtn]));break}b.playlistIndex=1}j=b.playlist[b.playlistIndex-1],u("onCurrentVideoChange"),A(!0);break;case behavior.afterPlay.picture:y(j.secondPosterUrl),utils.show([s.playBtn]);break;case behavior.afterPlay.playlist:w.available?w.show():(y(j.secondPosterUrl),utils.show([s.playBtn]));break;case behavior.afterPlay.repeat:C()}},L=function(){g=0,u("onPlayerVideoComplete"),u("onPlayerStopped"),i?h=K:K()},M=function(){k&&(k.remove(),k=void 0),x(0)},N=[],O=function(){i=!0,utils.hide([s.playBtn,s.preview]),k&&k.lock(),utils.removeClass(e,"nodisplay"),u("onLockPlayer")},P=function(){switch(i=!1,utils.addClass(e,"nodisplay"),g){case-1:case 5:B();break;case 0:switch(b.behavior.afterPlay){case behavior.afterPlay.black:utils.show([s.playBtn]);break;case behavior.afterPlay.playlist:w.available?w.show():utils.show([s.playBtn,s.preview]);break;case behavior.afterPlay.picture:utils.show([s.playBtn,s.preview]);break;case behavior.afterPlay.nextvideo:case behavior.afterPlay.repeat:}break;case 1:case 2:case 3:}if(k&&k.unlock(),u("onUnlockPlayer"),!i&&h&&"function"==typeof h){var a=h;h=void 0,a()}},Q=function(a){j==b.playlist[a]?C():u("onBeforeCurrentVideoChange",a)&&(b.playlistIndex=a+1,j=b.playlist[a],u("onCurrentVideoChange",a),i?h=function(){A(!0)}:A(!0))};this.features=splayer.playerFeatures,this.registerPlugin=function(a,c,e){var g={};if(b.plugins)for(var h=0;h<b.plugins.length;h++)b.plugins[h].name==a&&extend(g,b.plugins[h].settings);
if(extend(g,e),f[a])throw new SprutoError("plugin already registered");f[a]={container:utils.createElement("div",{"class":a.replace(/[^A-z0-9_\-]/gi,"")+" plugin"},n),settings:g,plugin:c},f[a].container.style.position="absolute",c(d,f[a].container,g)},this.addEventListener=function(a,b){t[a]&&t[a].push(b)},this.removeEventListener=function(a,b){if(t[a]){var c=t[a].indexOf(b);-1!=c&&t[a].splice(c,1)}},this.setVideoUrls=function(a,b){if(l){j.getVideoFunction=void 0,j.video=b;for(var c=0;c<j.video.length;c++){var d=j.video[c];d["default"]&&(j.default_url=d),d.type=settingsUtils.detectVideoType(d.url)}j.default_url||(j.default_url=j.video[0]),l(),l=null}},this.getPlaylist=function(){return clone(b.playlist)},this.getCurrentVideoIndex=function(){return b.playlistIndex-1},this.isLocked=function(){return i},this.getVideoSlot=function(){return e},this.lock=function(a,b,c){N.push({callback:b,object:a,context:c}),1==N.length&&(O(),1==N.length&&b&&N[0].callback.apply(c))},this.unlock=function(a){for(var b=0;b<N.length&&N[b].object!=a;b++);b>=N.length?console.warn("Invalid releaseVideoSlot call"):0==b?(N.shift(),N.length?N[0].callback&&N[0].callback.apply(N[0].context):P()):N.splice(b,1)},this.playVideo=function(){i||m&&C()},this.pauseVideo=function(){i||m&&D()},this.stopVideo=function(){i},this.getVolume=function(){return k?k.getVolume():o},this.setVolume=function(a){0>a&&(a=0),a>100&&(a=100),o=a,k&&k.setVolume(a)},this.getAutoplay=function(){return b.behavior.autoplay},this.getCurrentTime=function(){},this.getDuration=function(){},settingsUtils.getParams(b,function(a){b=a,w=new Playlist(n,b),w.onChangeVideo=Q,j=b.playlist[b.playlistIndex-1];try{c&&callFunction(c,d)}catch(e){}try{b.onPlayerReady&&callFunction(b.onPlayerReady,window)}catch(e){}p=b.behavior.autoplay,A(b.behavior.autoplay)},function(){try{c&&callFunction(c,d)}catch(a){}try{b.onPlayerReady&&callFunction(b.onPlayerReady,window)}catch(a){}x(0)})}},window.onMyviIframeAPIReady=function(){SP.myviReady()},window.onYouTubeIframeAPIReady=function(){SP.youtubeReady()},splayer.SPReady()}}();