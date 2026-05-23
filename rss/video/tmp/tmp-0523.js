function addOrUpdateVideo(data, key, videoName, videoUrl) {
  // 如果该一级键不存在，则初始化一个包含 video 数组的对象
  if (!data[key]) {
    data[key] = { video: [] };
  }
  // 向 video 数组中追加新视频
  data[key].video.push({ name: videoName, url: videoUrl });
}


/*
video_url 数据格式支持单视频链接和字典对象

字典对象格式
const data = {
  aa: {
    video: [
      { name: '视频1', url: 'https://example.com/1' },
      { name: '视频2', url: 'https://example.com/2' }
    ]
  },
  bb: {}
};
https://cdn-icons-png.magnific.com/512/2413/2413981.png

*/

var video_data = ${video_url}
var base_video_url = ''
var quality = []
var use_hls = false
var hls_quality = true


const video_url_type = Object.prototype.toString.call(video_data);
if (video_url_type === '[object String]') { 
	base_video_url = video_data;
} else if (video_url_type === '[object Object]') {
	base_video_url = video_url_init(video_data);
	quality = quality_option_init(video_data);
}


function quality_array_create(name, video_arr) {
	let result = []
	
	if (video_arr.length <= 1)
		return result;
	
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
	if (Object.keys(data).length == 0)
		return result
	
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
	if (Hls.isSupported()) {
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
	}
	else {
		art.notice.show = 'Unsupported playback format: m3u8'
	}
}

function art_custom_type() {
	let customType = {}

	if (use_hls)
		customType.m3u8 = playM3u8
	
	return customType
}

  
function hls_plugin_init(art) {
	
	let hls_plug = artplayerPluginHlsControl({
		quality: {
			// Show qualitys in control
			control: true,
			// Show qualitys in setting
			setting: false,
			// Get the quality name from level
			//getName: level => \`\${level.height}P\`,
			// I18n
			title: 'Quality',
			auto: 'Auto',
		},
	})
	if (use_hls && hls_quality)
		art.plugins.add(hls_plug)
}


function art_layers_init(art) {
	
	
}

function art_playrate_init(art) {
	
	
}

function artplayer_init(options) {
	var art = new Artplayer(options);
	
	
	art_layers_init(art)
	art_playrate_init(art)
	art_hls_plugin_init(art)
	
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
