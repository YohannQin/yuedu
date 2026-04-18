function pictureHtml(config) {

    let {
            image_list = [],
            image_count = 0,
            page_count = 1,
            title = '',
            base_url = '',
            second_page_url = '',
            image_handle_func = '',
            img_selector = '',
            page_next_selector = '',
    } = config;

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
            background: rgba(0, 0, 0, 0.3);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            pointer-events: none; /* 让点击穿透 */
            backdrop-filter: blur(4px);
        }
        
        .floating-panel {
            position: fixed;
            bottom: 30px;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            color: #fff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            display: flex;
            align-items: center;
            /*gap: 10px;*/
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        /* --- 左下角：分页控制器 --- */
        .page-navigator { left: 20px; }
        
        .page-input {
            margin: 0;
            padding: 0 2px; 
            background: transparent;
            border: none;
            / * border-bottom: 1px solid rgba(255,255,255,0.5); 下划线 */ 
            color: white;
            caret-color: white;    /* 光标白色 */
            width: auto;
            min-width: 5px;
            max-width:25px;
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            outline: none;
            -webkit-text-fill-color: white;   /* 关键：覆盖自动填充 */
            /* padding: 2px 5px; 增加一点点击区域 */
            /* -moz-appearance: textfield;*/
        }
        /*
        .page-input::-webkit-outer-spin-button,
        .page-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        */
        
        
        /* 新增：放大 Viewer 按钮 */
    .viewer-prev,
    .viewer-next {
        width: 60px !important;
        height: 60px !important;
        background: rgba(0,0,0,0.6) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin: 0 20px !important;
    }
    
 
    </style>
</head>
<body>

    <h3>${title}</h3>

    <!-- 1. 空容器，等待 JS 填充 -->
    <div class="gallery-container" id="gallery"></div>

    <!-- 2. 悬浮页码 -->
    <!-- 左下角 -->
    <div class="floating-panel page-navigator">
        <!--<span>第</span>-->
        <input type="number" id="pageInput" class="page-input" value="1" min="1">
        <span>  /  <span id="totalPages">${page_count}</span> 页</span>
    </div>

    <!-- 右下角 -->
    <div class="page-indicator">
        <span id="currentNum">1</span> / <span id="totalNum">0</span>
    </div>

    <!-- 3. 引入 Viewer JS -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.js"></script>

    <script>
    //alert('aaa');
var img_url_handle = ${image_handle_func}
		
	
        // --- A. 定义数据源 (模拟后台返回的数据) ---
        
        var image_list = ${JSON.stringify(image_list)};
       //alert(image_list);
 	  var image_total = ${image_count};
       var next_page_url = '${second_page_url}';
       var baseUrl = '${base_url}';
        

		var curr_pic_count = 0;
		var curr_page = 1;
		var count_per_page = image_list.length;
		var is_loading = 0;
		var visitedPages = new Set();
		var imageObserver = null; // 保存 observer 实例以便销毁或重建

        const gallery = document.getElementById('gallery');
        const currentNumEl = document.getElementById('currentNum');
        const totalNumEl = document.getElementById('totalNum');
        const pageInputEl = document.getElementById('pageInput');
       
       function renderGallery(page, images) {
            
            images.forEach((imgData, index) => {
				
				curr_pic_count++;

				// 是否需要外部自定义处理图片url链接
				if (img_url_handle)
					imgData = img_url_handle(imgData);
				
				let div = document.createElement('div');
				div.className = 'gallery-item';
				
				let img = document.createElement('img');
				img.src = imgData;
				img.alt = \`Image \${curr_pic_count}\`;
				img.dataset.index = curr_pic_count;
                img.dataset.page = page;
				
				div.appendChild(img)
				gallery.appendChild(div);
				// 观察img元素
                imageObserver.observe(img);
            });
            
            // 一次性插入到容器中
            //gallery.innerHTML = html;
			
            // 更新总数显示
            //totalNumEl.innerText = image_list.length;
        }
       
           // --- D. 监听列表滚动 (IntersectionObserver) ---
		 
        // 开始观察所有动态生成的图片
		
		function image_list_observe(page, image_list) {
			//var images = gallery.querySelectorAll('img');

			if (!imageObserver) {
				imageObserver = new IntersectionObserver((entries) => {
					entries.forEach(entry => {
						var rect = entry.boundingClientRect;
						// java.log(rect.height)
						if (entry.isIntersecting && rect.height > 200) {
							// 计算当前图片是第几张
							const index = parseInt(entry.target.dataset.index);
                            const page_idx = parseInt(entry.target.dataset.page);
							currentNumEl.innerText = index;
                            pageInput.value = page_idx;
                            //java.log(page_idx)
							//java.log(curr_pic_count - index );
                            //java.log(next_page_url)
                            if (curr_pic_count - index < 10) {
								fetch_next_page_image(next_page_url);
							}
						}
						
					});
				}, { threshold: 0.8 }); // 50% 可见时触发
			}

			// 执行渲染
			renderGallery(page, image_list);
		}
        
        /**
 * 根据规则字符串从 DOM 中提取数据
 * @param {string} rule 规则，格式 "CSS选择器@属性名"，属性名可为 text/html 或任意真实属性
 * @param {Document|Element} context 查找上下文，默认为 document
 * @returns {string|null} 提取的值，未找到元素或属性不存在时返回 null
 */
function getString(rule, context) {
  // 找到最后一个 @ 的位置（因为选择器中不会出现 @）
  const atIndex = rule.lastIndexOf('@');
  if (atIndex === -1) {
    throw new Error('规则格式错误：缺少 "@" 分隔符');
  }

  const selector = rule.slice(0, atIndex);
  const attrName = rule.slice(atIndex + 1);

  const element = context.querySelector(selector);
  if (!element) return null;

  if (attrName === 'text') {
    return element.textContent.trim() || null;
  } else if (attrName === 'html') {
    return element.innerHTML;
  } else {
    return element.getAttribute(attrName);
  }
}

function getStringList(rule, context) {
  const atIndex = rule.lastIndexOf('@');
  const selector = rule.slice(0, atIndex);
  const attrName = rule.slice(atIndex + 1);

  const elements = context.querySelectorAll(selector);
  
  return Array.from(elements).map(el => {
    if (attrName === 'text') return el.textContent.trim();
    if (attrName === 'html') return el.innerHTML;
    return el.getAttribute(attrName);
  }).filter(v => v !== null); // 过滤掉不存在的属性
}

        /* --- 页面请求 --- */
		async function fetchHtml(url) {
            url = '${base_url}' + url
            
			if (visitedPages.has(url))
				return null;
            visitedPages.add(url);
            java.log(url)
			try {
                
				const response = await fetch(url);
				if (!response.ok) {
					throw new Error('网络响应错误: ' + response.status + ':' + url);
				}
				//visitedPages.add(url);

				const data = await response.text();
				// java.log(data);
				return data;
			} catch (error) {
				java.log('请求失败:' + error);
				return null;
			}
		}
        
        	/* --- 页面解析 --- */
        async function parsePage(htmlText, baseUrl) {
            //java.log('1111')
            try {
            const doc = new DOMParser().parseFromString(htmlText, 'text/html');
            //alert(doc.body.outerHTML)
            
            const nextUrl = getString('${page_next_selector}', doc);
            java.log('获取下页链接：' + nextUrl)
            
            const images = [...getStringList('${img_selector}', doc)];
            java.log('获取图片数量：' + images.length)

            return { images, nextUrl };
            } catch(error) {
                alert(error)
            }
        }
        
        async function fetch_next_handle(page_url) {
            var page = curr_page
            
            html_string = await fetchHtml(page_url)
			if (!html_string)
				return 1;

                //java.log(html_string);
			let {images, nextUrl} = await parsePage(html_string, '');
            
            if (nextUrl)
                next_page_url = nextUrl;
                
            image_list_observe(page +1, images);
			image_list.push(...images);
			
			if (!image_total)
				totalNumEl.innerText = image_list.length;
			
			viewer.update();
            return 0;
            
        }
        
        function fetch_next_page_image(page_url) {
			if (is_loading)
				return;
                
                fetch_next_handle(page_url)
                .then( data => {
                    if (!data) {
                        curr_page++;
                        is_loading = 0;
                        }
                })
		}
       
       // init
		if (image_total)
			totalNumEl.innerText = image_total;
		else
			totalNumEl.innerText = image_list.length;
            
        image_list_observe(curr_page, image_list);
        
        // 初始化 Viewer (全屏查看功能) ---
        // 注意：因为 DOM 是动态生成的，所以必须在 renderGallery() 之后初始化
        const viewer = new Viewer(gallery, {
            initialViewMode: 1,
            toggleDraggableRate: 0.1,
            navbar: false,
            title: false,
            toolbar: {
        prev: { size: 'large' },   // 上一张按钮大号
        next: { size: 'large' },   // 下一张按钮大号
        },
            // 当打开查看器时，同步一下页码（可选）
            show: function(event) {
                currentNumEl.innerText = event.detail.index + 1;
            }
        });
        
        
        
        pageInputEl.addEventListener('keydown', function(e) {
            // 1. 阻止事件冒泡
            // 这非常重要！防止 Viewer.js 的全局键盘监听器捕获到这个回车键
            // 否则 Viewer 可能会尝试关闭或切换图片，而不是让你输入
            e.stopPropagation();

            if (e.key === 'Enter') {
                // 2. 失去焦点
                // 这一步能强制让出控制权，避免输入框还占着焦点导致后续操作怪异
                pageInputEl.blur();
                
                // 3. 执行逻辑
                const targetPage = parseInt(pageInputEl.value);
                alert(targetPage)
            }
        });
        
        
		
    </script>
</body>
</html>`
}

function getStringList(x, r) {
    return r == undefined ? Array.from(this.java.getStringList(x)) : Array.from(this.java.getStringList(x, r));
}
