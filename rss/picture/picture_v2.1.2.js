function pictureHtml(config) {

    let {
        image_list = [],
            image_count = 0,
            page_count = 1,
            title = '',
            base_url = '',

            page_jump = false,
            // page_jump 为false 时需要填写下面
            second_page_url = '',
            page_next_selector = '',
            // page_jump 为true 时需要填写下面
            page_url_func = '',

            image_handle_func = '',
            img_selector = '',

    } = config;

    return `
<!DOCTYPE html>
<html lang="zh-CN">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <!-- 引入 Viewer CSS -->
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.css"
        />

        <style>
            body {
                margin: 0;
                padding: 10px;
                background: #f5f5f5;
                font-family: sans-serif;
            }

            /* --- 1. 列表容器 --- */
            .gallery-container {
                display: flex;
                flex-direction: column; /* 竖向排列 */
                gap: 15px; /* 图片间距 */
                //max-width: 600px; /* 限制最大宽度 */
                margin: 0 auto; /* 居中 */
                padding-bottom: 10vh; /* 底部留白，方便测试滚动到底部 */
            }

            /* --- 2. 图片样式 (关键点) --- */
            .gallery-item img {
                width: 100%; /* 宽度填满容器 */
                height: auto; /* 【关键】高度自动，保持原始比例 */
                min-height: 200px;
                display: block; /* 消除图片底部的默认缝隙 */
                border-radius: 8px; /* 圆角 */
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 阴影增加质感 */
                cursor: zoom-in; /* 鼠标变成放大镜图标 */
                transition: transform 0.2s;
            }

            /* 点击时的轻微缩放效果 */
            .gallery-item img:active {
                transform: scale(0.98);
            }

            /* --- 3. 悬浮页码 --- */

            .floating-panel {
                position: fixed;
                bottom: 30px;
                background: rgba(0, 0, 0, 0.3);
                backdrop-filter: blur(4px);
                color: #fff;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 10px;
                font-weight: bold;
                z-index: 99;
                //display: flex;
                align-items: center;
                /*gap: 10px;*/
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }
            /* 透明扩展层：增大可点击区域 */
            .floating-panel::after {
                content: "";
                position: absolute;
                /* 向外扩展 10px，可根据需要调整 */
                top: -10px;
                right: -10px;
                bottom: -10px;
                left: -10px;
                background: transparent;
                /* 继承圆角，使扩展区域也保持圆角（可选） */
                border-radius: inherit;
            }

            /* --- 左下角：分页控制器 --- */
            .page-navigator {
                left: 20px;
            }

            /* --- 右下角：图片控制器 --- */
            .page-indicator {
                right: 20px;
            }

            .picker {
                width: 100% !important;
                left: 0 !important;
                right: auto !important;
                margin: 0 auto !important;
            }

            .wheel ul {
                margin: 0;
                padding: 0;
                list-style: none;
            }

            /* 新增：放大 Viewer 按钮 */
            .viewer-prev,
            .viewer-next {
                width: 60px !important;
                height: 60px !important;
                background: rgba(0, 0, 0, 0.6) !important;
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
            <span id="currentPage">1</span> / <span id="totalPages">${page_count}</span> 页
        </div>

        <!-- 右下角 -->
        <div class="floating-panel page-indicator">
            <span id="currentNum">1</span> / <span id="totalNum">0</span>
        </div>

        <!-- 3. 引入 Viewer JS -->
        <script src="https://cdnjs.cloudflare.com/ajax/libs/viewerjs/1.11.3/viewer.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/better-picker@1.1.3/dist/picker.min.js"></script>

        <script>
            //alert('aaa');
            // 状态机Group
            class SimpleStateMachineGroup {
                static validStates = ["init", "submit", "done"];
                constructor() {
                    this.map = new Map();
                }

                exists(name) {
                    return this.map.has(name);
                }
                getState(name) {
                    return this.map.get(name);
                }

                setState(name, newState) {
                    if (!validStates.includes(newState)) {
                        throw new Error("Invalid state:" + newState);
                    }
                    this.map.set(name, newState);
                }
            }

            const fsm = new SimpleStateMachineGroup();

            // 外部注入函数
            var img_url_handle = ${image_handle_func};
            var page_url_handle = ${page_url_func};

            function getBaseUrl(url) {
                try {
                    return new URL(url).origin;
                } catch (error) {
                    alert("无效的网址:" + error);
                    return null;
                }
            }

            // --- A. 定义数据源 (模拟后台返回的数据) ---

            var image_list = ${JSON.stringify(image_list)};
            var image_total = ${image_count};
            var page_count = ${page_count};
            var next_page_url = "${second_page_url}";
            var html_href = "${base_url}";
            var page_jump = ${page_jump};
            var page_next_selector = "${page_next_selector}";

            var curr_pic_count = 0;
            var last_pic_idx = 0;
            var total_last_pic_idx = 0;
            var fetch_page_idx = 1;
            var last_page_idx = 1;

            var count_per_page = image_list.length;
            var visitedPages = new Set();
            var imageObserver = null; // 保存 observer 实例以便销毁或重建
            var baseUrl = getBaseUrl(html_href);

            const gallery = document.getElementById("gallery");
            const currentNumEl = document.getElementById("currentNum");
            const currentPageEl = document.getElementById("currentPage");
            const totalNumEl = document.getElementById("totalNum");

            function renderGallery(page, images) {
                // 1. 准备阶段：内存中创建 DOM
                const fragment = document.createDocumentFragment();
                const newElements = [];

                images.forEach((imgData, index) => {
                    curr_pic_count++;

                    // 是否需要外部自定义处理图片url链接
                    if (img_url_handle) imgData = img_url_handle(imgData);

                    let div = document.createElement("div");
                    div.className = "gallery-item";

                    let img_idx = (page - 1) * count_per_page + index + 1;
                    let img = document.createElement("img");
                    img.src = imgData;
                    img.alt = \`Image \${img_idx}\`;
                    img.dataset.index = img_idx;
                    img.dataset.page = page;

                    div.appendChild(img);
                    fragment.appendChild(div);
                    newElements.push(img);
                    last_pic_idx = img_idx;
                });

                if (last_pic_idx > total_last_pic_idx) {
                    total_last_pic_idx = last_pic_idx;
                }

                // 2. 寻找插入点：使用 findIndex
                const allItems = gallery.querySelectorAll(".gallery-item");
                // 查找第一个 page 大于当前 page 的元素的索引
                const insertPosition = Array.from(allItems).findIndex((item) => {
                    return parseInt(item.querySelector("img").dataset.page) > page;
                });

                // 3. 统一插入
                if (insertPosition !== -1) {
                    // 找到了比当前页大的元素，插在它前面，allItems[insertPosition] 就是我们要找的 referenceNode
                    gallery.insertBefore(fragment, allItems[insertPosition]);
                } else {
                    // 没找到（说明当前页最大），追加到末尾
                    gallery.appendChild(fragment);
                }

                // 4. 统一观察
                newElements.forEach((img) => imageObserver.observe(img));
            }

            // --- D. 监听列表滚动 (IntersectionObserver) ---
            // 开始观察所有动态生成的图片
            var is_loading = false;
            function image_list_observe(page, image_list) {
                function observe_page_callback(error, page) {
                    is_loading = false;
                }

                if (!imageObserver) {
                    imageObserver = new IntersectionObserver(
                        (entries) => {
                            entries.forEach((entry) => {
                                var rect = entry.boundingClientRect;
                                // java.log(rect.height)
                                if (
                                    entry.isIntersecting &&
                                    (rect.height > 200 ||
                                        (entry.target.complete && entry.target.naturalWidth == 0))
                                ) {
                                    if (
                                        entry.target.complete &&
                                        entry.target.naturalWidth == 0
                                    ) {
                                        let src = entry.target.src;
                                        entry.target.src = "";
                                        entry.target.src = src;
                                    }

                                    // 计算当前图片是第几张
                                    const index = parseInt(entry.target.dataset.index);
                                    const page_idx = parseInt(entry.target.dataset.page);

                                    currentNumEl.innerText = index;
                                    currentPageEl.innerText = page_idx;

                                    //java.log(page_idx)
                                    //java.log(curr_pic_count - index );
                                    //java.log(next_page_url)
                                    //if (curr_pic_count - index < 6 && !is_loading) {
                                    //java.log(last_pic_idx)

                                    if (is_loading) return;

                                    let need_loading = false;
                                    if (last_pic_idx > index && last_pic_idx - index < 6) {
                                        need_loading = true;
                                    } else if (total_last_pic_idx - index < 6) {
                                        need_loading = true;
                                    }

                                    if (need_loading) {
                                        // 解决页面跳转后面再跳转前面时，翻到最后无法继续加载
                                        //java.log('last:' + last_page_idx + '  fetch: ' + fetch_page_idx)
                                        if (last_page_idx == page_idx + 1) {
                                            fetch_page_idx = last_page_idx;
                                        }
                                        if (fetch_page_idx > page_count) return;
                                        let page_url = next_page_url;
                                        if (page_jump && page_url_handle) {
                                            page_url = page_url_handle(html_href, fetch_page_idx);
                                        }
                                        is_loading = true;
                                        fetch_page_image(fetch_page_idx, page_url, observe_page_callback);
                                    }
                                }
                            });
                        },
                        { threshold: 0.9 }
                    ); // 80% 可见时触发
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
                const atIndex = rule.lastIndexOf("@");
                if (atIndex === -1) {
                    throw new Error('规则格式错误：缺少 "@" 分隔符');
                }

                const selector = rule.slice(0, atIndex);
                const attrName = rule.slice(atIndex + 1);

                const element = context.querySelector(selector);
                if (!element) return null;

                if (attrName === "text") {
                    return element.textContent.trim() || null;
                } else if (attrName === "html") {
                    return element.innerHTML;
                } else {
                    return element.getAttribute(attrName);
                }
            }

            function getStringList(rule, context) {
                const atIndex = rule.lastIndexOf("@");
                const selector = rule.slice(0, atIndex);
                const attrName = rule.slice(atIndex + 1);

                const elements = context.querySelectorAll(selector);

                return Array.from(elements)
                    .map((el) => {
                        if (attrName === "text") return el.textContent.trim();
                        if (attrName === "html") return el.innerHTML;
                        return el.getAttribute(attrName);
                    })
                    .filter((v) => v !== null); // 过滤掉不存在的属性
            }

            /* --- 页面请求 --- */
            async function fetchHtml(url) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error("网络响应错误: " + response.status + ":" + url);
                    }
                    const data = await response.text();
                    // java.log(data);
                    return data;
                } catch (error) {
                    java.log("请求失败:" + error);
                    return null;
                }
            }

            /* --- 页面解析 --- */
            async function parsePage(htmlText, baseUrl) {
                try {
                    const doc = new DOMParser().parseFromString(htmlText, "text/html");
                    //alert(doc.body.outerHTML)

                    let nextUrl = null;
                    if (page_next_selector) {
                        nextUrl = getString(page_next_selector, doc);
                        if (nextUrl && !nextUrl.toLowerCase().startsWith("http")) {
                            nextUrl = new URL(nextUrl, baseUrl).href;
                        }
                        java.log("获取下页链接：" + nextUrl);
                    }

                    const images = [...getStringList("${img_selector}", doc)];
                    java.log("获取图片数量：" + images.length);

                    return { images, nextUrl };
                } catch (error) {
                    alert(error);
                }
            }

            async function fetch_next_handle(page, page_url) {
                if (visitedPages.has(page_url)) return 0;
                visitedPages.add(page_url);

                java.log("请求连接：" + page_url);
                let html_string = await fetchHtml(page_url);
                if (!html_string) {
                    visitedPages.delete(page_url);
                    return 1;
                }

                //java.log(html_string);
                let { images, nextUrl } = await parsePage(html_string, baseUrl);

                image_list_observe(page, images);
                /* 准备下页或者下页链接 */
                fetch_page_idx = page + 1;
                if (fetch_page_idx > last_page_idx) last_page_idx = fetch_page_idx;

                if (nextUrl) next_page_url = nextUrl;

                image_list.push(...images);

                if (!image_total) totalNumEl.innerText = image_list.length;

                viewer.update();
                return 0;
            }

            let requestQueue = [];
            let isProcessing = false;
            // 核心修改：处理队列的函数
            async function processQueue() {
                // 如果队列空了或者正在处理中，则不启动新流程
                if (requestQueue.length === 0 || isProcessing) {
                    return;
                }

                isProcessing = true;

                // 取出队列中的第一个 URL (先进先出)
                // 1. 从队列头部取出任务对象
                const task = requestQueue.shift();
                const page = task.page;
                const urlToFetch = task.url;
                const onComplete = task.callback; // 获取对应的回调函数

                try {
                    let res = await fetch_next_handle(page, urlToFetch);
                    onComplete(res, page);
                } catch (err) {
                    console.error("Fetch error:", err);
                    onComplete(err, page);
                } finally {
                    // 无论成功失败，标记处理结束
                    isProcessing = false;

                    // 递归调用，检查队列里是否还有下一个任务
                    // 使用 setTimeout 防止同步递归导致的堆栈溢出，并让出主线程渲染UI
                    setTimeout(processQueue, 0);
                }
            }

            function fetch_page_image(page, page_url, callback) {
                // 将新的请求推入队列
                requestQueue.push({
                    page: page,
                    url: page_url,
                    callback: callback,
                });

                // 尝试启动处理流程
                processQueue();
            }

            // init
            if (image_total) totalNumEl.innerText = image_total;
            else totalNumEl.innerText = image_list.length;

            image_list_observe(fetch_page_idx, image_list);
            fetch_page_idx++;
            visitedPages.add(html_href);

            // 初始化 Viewer (全屏查看功能) ---
            // 注意：因为 DOM 是动态生成的，所以必须在 renderGallery() 之后初始化
            const viewer = new Viewer(gallery, {
                initialViewMode: 1,
                toggleDraggableRate: 0.1,
                navbar: false,
                title: false,
                toolbar: {
                    prev: { size: "large" }, // 上一张按钮大号
                    next: { size: "large" }, // 下一张按钮大号
                },
                // 当打开查看器时，同步一下页码（可选）
                show: function (event) {
                    currentNumEl.innerText = event.detail.index + 1;
                },
            });

            function page_input_target_jump(err_code, page) {
                isInputProcessing = false;

                if (err_code) {
                    java.log("跳转页面处理失败：" + err_code);
                    return;
                }

                // 2. 寻找插入点：使用 findIndex
                let allItems = gallery.querySelectorAll(".gallery-item");
                // 查找第一个 page 等于当前 page 的元素的索引
                const insertPosition = Array.from(allItems).findIndex((item) => {
                    return parseInt(item.querySelector("img").dataset.page) === page;
                });

                if (insertPosition !== -1) {
                    allItems[insertPosition].scrollIntoView({ behavior: "smooth" });
                }
            }

            let isInputProcessing = false; // 定义锁
            function page_jump_handle(page) {
                if (!page_url_handle) {
                    alert("未定义函数：page_url_handle");
                    return;
                }

                if (isInputProcessing) {
                    alert("上一请求正在处理，请等待");
                    return;
                }
                isInputProcessing = true;

                // 3. 执行逻辑
                java.log("跳转页码：" + page);
                let page_url = page_url_handle(html_href, page);

                if (page == 1) page_url = html_href;

                fetch_page_image(page, page_url, page_input_target_jump);
            }

            let pickerData = [];
            for (let i = 1; i <= page_count; i++) {
                pickerData.push({
                    text: i.toString(),
                    value: i,
                });
            }

            var picker = new Picker({
                data: [pickerData],
                selectedIndex: [1],
                title: "选择页码",
            });

            picker.on("picker.select", function (selectedVal, selectedIndex) {
                // alert(selectedVal);
                let page = parseInt(selectedVal);
                page_jump_handle(page);
            });

            function page_indicator_func() {
                if (page_jump) {
                    let index = parseInt(currentPageEl.innerText) - 1;
                    picker.selectedIndex = [index];
                    picker.show();
                }
            }

            const right_float = document.querySelector(".page-indicator");
            const left_float = document.querySelector(".page-navigator");

            right_float.addEventListener("click", page_indicator_func);
            left_float.addEventListener("click", page_indicator_func);

            // 点击遮罩，退出选择器
            const pickers = document.querySelector(".picker");
            const mask = pickers.querySelector(".picker-mask");
            mask.addEventListener("click", function () {
                picker.hide();
            });
        </script>
    </body>
</html>`
}

function getStringList(x, r) {
    return r == undefined ? Array.from(this.java.getStringList(x)) : Array.from(this.java.getStringList(x, r));
}
