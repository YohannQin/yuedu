function pictureHtml(config) {

	let {
		image_list = [],
		image_count = 0,
		title = '',
	} = config;

	return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>动态生成列表 + 原生比例</title>
    <!-- 引入 Viewer CSS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.css">
    
    <style>
        body { margin: 0; padding: 10px; background: #f5f5f5; font-family: sans-serif; }
        
        /* --- 1. 列表容器 --- */
        .gallery-container {
            display: flex;
            flex-direction: column; /* 竖向排列 */
            gap: 15px;              /* 图片间距 */
            //max-width: 600px;       /* 限制最大宽度 */
            margin: 0 auto;         /* 居中 */
            padding-bottom: 10vh;   /* 底部留白，方便测试滚动到底部 */
        }

        /* --- 2. 图片样式 (关键点) --- */
        .gallery-item img {
            width: 100%;            /* 宽度填满容器 */
            height: auto;           /* 【关键】高度自动，保持原始比例 */
            min-height: 200px;
            display: block;         /* 消除图片底部的默认缝隙 */
            border-radius: 8px;     /* 圆角 */
            box-shadow: 0 4px 10px rgba(0,0,0,0.1); /* 阴影增加质感 */
            cursor: zoom-in;        /* 鼠标变成放大镜图标 */
            transition: transform 0.2s;
        }
        
        /* 点击时的轻微缩放效果 */
        .gallery-item img:active {
            transform: scale(0.98);
        }

        /* --- 3. 悬浮页码 --- */
        .page-indicator {
            position: fixed;
            bottom: 30px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            pointer-events: none; /* 让点击穿透 */
            backdrop-filter: blur(4px);
        }
    </style>
</head>
<body>

    <h3>${title}</h3>

    <!-- 1. 空容器，等待 JS 填充 -->
    <div class="gallery-container" id="gallery"></div>

    <!-- 2. 悬浮页码 -->
    <div class="page-indicator">
        <span id="currentNum">1</span> / <span id="totalNum">0</span>
    </div>

    <!-- 3. 引入 Viewer JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.js"></script>

    <script>
        // --- A. 定义数据源 (模拟后台返回的数据) ---
        var image_list = ${JSON.stringify(image_list)};
		var image_total = ${image_count};

        const gallery = document.getElementById('gallery');
        const currentNumEl = document.getElementById('currentNum');
        const totalNumEl = document.getElementById('totalNum');

        // --- B. 动态生成 HTML 结构 ---
        function renderGallery() {
            let html = '';
            image_list.forEach((imgData, index) => {
                // 拼接 HTML 字符串
                // 注意：这里直接用了 img 标签，Viewer.js 会自动识别
                html += \`
                    <div class="gallery-item">
                        <img src="\${imgData}" alt="Image \${index + 1}">
                    </div>
                \`;
            });
            
            // 一次性插入到容器中
            gallery.innerHTML = html;

            // 更新总数显示
            totalNumEl.innerText = image_list.length;
        }

        // 执行渲染
        renderGallery();

        // --- C. 初始化 Viewer (全屏查看功能) ---
        // 注意：因为 DOM 是动态生成的，所以必须在 renderGallery() 之后初始化
        const viewer = new Viewer(gallery, {
            toggleDraggableRate: 0.1,
            navbar: false,
            title: false,
            toolbar: true,
            // 当打开查看器时，同步一下页码（可选）
            show: function(event) {
                currentNumEl.innerText = event.detail.index + 1;
            }
        });

        // --- D. 监听列表滚动 (IntersectionObserver) ---
        const images = gallery.querySelectorAll('img');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                var rect = entry.boundingClientRect;
                java.log(rect.height)
                if (entry.isIntersecting && rect.height > 200) {
                    // 计算当前图片是第几张
                    const index = Array.from(images).indexOf(entry.target);
                    currentNumEl.innerText = index + 1;
                }
            });
        }, { threshold: 0.8 }); // 50% 可见时触发

        // 开始观察所有动态生成的图片
        images.forEach(img => {
            imageObserver.observe(img);
        });

    </script>
</body>
</html>`
}

function getStringList(x, r) {
    return r == undefined ? Array.from(this.java.getStringList(x)) : Array.from(this.java.getStringList(x,r));
}
