art.layers.add({
            name: 'forward',
            html: `<img style="width: 60px" src="https://cdn-icons-png.magnific.com/512/17875/17875552.png?fd=1&filename=forward_17875552.png">`,
            style: {
                position: 'absolute',
                top: '40%',
                right: '10%',
                opacity: '.9',
				transform: 'translateY(-50%)',
            },
            click: function (...args) {
                console.info('click', args);
                //art.layers.show = false;
				art.forward = 10;
            },
            mounted: function (...args) {
                console.info('mounted', args);
            },
});

art.layers.add({
            name: 'backward',
            html: `<img style="width: 60px" src="https://cdn-icons-png.magnific.com/512/17875/17875213.png?fd=1&filename=back_17875213.png">`,
            style: {
                position: 'absolute',
                top: '60%',
                right: '10%',
                opacity: '.9',
				transform: 'translateY(-50%)',
            },
            click: function (...args) {
                console.info('click', args);
                //art.layers.show = false;
				art.backward = 10;
            },
            mounted: function (...args) {
                console.info('mounted', args);
            },
});

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



Artplayer.PLAYBACK_RATE = [0.5, 1, 1.25, 1.5, 2, 3, 5];

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
        name: `playback-rate-${item}`,
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


function switch_server_line(art, name, data)
{
	art.switchUrl(data.videos[0].url)
	art.quality = quality_array_create(name, data.videos)
	info('线路切换至：', name, data.videos[0].url)
	art.current_server = name
}


function server_line_init(art) {
	
	if (Object.keys(server_data).length == 0)
		return

	art.controls.add({
		name: 'server-line',
		position: 'right',
		html: '线路',
		tooltip: '',
		selector: Object.entries(server_data).map(([key, value], index) => {
			return {
				value: key,
				index:index
				default: index === 0,
				html: key,
			}
		}),
		onSelect(item) {
			switch_server_line(art, item.value, server_data[item.value])
			art.current_index = item.index;
			return item.html
		},
		mounted: () => {
			art.on('video:ratechange', () => {})
		},
	});	
	
	art.current_index = 0;
	
	art.on('error', (error, reconnectTime) => {
		error('播放失败', art.current_server, error, reconnectTime);
		
		let entries = Object.entries(server_data)
		
		art.current_index += 1
		if (art.current_index >= entries.length)
			return;
		entries = entries[art.current_index]
		switch_server_line(art, entries.key, entries.value)
	});
}

