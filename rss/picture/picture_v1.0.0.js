function pictureHtml(config) {

	let {
		image_list = [],
		image_count = 0,
		title = '',
	} = config
	
	return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!-- 引入 Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <style>
        body { margin: 0; background: #000; }
        .swiper { width: 100%; height: auto; }
        
        /* 确保图片容器占满 Slide */
        .swiper-slide {
            display: flex;
            justify-content: center;
            align-items: center;
            background: #000;
        }

        /* 关键：缩放容器必须占满空间，且 overflow 通常设为 hidden 以防溢出 */
        .swiper-zoom-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .swiper-zoom-container img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
		
		
		/* 图片样式：保持比例 */
        img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            pointer-events: none;
            user-select: none;
            /* 图片加载时的渐显动画 */
            animation: fadeIn 0.3s ease-out;
        }
		
		/* 页码样式 */
        .swiper-pagination {
            position: absolute;
            bottom: 20px;
            width: 100%;
            text-align: center;
            color: #fff;
            z-index: 10;
            pointer-events: none;
        }
    </style>
</head>
<body>
	<h3>${title}</h3>

<div class="swiper">
    <div class="swiper-wrapper" id="swiper-wrapper">
      
	  
    </div>
    <!-- 分页器 -->
    <div class="swiper-pagination">
		<span id="page-indicator" class="page-num">
		</span>
	</div>
</div>

<!-- 引入 Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<script>
		var image_list = ${JSON.stringify(image_list)};
		var image_total = ${image_count};
		let isLoading = false; // 防止重复加载
		let page = 1; // 当前页码
		const pageSize = 5; // 每次加载 5 张

		
		if (!image_count)
			image_count = image_list.length;

		function image_data_convert(image_data) {
			let data = [];
			let startId = 1;
			for (let i = 0; i < image_data.length; i++) {
                const id = startId + i;
                data.push({
                    id: id,
                    url: image_data[i],
                });
			}
			return data;
		}
	
		// --- 2. 核心功能：追加图片 ---
        function appendImages(image_data) {
            const wrapper = document.getElementById('swiper-wrapper');
            const fragment = document.createDocumentFragment();

            image_data.forEach(img => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = ${`<img src="${img.url}" class="img" alt="Page ${img.id}">`};
                fragment.appendChild(slide);
            });

            wrapper.appendChild(fragment);
            
            // 关键：通知 Swiper 更新内部状态（重新计算高度和数量）
            swiper.update();
            
            updatePageIndicator();
        }
		
		// 更新页码显示
        function updatePageIndicator() {
            const total = document.querySelectorAll('.swiper-slide').length;
            const current = swiper.activeIndex + 1;
            document.getElementById('swiper-pagination').innerText = ${`${current} / ${total}`};
        }
	
		// --- 3. 初始化 Swiper ---
        const swiper = new Swiper('.swiper', {
            direction: 'vertical',
            slidesPerView: 1,
            freeMode: true,
            freeModeMomentum: true,
            freeModeMomentumRatio: 0.8,
            mousewheel: true,

            // 监听滑动事件，实现无限滚动
            on: {
                slideChange: function () {
                    updatePageIndicator();
                    
                    // 核心逻辑：当滑动到倒数第 2 张时，触发加载
                    // activeIndex 是当前激活的索引（从0开始）
                    // slides.length 是当前总幻灯片数量
                    const totalSlides = this.slides.length;
                    const currentIndex = this.activeIndex;

                    // 如果接近底部（还剩 2 张没看），且没有正在加载
                    if (currentIndex >= totalSlides - 2 && !isLoading) {
                        //loadMoreData();
                    }
                }
            }
        });
		
		// --- 4. 页面初始化 ---
        // 初始加载第一页
        //const initialData = generateMockData(1, pageSize);
        var imageList = image_data_convert(image_list);
        appendImages(initialData);
</script>

</body>
</html>`
}

