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
