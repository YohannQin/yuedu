/*
该函数适用于视频播放页面。
let config = {
	html: string					// 可选：当前网页html
	
	// video 相关
    title: string,      			// 必须：视频标题
	post_img: string				// 可选：视频封面
	video_url: string				// 必选：视频连接
	video_sniffer: boolean			// 可选：是否使用默认的视频嗅探，待实现
    use_hls: boolean               //是否使用hls插件
    hls_quality: boolean          //是否使用hls画质

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
        curr_href = '',
        
        use_hls = false,
        hls_quality = false,
        
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
        info_html = '',

		video_sniffer = false,
        host = String(this.baseUrl),
        related_flag = false,
		related_selector = '',
        other_html = '',
        style = '',
        
        log_level = 'debug'
        
    } = config;

	if (html && typeof html !== 'string') {
        throw new TypeError(`< error: html 必须是 string 类型，当前值：${JSON.stringify(html)} >`);
    }
    
    	if (video_url && (typeof video_url !== 'string' && typeof video_url !== 'object')) {
            java.log(typeof video_url)
        throw new TypeError(`< error: video 必须是 string/object 类型，当前值：${JSON.stringify(video_url)} >`);
    }
    
    var video_data = JSON.stringify({})
    if (typeof video_url === 'object') {
        video_data = JSON.stringify(video_url)
        video_url = ''
    }
    
	const new_actor_list = toArrayIfString(actor_list)
	const new_actor_href_list= toArrayIfString(actor_href_list)
    
	const actors = createDictList(new_actor_list, new_actor_href_list);
    trace.call(this, '演员', JSON.stringify(actors))
    
	let tags = createDictList(toArrayIfString(tag_list), toArrayIfString(tag_href_list));
    trace.call(this, '标签', JSON.stringify(actors))
    
    let media_data = {
       
        update_time: update_time,
        views: views,
        likes: likes,
        description: description,

        release_time: release_time,
		author: author,
        author_href: author_href,
        actors: actors,
        tags: tags,
    }
    
    trace.call(this, JSON.stringify(media_data))
    
    let mdia_card_html = createMediaCardStr(media_data)
    trace.call(this, mdia_card_html)
	
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

        <!-- unpkg
        <script src="https://unpkg.com/artplayer/dist/artplayer.js"></script>
        -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js"></script>

        <script src="https://artplayer.org/uncompiled/artplayer-plugin-hls-control/index.js"></script>

        <!-- 
        <link rel="stylesheet" href="https://jav.sb/videojs/video-js.css">
        <script src="https://jav.sb/videojs/video.min.js"></script>
         -->

    </head>

    <style>
        body {
            background-image: url('https://q7.itc.cn/q_70/images03/20240119/f6c1f3416697497f91c0a39bcd172045.jpeg'); /* background-color:#EFF5FF;*/
            margin:0;
            padding:0;
            width:100%;
            overscroll-behavior-y: none; /* 禁用底部橡皮筋效果 */
        }

        img {
            margin:0;
            padding:0;
            width:100%;
        }

        .artplayer-container {
            background: black;
            width: 100%; /* 宽度自适应父容器 */
            margin: 0;
            padding: 0;
            /*position: relative;  相对定位，确保子元素定位正确 */
            position: sticky;
            top: 0;
            z-index: 99;
            aspect-ratio: 4/3;
        }

        iframe {
            position: absolute;
            margin:0;
            padding:0;
            width:100%;
            height:100%;
            border: none;
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

        .description-box {
            padding-top: 20px;
        }

        ${style}
    </style>

    <body>

        <!-- 播放器 -->
        <div class="artplayer-container" id="artplayer">
            <div class="artplayer-app">
            </div>
        </div>
        <template>
            <iframe src="${video_url}" allowfullscreen>
            </iframe>
        </template>

        <!-- 内容将通过 JS 插入到这里 -->
        <div id="app">
            <!-- 标题 -->
            <h4>${title}</h4> 
            ${info_html}
            ${mdia_card_html}

            ${other_html}

            <!-- 推荐主题页面 -->
            ${related_html}
        </div>

        <script>
            const posts=document.querySelector('.related');
            function related_toggle() {
                posts.classList.toggle('active');
            }
        </script>
        
        <script>
        
const LEVELS = { trace: 0, debug: 1, info:  2, error: 3, off:   4 };

// 当前级别（默认为 'debug'，此时 trace 不输出）
var LOG_LEVEL = ${log_level};

// 工具函数：格式化参数（支持对象序列化，带容错）
function formatArgs(args) {
    return Array.from(args).map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
}

function trace(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.trace) return;
        java.log('[TRACE] ' + formatArgs(args));
}

function debug(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.debug) return;
        java.log('[DEBUG] ' + formatArgs(args));
 }

function info(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.info) return;
        java.log('[INFO] ' + formatArgs(args));
}

function error(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.error) return;
        java.log('[ERROR] ' + formatArgs(args));
    }
        </script>

        <script>
            //alert('aaaa')
            trace('player脚本开始执行')

            window.local = true;
            
            var temp_video_data = JSON.parse('${video_data}')
            if (Object.keys(temp_video_data).length != 0) {
                var video_data = temp_video_data
            } else {
                var video_data = "${video_url}"
            }
            
            var base_video_url = ''
            var quality = []
            var use_hls = ${use_hls}
            var hls_quality = ${hls_quality}

            const video_url_type = Object.prototype.toString.call(video_data);
            if (video_url_type === '[object String]') { 
                base_video_url = video_data;
            } else if (video_url_type === '[object Object]') {
                base_video_url = video_url_init(video_data);
                //quality = quality_option_init(video_data);
            }
            java.log(JSON.stringify(video_data))

            function quality_array_create(name, video_arr) {
                let result = []

                if (video_arr.length <= 1)
                    return result;
                java.log('dgggg')

                result = video_arr.map((item, index) => {
                    const newItem = {
                        html: item.name,
                        url: item.url
                    };
                    // 第一个元素添加 default: true
                    if (index === 0) {
                        newItem.default = true;
                    }
                    return newItem;
                });

                return result;
            }

            function quality_option_init(data) {
                let result = []
                if (Object.prototype.toString.call(data) !== '[object Object]') 
                    return result
                java.log('eeeee')

                if (Object.keys(data).length == 0)
                    return result
                java.log('fffff')

                const first = Object.keys(data)[0];
                return quality_array_create(first, data[first].videos)
            }

            function video_url_init(data) {
                let result = ''
                if (Object.keys(data).length == 0)
                    return result

                const first = Object.keys(data)[0];
                const videos = data[first].videos;
                if (videos.length >= 1)
                    result = videos[0].url;
                return result
            }

            function quality_update(art, name, data) {
                if (!Object.hasOwn(data, name))
                    return;

                art.quality = quality_array_create(name, data[name].videos)
            }

            function playM3u8(video, url, art) {
                trace('Hls paly m3u8')
                if (Hls.isSupported()) {
                    if (art.hls)
                        art.hls.destroy()
                    const hls = new Hls()
                    hls.loadSource(url)
                    hls.attachMedia(video)
                    art.hls = hls
                    art.hls.currentLevel = -1
                    art.on('destroy', () => hls.destroy())
                }
                else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url
                    error('Hls video分支播放')
                }
                else {
                    art.notice.show = 'Unsupported playback format: m3u8'
                }
            }

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

            function art_custom_type() {
                let customType = {}

                if (use_hls)
                    customType.m3u8 = playM3u8

                return customType
            }

            function art_hls_plugin_init(art) {

                let hls_plug = artplayerPluginHlsControl({
                    quality: {
                        // Show qualitys in control
                        control: true,
                        // Show qualitys in setting
                        setting: false,
                        // Get the quality name from level
                        getName: level => \`\${level.height}P\`,
                        // I18n
                        title: 'Quality',
                        auto: 'Auto',
                    },
                });
                
                if (use_hls && hls_quality) {
                    art.plugins.add(hls_plug)
                    debug('hls plugin初始化完成')
                    }
            }

            function art_layers_init(art) {
                // 快进	
                art.layers.add({
                    name: 'forward',
                    html: '<img style="width: 40px" src="https://cdn-icons-png.magnific.com/512/17875/17875552.png?fd=1&filename=forward_17875552.png">',
                    style: {
                        position: 'absolute',
                        top: '60%',
                        right: '10px',
                        opacity: '.9',
                        transform: 'translateY(-50%)',
                    },
                    click: function (...args) {
                        console.info('click', args);
                        //art.layers.show = false;
                        art.forward = 10;
                        art.controls.show = true;
                    },
                    mounted: function (...args) {
                        console.info('mounted', args);
                    },
                });

                //快退
                art.layers.add({
                    name: 'backward',
                    html: '<img style="width: 40px" src="https://cdn-icons-png.magnific.com/512/17875/17875213.png?fd=1&filename=back_17875213.png">',
                    style: {
                        position: 'absolute',
                        top: '40%',
                        right: '10px',
                        opacity: '.9',
                        transform: 'translateY(-50%)',
                    },
                    click: function (...args) {
                        console.info('click', args);
                        //art.layers.show = false;
                        art.backward = 10;
                        art.controls.show = true;
                    },
                    mounted: function (...args) {
                        console.info('mounted', args);
                    },
                });

                // 快进和快退跟随控制栏显示
                art.on('control', (state) => {
                    console.log(state);
                    if (state) {
                        art.layers.forward.style.display = 'block';
                        art.layers.backward.style.display = 'block';

                    } else {
                        art.layers.forward.style.display = 'none';
                        art.layers.backward.style.display = 'none';

                    }
                });
            }

            // 控制栏 增加倍率显示
            function art_playrate_init(art) {

                Artplayer.PLAYBACK_RATE = [0.5, 1, 1.5, 2, 3, 5];

                function getI18n(value) {
                    return value === 1.0 ? art.i18n.get('Normal') : (value.toFixed(1) + 'X')
                }

                art.controls.add({
                    name: 'playback-rate',
                    position: 'right',
                    html: '倍率',
                    tooltip: '',
                    icon: art.icons.playbackRate,
                    selector: Artplayer.PLAYBACK_RATE.map((item) => {
                        return {
                            value: item,
                            name: \`playback-rate-\${item}\`,
                            default: item === art.playbackRate,
                            html: getI18n(item),
                        }
                    }),
                    onSelect(item) {
                        art.playbackRate = item.value
                        return item.html
                    },
                    mounted: () => {
                        art.on('video:ratechange', () => {})
                    },
                });	
            }

            function art_event_init(art) {
                art.on('ready', () => {
                    if  (use_hls)
                        trace('hls视频数', art.hls.levels.length)
                    // if (art.hls.levels.length == 0)
                    //     art.controls.remove('hls-quality')

                    let times = art.storage.get('times');
                    //java.log(art.option.id)
                    //java.log(times[art.option.id])
                    //java.log(art.currentTime)
                    art.currentTime = times[art.option.id || art.option.url];
                    //java.log(art.currentTime)
                    const ratio = art.video.videoWidth / art.video.videoHeight;
                    //alert(ratio);
                    //art.aspect-ratio = ratio;
                    //container.style.aspect-ratio = ratio;
                    //updateVideoSize();
                });
            }

            function artplayer_init(options) {
                debug('artplayer参数', JSON.stringify(options))
                var art = new Artplayer(options);
                art_event_init(art)
                art_layers_init(art)
                art_playrate_init(art)
                art_hls_plugin_init(art)
                debug('artplayer 初始化完成')

                return art;
            }

            var art_option = {
                container: '.artplayer-app',
                id: '${curr_href}',
                url: base_video_url,
                poster: '${post_img}',
                theme: '#87CEEB',
                autoplay: false,
                muted: false,
                fullscreen: true,
                autoSize: false,
                autoMini: false,
                autoHeight: true,
                //playbackRate: true,
                //setting: true,
                lock: true,
                gesture: true,
                fastForward: true,
                autoPlayback: true,
                autoOrientation: true,
                pip:false,
                miniProgressBar: true,
                //quality: quality,
            };
            
            art_option.customType = art_custom_type()
            art_option.quality = quality_option_init(video_data)

            artplayer_init(art_option)
            
            debug('artplayer脚本执行完成')
        </script>

        <script>
            function urljoin(base, end) {
                const url = new URL(end, base);
                return url.href;
            }

            function label_func(domainUrl, labelText, targetHref) {
                if (targetHref && targetHref.trim() !== "" && targetHref !== "#" && !targetHref.startsWith("javascript:")) {
                    //window.location.href = targetHref;
                    var baseurl = "https://xchina.fit";
                    var url = urljoin(domain_url, targetHref);
                    java.log('open: ' + labelText + ', ' + url)
                    java.open("sort", JSON.stringify({ [labelText]:url}));
                } else {
                    alert(labelText + "暂无有效链接，无法跳转。");
                }
            }

            var domain_url = new URL("${curr_href}").origin;
            const allLinks = document.querySelectorAll('#app a');

            allLinks.forEach(link => {
                // 保存原始 href，然后移除 href 属性
                let labelHref = link.getAttribute('href');
                let labelText = link.innerText.trim();

                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const href = labelHref;
                    const text = labelText;
                    label_func(domain_url, text, href || '');
                });
            });
            

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
	if (data.duration || data.update_time || data.views) {
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
	if (data.description && data.description.length() > 10) {
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

function addOrUpdateVideo(data, key, videoName, videoUrl) {
  // 如果该一级键不存在，则初始化一个包含 video 数组的对象
  if (!data[key]) {
    data[key] = { videos: [] };
  }
  // 向 video 数组中追加新视频
  data[key].videos.push({ name: videoName, url: videoUrl });
}

var debug_enable = true
function debug(...args) {
	if (!debug_enable)
		return
    // 将参数转为字符串并用空格连接
    const text = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(', ');
    
	this.java.log(text)
}

// 日志级别：数值越小，输出越多
const LEVELS = { trace: 0, debug: 1, info:  2, error: 3, off:   4 };

// 当前级别（默认为 'debug'，此时 trace 不输出）
var LOG_LEVEL = 'debug';

// 工具函数：格式化参数（支持对象序列化，带容错）
function formatArgs(args) {
    return Array.from(args).map(arg => {
        if (typeof arg === 'object' && arg !== null) {
            try {
                return JSON.stringify(arg);
            } catch (e) {
                return String(arg);
            }
        }
        return String(arg);
    }).join(' ');
}

function trace(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.trace) return;
        this.java.log('\n[TRACE] ' + formatArgs(args));
}

function debug(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.debug) return;
        this.java.log('\n[DEBUG] ' + formatArgs(args));
 }

function info(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.info) return;
        this.java.log('[INFO] ' + formatArgs(args));
}

function error(...args) {
        if (LEVELS[LOG_LEVEL] > LEVELS.error) return;
        this.java.log('[ERROR] ' + formatArgs(args));
    }

    // 动态修改日志级别
function  setLevel(level) {
        if (LEVELS.hasOwnProperty(level)) {
            LOG_LEVEL = level;
        } else {
            this.java.log('[WARN] 未知日志级别: ' + level);
        }
}

function getLevel() {
    return LOG_LEVEL
}
