/*
该函数适用于视频播放页面。
let config = {
	html: string					// 可选：当前网页html
	
	// video 相关
    title: string,      			// 必须：视频标题
	post_img: string				// 可选：视频封面
	video_url: string				// 必选：视频连接
	video_sniffer: boolean			// 可选：是否使用默认的视频嗅探，待实现

	// 标题下的辅助信息
	update_time: string				// 可选：更新时间
	duration: string				// 可选：视频时长
	views: string					// 可选：观看数
	likes: string					// 可选：喜欢数

	// 视频相关信息
    author: string					// 可选：作者名称
	author_href: string				// 可选：作者连接
    release_time: string			// 可选：发行时间
	actor_list: string/Array,   	// 可选：演员信息
	actor_href_ist: string/Array, 	// 可选：演员链接
	tag_list: string/Array,   		// 可选：tag 信息
	tag_href_ist: string/Array, 	// 可选：tag 链接

	// 简介信息
	description: string				// 可选：简介

	// 推荐页面
	related_flag: boolean			// 可选：推荐页面
	related_selector: string		// 可选：推荐页面选择器，示例 '.video-related@html'

    host?: string,              	// 可选：默认不填，用baseUrl解析相对路径链接，有误时手动填写
    
	other_html: string				// 可选：自定义html标签，插入到页面顶部，例如：`<h1 style="text-align:center;">${java.getString('h1@text')}</h1>`
	style: string					// 可选：自定义标签样式，插入到<style></style>里，或写在阅读预留位置
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
        post_img = '',
        video_url = '',
        
        update_time = '',
        duration = '',
        views = '',
        likes = '',
        
		release_time = '',
        author = '',
        author_href = '',
		actor_list = [],
		actor_href_list = [],
		tag_list = [],
		tag_href_list = [],

		description = '',

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
	//this.java.log(JSON.stringify(actor_list))
	//this.java.log(JSON.stringify(actor_href_list))
	
	const new_actor_list = toArrayIfString(actor_list)
	const new_actor_href_list= toArrayIfString(actor_href_list)
    
	const actors = createDictList(new_actor_list, new_actor_href_list);
    //this.java.log(actors.length)
    //this.java.log(JSON.stringify(actors))
    
	let tags = createDictList(toArrayIfString(tag_list), toArrayIfString(tag_href_list));
    //this.java.log(tags.length)
    
    let media_data = {
       
        update_time: update_time,
        views: views,
        likes: likes,

        release_time: release_time,
		author: author,
        author_href: author_href,
        actors: actors,
        tags: tags,
    }
    
    this.java.log(JSON.stringify(media_data))
    //this.java.log(Array.isArray(media_data.actors))
    //this.java.log(media_data.actors.length)
    
    let mdia_card_html = createMediaCardStr(media_data)
    //this.java.log(mdia_card_html)
    	


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

<script>globalThis.CUSTOM_USER_AGENT = 'iphone'</script>

<!-- jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/artplayer/dist/artplayer.js"></script>

<!-- unpkg -->
<script src="https://unpkg.com/artplayer/dist/artplayer.js"></script>

</head>

<style>
	body {
		background-image: url('https://q7.itc.cn/q_70/images03/20240119/f6c1f3416697497f91c0a39bcd172045.jpeg'); /* background-color:#EFF5FF;*/
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
    #app {
        padding-right: 5px;
        padding-left: 5px;
    }
    #app h4 {
        margin-top: 5px;
        margin-bottom: 5px;
    }
    .meta-row {
		font-size: 12px;       /* 字体变小 */
		color: #999;           /* 颜色变灰 */
		margin-bottom: 5px;    /* 与下方时间行的间距 */
		display: flex;         /* 使用 Flex 布局让内容对齐 */
		gap: 15px;             /* 时长和观看数之间的间距 */
    }
 
    ${style}


</style>

<body>

	<!-- 播放器 -->
	<div class="artplayer-container">
		<div class="artplayer-app" id="artplayer">
		</div>
	</div>


	<!-- 内容将通过 JS 插入到这里 -->
    <div id="app">
		<!-- 标题 -->
		<h4>${title}</h4> 
        ${mdia_card_html}

	</div>

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

function getStringList(x, r) {
    return r == undefined ? Array.from(this.java.getStringList(x)) : Array.from(this.java.getStringList(x,r));
}


/**
 * 根据名称数组和链接数组，创建一个对象数组
 * 如果某个索引位置没有对应的链接（数组为空或长度不足），则生成的对象只有 name 属性
 * @param {Array} names - 名称列表
 * @param {Array} hrefs - 链接列表（可选，默认为空数组）
 * @returns {Array} 对象数组，每个对象至少包含 name 属性，有链接时再包含 href 属性
 */
function createDictList(names, hrefs = []) {
    
    // 参数校验
    if (!Array.isArray(names)) return [];

    const result = [];
    for (var i = 0; i < names.length; i++) {
        var item = { name: names[i] };
        // 只有当 hrefs 存在且当前索引位置有有效值（非 undefined）时才添加 href
        if (Array.isArray(hrefs) && i < hrefs.length && hrefs[i] !== undefined) {
            item.href = hrefs[i];
        }
        result.push(item);
    }
    return result;
}

function toArrayIfString(data) {
    if (Array.isArray(data)) {
        return data;
    }
    if (typeof data === 'string') {
        return [data];
    }
    // 可选：根据实际需求决定非字符串/非数组时的行为，这里返回空数组
    return [];
}

/**
 * 简单的 HTML 转义函数，防止 XSS
 */
function escapeHtml(str) {
	if (!str) return '';
	return str;
	/*
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
		*/
}

/**
 * 生成媒体卡片的 HTML 字符串（完全不使用 document 对象）
 * @param {Object} data - 卡片数据
 * @returns {string} HTML 字符串
 */
function createMediaCardStr(data) {
	let html = '<div class="media-card">';

	// --- 1. 辅助信息部分 ---
	if (data.duration || data.update_time) {
		html += '<div class="meta-row">';
	
		// 显示时间
		if (data.update_time) {
			html += `<span>时间：${data.update_time}</span>`;
		}
	
		// 显示时长
		if (data.duration) {
			html += `<span>时长：${data.duration}</span>`;
		}
	
		// 显示观看数
		if (data.views) {
			html += `<span>观看：${data.views}</span>`;
		}
		// 显示喜欢数
		if (data.likes) {
			html += `<span>喜欢：${data.likes}</span>`;
		}
		
		html += '</div>';
	}
	
	// --- 2. 时间部分 ---
	if (data.release_time) {
		const escapedTime = escapeHtml(data.release_time);
		html += `
			<div class="info-row">
				<span class="label">发行：</span>
				${escapedTime}
			</div>
		`;
	}

	// --- 3. 作者部分 ---
	if (data.author) {
		html += `<div class="info-row"><span class="label">作者：</span>`;
		if (data.author_href) {
			html += `<a href="${data.author_href}" class="actor-link">${data.author}</a>`;
		} else {
			html += `<span>${data.author}</span>`;
		}
		html += `</div>`;
	}

	// --- 4. 演员部分 ---
	if (Array.isArray(data.actors) && data.actors.length > 0) {
		html += `<div class="info-row"><span class="label">演员：</span>`;
		
		data.actors.forEach((actor, index) => {
			const nameEscaped = escapeHtml(actor.name);
			if (actor.href) {
				const hrefEscaped = escapeHtml(actor.href);
				html += `<a href="${hrefEscaped}" class="actor-link">${nameEscaped}</a>`;
			} else {
				html += `<span>${nameEscaped}</span>`;
			}
			if (index < data.actors.length - 1) {
				html += ' / ';
			}
		});
		html += `</div>`;
	}

	// --- 5. 标签部分 ---
	if (Array.isArray(data.tags) && data.tags.length > 0) {
		html += `<div class="info-row"><span class="label">标签：</span>`;
		
		data.tags.forEach((tag, index) => {
			const nameEscaped = escapeHtml(tag.name);
			if (tag.href) {
				const hrefEscaped = escapeHtml(tag.href);
				html += `<a href="${hrefEscaped}" class="tag-link">${nameEscaped}</a>`;
			} else {
				html += `<span>${nameEscaped}</span>`;
			}
			if (index < data.tags.length - 1) {
				html += ' ';
			}
		});
		html += `</div>`;
	}

	// --- 6. 简介部分 ---
	if (data.description) {
		const descEscaped = escapeHtml(data.description);
		html += `
			<div class="description-box">
				<h4>简介</h4>
				<p class="description-text">${descEscaped}</p>
			</div>
		`;
	}

	html += `</div>`;
	return html;
}
