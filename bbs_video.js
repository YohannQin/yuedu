
function removeAds() {
// 选择需要删除的标签  以,分隔
// 上下广告栏，上面广告标签，最新地址
// 页头，页脚，推荐栏，推荐行
// 评论框，分享点赞	.xqbj-header,article:has(.tjtagmanager),table       ads-title

items = document.querySelectorAll(`
	.horizontal-banner,
	#foot-menu, 
	.tjtagmanager,
	.content-tabs,
	.tags,
	.txt-apps,
	.content-copyright,
	.btn-download,
	.post-content:has(.ads-title),
	.post-near,
	.respond,
	blockquote,table
`)


// 隐藏选择的html
Array.from(items,(item)=>{
	item.style.display = `none`
});
}
/*
document.addEventListener('DOMContentLoaded', function() {
     // 初次加载时移除广告
    removeAds();
});
*/


var hidden_list = `horizontal-banner,
	#foot-menu, 
    #ai-navigation-container,
	.tjtagmanager,
	.content-tabs,
	.tags,
	.txt-apps,
	.content-copyright,
	.btn-download,
	.post-near,
	.respond,
    .flash,
    blockquote,
    table
    `;
    
// 在 <head> 中插入一个 style 标签（在 web.js 执行前运行）
    var style = document.createElement('style');
    style.innerHTML = `
        	  ${hidden_list}  {
            display: none !important;
        }
    `;
document.head.insertBefore(style, document.head.firstChild);


function loadScriptInHead(src) {
    const script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script); // 直接插入 head
}

function addGlobalStyle(cssString) {
  const style = document.createElement('style');
  style.textContent = cssString;
  document.head.appendChild(style);
}
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

function addInlineScriptToHead(code) {
    const script = document.createElement('script');
    script.textContent = code;   // 或 script.innerText = code;
    document.head.appendChild(script);
}

// 使用
//addCSS('.box { color: red; }');        // 内联样式
//addCSS('https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.css', true);    // 外部文件

// 使用
addGlobalStyle(`
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
        
.post h1 {
    font-size: 10px;
}
`);

addInlineScriptToHead(`
	globalThis.CUSTOM_USER_AGENT = 'iphone'
	`)

// 调用
loadScriptInHead('https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js');

loadScriptInHead('https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js');

java.log('aaaaaa')
window.java = java






java.log('dddd')

//const poster = document.querySelector('.post-content img');

//java.log(poster.getAttribute('z-image-loader-url'))
//java.log(poster.getAttribute('src'))
//var poster_img = poster.getAttribute('src')

const player = document.querySelector('.dplayer');
java.log('ddddaa')
if (player) {
    const wrapper = document.createElement('div');
    wrapper.className = 'artplayer-container'
    
    const placeholder = document.createElement('div');
    placeholder.className = 'artplayer-placeholder'
    
    
  // 创建新子元素
  const newChild = document.createElement('div');
  //newChild.textContent = '我是新增的最前面元素';
  newChild.className = 'artplayer-app'
  
  wrapper.append(newChild)

//wrapper.setAttribute('style', 'display: block; background: black !important; width: 100%; height: 300px');
  // 方法1：使用 prepend（推荐）
 // container.prepend(wrapper);
  document.body.prepend(placeholder);
  document.body.prepend(wrapper);

  // 方法2：使用 insertBefore（兼容旧浏览器）
  // container.insertBefore(newChild, container.firstChild);
}
java.log('aaa')
//java.log(document.documentElement.outerHTML)


const video_config_str = player.getAttribute('data-config')
java.log(video_config_str)

const video_config = JSON.parse(video_config_str)
java.log(video_config.video.url)


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
            

setTimeout(() => {
    java.log('art start')
    try {
        let poster_img = ''
        const poster = document.querySelector('.post-content img');
        if (poster) {
            poster_img = poster.getAttribute('src') || ''
        }
        

	var art = new Artplayer({
    container: '.artplayer-app',
    url: video_config.video.url,
    poster: poster_img,
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
});
} catch(err) {
	java.log(err.message)
	}

java.log('art end')
  
}, 500);

