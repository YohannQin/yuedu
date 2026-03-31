/*
该函数适用于视频播放页面。
let config = {
	html: string				// 可选：当前网页html
	
    title: string,      		// 必须：视频标题
	actor: string,      		// 可选：演员信息
	post_img: string			// 可选：视频封面
	
	video_url: string			// 可选：视频连接
	video_sniffer: boolean		// 可选：是否使用默认的视频嗅探，待实现

    host?: string,              // 可选：默认不填，用baseUrl解析相对路径链接，有误时手动填写
    
	related_flag: boolean		// 可选：推荐页面
	related_selector: string	// 可选：推荐页面选择器，示例 '.video-related@html'
	
	other_html: string			// 可选：自定义html标签，插入到页面顶部，例如：`<h1 style="text-align:center;">${java.getString('h1@text')}</h1>`
	style: string				// 可选：自定义标签样式，插入到<style></style>里，或写在阅读预留位置
}

阅读调用示例，主题在登录界面调
<js>
let config = {
    html: String(result),
    imageSelector: "figure img",
    nextPageSelector: '.pagelist>a:contains(下一页)'
}
videoHtml(config);
</js>

related_selector
 */

function videoHtml(config) {
    /* ---------- 参数校验 ---------- */
    if (Object.prototype.toString.call(config) !== '[object Object]') {
        throw new TypeError('< error: config 必须是对象 >');
    }

    let {
		html = '',
		title = '',
		actor = '',
        post_img = '',
        video_url = '',
		video_sniffer = false,
        host = String(this.baseUrl),
        related_flag = false,
		related_selector = '',
        other_html = '',
        style = '',
    } = config;

	if (html && typeof html !== 'string') {
        throw new TypeError(`< error: html 必须是 string 类型，当前值：${JSON.stringify(html)} >`);
    }

	/*
	let post_img = '';
	let related_flag = true;
	let title = getString('.title.0@text');

	const match = result.match(/"url":"(https:[^"]+\.m3u8)"/);
	if (match) {
		var video_url = match[1].replace(/\\\//g, '/');
	} else {
		var video_url = ""
	}
	*/
	
	if (video_sniffer) {
		const match = result.match(/"url":"(https:[^"]+\.m3u8)"/);
		if (match) {
			video_url = match[1].replace(/\\\//g, '/');
		}
	}
	
	let related_html ='';
	if (related_flag) {
		var related = getString(related_selector);
		related_html =
		`<h4 onclick="sjzt()" style="text-align: center;">▼推荐主题▼</h4>
		 <div class="related">
			${related}
		</div>`;
	}	

	return `<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no" />

<!-- jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/artplayer/dist/artplayer.js"></script>

</head>

<style>
	body {
		background-image: url('https://q1.itc.cn/q_70/images03/20250401/7f65e2bc7b5f4934a81ea0f9105c8ff9.jpeg'); /* background-color:#EFF5FF;*/
		margin:0;
		padding:0;
		width:100%;
	   }
	img {
		margin:0;
		padding:0;
		width:100%;
	}   
	   
	.artplayer-app {
		width: 100%; /* 宽度自适应父容器 */
		min-height: 35vh; /* 最小高度 */
		max-height: 80vh; /* 最大高度 */
		margin: 0 auto; /* 居中显示（可选） */
		position: relative; /* 相对定位，确保子元素定位正确 */
		aspect-ratio: 16/9;
	}

	/* 视频画面样式：保持比例，避免拉伸 */
	.video {
		object-fit: contain !important; /* 完整显示视频，无裁剪 */
		width: 100% !important;
		height: 100% !important;
	}
	.related {
		display: none;
	}
	.related.active {
		display: block;
	}
 
    ${style}


</style>

<body>

	<!-- 播放器 -->
	<div class="artplayer-container">
		<div class="artplayer-app" id="artplayer">
		</div>
	</div>

	<!-- 标题 -->
	<h4>${title}</h4> <br>

    ${other_html}

	<!-- 推荐主题页面 -->
	${related_html}
	<script>
	const posts=document.querySelector('.related');
	function related_toggle() {
		posts.classList.toggle('active');
	}
	</script>

<script>
	//alert('aaaa')
	//alert("${video_url}")

	window.local = true;

	let art = new Artplayer({
        container: '.artplayer-app',
        url: '${video_url}',
        poster: '${post_img}',
        theme: '#87CEEB',
        autoplay: true,
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
      });
      
      art.once('ready', () => {
          let times = art.storage.get('times');
          art.currentTime = times[art.option.url];
          const ratio = art.video.videoWidth / art.video.videoHeight;
          //alert(ratio);
          //art.aspect-ratio = ratio;
          //container.style.aspect-ratio = ratio;
          updateVideoSize();
         });
       
	function updateVideoSize() {
		const wrapper = document.querySelector('.artplayer-app');
		if (!wrapper || !art.video) return;

		const videoWidth = art.video.videoWidth || 1920;
		const videoHeight = art.video.videoHeight || 1080;
		const ratio = videoWidth / videoHeight;

		// 按容器宽度计算理想高度
		const idealHeight = wrapper.clientWidth / ratio;

		// 最小/最大高度（vh 转 px）
		const minHeight = window.innerHeight * 0.35;  // 35vh
		const maxHeight = window.innerHeight * 0.8;  // 80vh

		// 限制在范围内
		const finalHeight = Math.min(Math.max(idealHeight, minHeight), maxHeight);

		// 应用高度
		art.height = finalHeight;
		wrapper.style.height = finalHeight + 'px';
	}
      
</script>

</body>
</html>`

}

function getString(x, r) {
    return r == undefined ? String(this.java.getString(x)) : String(this.java.getString(x,r));
}
