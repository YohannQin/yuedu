
// 在 <head> 中插入一个 style 标签（在 web.js 执行前运行）
function removeAds(elements_str) {
    var style = document.createElement('style');
    style.innerHTML = `
        	  ${elements_str} {
            display: none !important;
        }
    `;
	
	document.head.insertBefore(style, document.head.firstChild);
}

// 在head中增加script 文件
function addScriptFile(src) {
	const script = document.createElement('script');
	script.src = src;
	document.head.appendChild(script); // 直接插入 head
}

// 在head中增加script code
function addScriptCode(code) {
    const script = document.createElement('script');
    script.textContent = code;   // 或 script.innerText = code;
    document.head.appendChild(script);
}

// 在head中增加style code
function addStyleCode(cssString) {
	const style = document.createElement('style');
	style.textContent = cssString;
	document.head.appendChild(style);
}

// 在head中增加style 文件
function addStyleFile(cssString) {
	const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = source;
    document.head.appendChild(link);
}

// 在head中增加style，兼容文件和code
// 示例 addCSS('.box { color: red; }');        // 内联样式
// 示例 addCSS('https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.css', true);    // 外部文件
function addCSS(source, isExternal = false, options = {}) {
  if (isExternal) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = source;
    if (options.id) link.id = options.id;
    document.head.appendChild(link);
  } else {
    const style = document.createElement('style');
    if (options.id) style.id = options.id;
    style.textContent = source;
    document.head.appendChild(style);
  }
}


function artplayerResInit() {
	// 设置 artplayer的 user agent
	addScriptCode(`globalThis.CUSTOM_USER_AGENT = 'iphone'`);
	// 加载artplayer的 js插件
	loadScriptInHead('https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js');
	loadScriptInHead('https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js');
	
	addStyleCode(`
		/* artplayer-container 的占位元素 */
		.artplayer-placeholder {
			background: black;
			width: 100%;
			aspect-ratio: 16/9;
			position: sticky;
			top: 0;
		}
	  
		.artplayer-container {
			background: black;
			width: 100%;
			aspect-ratio: 16/9;
			position: fixed;
			top: 0;
			z-index: 500;
		}
	   .artplayer-app {
			background: black;
			width: 100%; /* 宽度自适应父容器 */
			margin: 0;
			padding: 0;
			height:100%;
		}
	`);
}

function artplayerElementInit() {
	
	// 创建顶部占位元素 artplayer-placeholder
	const placeholder = document.createElement('div');
	placeholder.className = 'artplayer-placeholder';
	
	// 创建 artplayer-container
	const wrapper = document.createElement('div');
	wrapper.className = 'artplayer-container';

	// 创建新子元素 artplayer-app
	const newChild = document.createElement('div');
	newChild.className = 'artplayer-app'
	//newChild.textContent = 'xxx';
	wrapper.append(newChild)

	// 将占位元素和artplayer添加至body后面
	document.body.prepend(placeholder);
	document.body.prepend(wrapper);	
}


function playM3u8(video, url, art) {
	java.log('m3u8')
	if (Hls.isSupported()) {
		java.log('hls m3u8')
		if (art.hls)
			art.hls.destroy()
	
		const hls = new Hls()
		hls.loadSource(url)
		hls.attachMedia(video)
		art.hls = hls
		art.on('destroy', () => hls.destroy())
	}
	else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = url
		java.log('other')
	}
	else {
		art.notice.show = 'Unsupported playback format: m3u8'
	}
}

var artplayer_option = {
	container: '.artplayer-app',
	url: '',
	poster: '',
	theme: '#87CEEB',
	autoplay: false,
	muted: false,
	fullscreen: true,
	autoSize: false,
	autoMini: false,
	autoHeight: true,
	playbackRate: true,
	setting: true,
	lock: true,
	gesture: true,
	fastForward: true,
	autoPlayback: true,
	autoOrientation: true,
	pip:false,
	miniProgressBar: true,
	type: 'm3u8',
	customType: {
		m3u8: playM3u8,	
	}
};


function artplayerInit(videoUrl, postImg) {
	artplayer_option.url = videoUrl;
	artplayer_option.poster = postImg;
	
	setTimeout(() => {
		java.log('art start')
		try {
			var art = new Artplayer(artplayer_option);
		} catch(err) {
			java.log(err.message)
		}
		java.log('art end')
	}, 500);

}

