<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Swiper 图片缩放示例</title>
    <!-- 引入 Swiper CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
    <style>
        body { margin: 0; background: #000; }
        .swiper { width: 100%; height: 100vh; }
        
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
    </style>
</head>
<body>

<div class="swiper">
    <div class="swiper-wrapper">
        <!-- 幻灯片 1 -->
        <div class="swiper-slide">
            <!-- ⚠️ 必须包裹 swiper-zoom-container -->
            <div class="swiper-zoom-container">
                <img src="path/to/your/image1.jpg" />
            </div>
        </div>
        <!-- 幻灯片 2 -->
        <div class="swiper-slide">
            <div class="swiper-zoom-container">
                <img src="path/to/your/image2.jpg" />
            </div>
        </div>
    </div>
    <!-- 分页器 -->
    <div class="swiper-pagination"></div>
</div>

<!-- 引入 Swiper JS -->
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

<script>
    const swiper = new Swiper('.swiper', {
        direction: 'vertical', // 或者是 'horizontal'
        
        // --- 开启缩放功能 ---
        zoom: {
            maxRatio: 3,   // 最大放大倍数 (默认 3)
            minRatio: 1,   // 最小缩放比例 (默认 1)
            toggle: true,  // 是否允许双击切换放大/还原 (默认 true)
        },

        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        
        // 允许鼠标滚轮切换（PC端调试用）
        mousewheel: true,
    });
</script>

</body>
</html>
