// ===== 仪表盘主逻辑 =====
let trendChart, causeChart, fatalityChart, survivalChart;
let earthAnimationId;
let needsRedraw = true;
// ===== 3D 地球仪全局引用 =====
let earthGlobe = null;       // { scene, camera, renderer, globe, markers, raycaster, ... }
// ===== 初始化仪表盘 =====
document.addEventListener('DOMContentLoaded', async () => {
    const skeleton = document.querySelector('.map-skeleton');
    if (skeleton) skeleton.classList.remove('hidden');
    
    try {
        await loadAllData();
        initCharts();
        updateDashboard();
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
    
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => initEarthCanvas(), { timeout: 1000 });
    } else {
        setTimeout(() => initEarthCanvas(), 200);
    }
    
    document.addEventListener('filtersUpdated', updateDashboard);
    
    document.addEventListener('languageChanged', () => {
        updateDashboard();
    });
});
// ===== 3D立体地球仪可视化（Three.js + D3纹理生成）=====
async function initEarthCanvas() {
    const canvas = document.getElementById('earthCanvas');
    if (!canvas) return;
    if (typeof d3 === 'undefined' || typeof topojson === 'undefined') return;

    // 清理旧的地球仪实例
    if (earthGlobe) {
        if (earthGlobe.renderer) earthGlobe.renderer.dispose();
        if (earthGlobe.scene) {
            earthGlobe.scene.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
        }
        earthGlobe = null;
    }
    if (earthAnimationId) {
        cancelAnimationFrame(earthAnimationId);
        earthAnimationId = null;
    }

    // 检查 Three.js 是否加载成功
    if (typeof THREE === 'undefined') {
        console.error('Three.js is not loaded');
        const skeleton = document.querySelector('.map-skeleton');
        if (skeleton) skeleton.innerHTML = '<div class="skeleton-error">Failed to load 3D engine</div>';
        return;
    }
    console.log('Three.js loaded successfully:', THREE.REVISION);

    // ===== 工具提示 =====
    const tooltip = document.createElement('div');
    tooltip.className = 'map-tooltip';
    canvas.parentElement.appendChild(tooltip);

    function showTooltip(accident, cx, cy) {
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-airline">${accident.airline}</span>
                <span class="tooltip-flight">${accident.flightNumber || '-'}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.date')}</span>
                <span class="tooltip-value">${accident.date}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.location')}</span>
                <span class="tooltip-value">${accident.location}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.aircraft')}</span>
                <span class="tooltip-value">${td(accident.aircraft)}</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">${t('tooltip.cause')}</span>
                <span class="tooltip-value">${t('cause.' + accident.cause)}</span>
            </div>
            <div class="tooltip-stats">
                <div class="tooltip-stat danger">
                    <div class="ts-num">${accident.fatalities}</div>
                    <div class="ts-lbl">${t('tooltip.fatalities')}</div>
                </div>
                <div class="tooltip-stat warning">
                    <div class="ts-num">${accident.injuries || 0}</div>
                    <div class="ts-lbl">${t('tooltip.injured')}</div>
                </div>
                <div class="tooltip-stat success">
                    <div class="ts-num">${Math.max(0, (accident.totalOccupants || 0) - (accident.fatalities || 0) - (accident.injuries || 0))}</div>
                    <div class="ts-lbl">${t('tooltip.uninjured')}</div>
                </div>
            </div>
        `;
        tooltip.style.display = 'block';
        const padding = 15;
        const tipW = Math.min(320, window.innerWidth - padding * 2);
        let tx = cx + padding;
        let ty = cy + padding;
        if (tx + tipW > window.innerWidth - padding) tx = cx - tipW - padding;
        if (ty + tooltip.offsetHeight > window.innerHeight - padding) ty = cy - tooltip.offsetHeight - padding;
        tx = Math.max(padding, tx);
        ty = Math.max(padding, ty);
        tooltip.style.left = `${tx}px`;
        tooltip.style.top = `${ty}px`;
    }

    // ===== 场景初始化 =====
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制像素比以保证性能

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    // 场景
    const scene = new THREE.Scene();

    // 相机
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.5, 100);
    camera.position.set(0, 1.5, 16);
    camera.lookAt(0, 0, 0);

    // 光照 —— 降低强度让纹理本色更突出
    const ambientLight = new THREE.AmbientLight(0x8899cc, 1.0);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    sunLight.position.set(15, 8, 10);
    scene.add(sunLight);
    const fillLight = new THREE.DirectionalLight(0x8899cc, 0.3);
    fillLight.position.set(-8, -2, -6);
    scene.add(fillLight);

    // ===== 星空背景（减少粒子数提升性能）=====
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 400;
    const starsPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 40 + Math.random() * 8;
        starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        starsPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starsPositions[i * 3 + 2] = r * Math.cos(phi);
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.12,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // ===== 地球组 =====
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // ===== 地球纹理生成（等距矩形投影 / Equirectangular）=====
    const TEX_W = 2048;
    const TEX_H = 1024;
    const texCanvas = document.createElement('canvas');
    texCanvas.width = TEX_W;
    texCanvas.height = TEX_H;
    const texCtx = texCanvas.getContext('2d');

    // 深海背景 —— 极暗，与陆地形成强烈对比
    const oceanGrad = texCtx.createLinearGradient(0, 0, 0, TEX_H);
    oceanGrad.addColorStop(0, '#020d1a');
    oceanGrad.addColorStop(0.35, '#05152a');
    oceanGrad.addColorStop(0.5, '#071a35');
    oceanGrad.addColorStop(0.65, '#05152a');
    oceanGrad.addColorStop(1, '#020d1a');
    texCtx.fillStyle = oceanGrad;
    texCtx.fillRect(0, 0, TEX_W, TEX_H);

    // 经纬网
    texCtx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    texCtx.lineWidth = 1;
    for (let lng = -180; lng < 180; lng += 15) {
        const x = (lng + 180) / 360 * TEX_W;
        texCtx.beginPath();
        texCtx.moveTo(x, 0);
        texCtx.lineTo(x, TEX_H);
        texCtx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 15) {
        const y = (90 - lat) / 180 * TEX_H;
        texCtx.beginPath();
        texCtx.moveTo(0, y);
        texCtx.lineTo(TEX_W, y);
        texCtx.stroke();
    }
    // 赤道
    texCtx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    texCtx.lineWidth = 2;
    texCtx.beginPath();
    texCtx.moveTo(0, TEX_H / 2);
    texCtx.lineTo(TEX_W, TEX_H / 2);
    texCtx.stroke();

    // 加载世界地图数据并绘制国家
    let worldGeoJSON = null;
    try {
        console.log('Loading world map data...');
        const world = await d3.json('data/countries-110m.json');
        console.log('World map data loaded:', world && world.type);
        worldGeoJSON = topojson.feature(world, world.objects.countries);
        console.log('GeoJSON created:', worldGeoJSON && worldGeoJSON.type, worldGeoJSON && worldGeoJSON.features && worldGeoJSON.features.length, 'features');
    } catch (err) {
        console.error('Failed to load world map:', err);
    }

    if (worldGeoJSON) {
        const eqProjection = d3.geoEquirectangular()
            .translate([TEX_W / 2, TEX_H / 2])
            .scale(TEX_W / (2 * Math.PI));
        const eqPath = d3.geoPath().projection(eqProjection).context(texCtx);

        console.log('Projection scale:', TEX_W / (2 * Math.PI));
        console.log('Projection translate:', [TEX_W / 2, TEX_H / 2]);
        
        const testPoint = eqProjection([0, 0]);
        console.log('Test point [0,0] projected to:', testPoint);

        // 第一层：陆地填充（亮蓝灰渐变）
        const landGrad = texCtx.createLinearGradient(0, 0, 0, TEX_H);
        landGrad.addColorStop(0, '#286098');
        landGrad.addColorStop(0.5, '#3478b8');
        landGrad.addColorStop(1, '#286098');
        texCtx.fillStyle = landGrad;
        texCtx.beginPath();
        eqPath(worldGeoJSON);
        texCtx.fill();

        // 第二层：粗白轮廓（shadow 扩散 + 粗描边，一次到位）
        texCtx.save();
        texCtx.shadowColor = 'rgba(255, 255, 255, 0.85)';
        texCtx.shadowBlur = 18;
        texCtx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        texCtx.lineWidth = 18;
        texCtx.lineJoin = 'round';
        texCtx.beginPath();
        eqPath(worldGeoJSON);
        texCtx.stroke();
        texCtx.stroke();  // 双重描边
        texCtx.restore();

        // 第三层：国界线 —— 较细浅蓝线
        texCtx.strokeStyle = 'rgba(140, 200, 240, 0.55)';
        texCtx.lineWidth = 5;
        texCtx.lineJoin = 'round';
        texCtx.beginPath();
        eqPath(worldGeoJSON);
        texCtx.stroke();
    }

    // 扫描线效果（预计算模式，避免逐行 Math.random()）
    texCtx.fillStyle = 'rgba(255, 255, 255, 0.006)';
    for (let y = 0; y < TEX_H; y += 6) {
        texCtx.fillRect(0, y, TEX_W, 1);
    }

    const earthTexture = new THREE.CanvasTexture(texCanvas);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = 4;
    
    console.log('Earth texture created:', earthTexture);
    console.log('Texture size:', texCanvas.width, 'x', texCanvas.height);

    // 测试纹理内容
    const testPixel = texCtx.getImageData(TEX_W / 2, TEX_H / 2, 1, 1).data;
    console.log('Center pixel RGBA:', testPixel);

    // ===== 地球球体（降低面数提升性能）=====
    const EARTH_RADIUS = 5;
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 56, 36);
    const earthMaterial = new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.75,
        metalness: 0.05,
        emissive: 0x000811,
        emissiveIntensity: 0.15
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthGroup.add(earthMesh);

    // ===== 大气层光晕（降低面数）=====
    const atmosGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.025, 48, 30);
    const atmosVertexShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        void main() {
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPos.xyz;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const atmosFragmentShader = `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        uniform vec3 uViewPosition;
        void main() {
            vec3 viewDir = normalize(uViewPosition - vWorldPosition);
            float fresnel = 1.0 - abs(dot(viewDir, normalize(vNormal)));
            fresnel = pow(fresnel, 2.8);
            float alpha = fresnel * 0.55;
            gl_FragColor = vec4(0.2, 0.65, 1.0, alpha);
        }
    `;
    const atmosMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosVertexShader,
        fragmentShader: atmosFragmentShader,
        uniforms: {
            uViewPosition: { value: camera.position }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const atmosphere = new THREE.Mesh(atmosGeometry, atmosMaterial);
    earthGroup.add(atmosphere);

    // 外层大气环（降低面数）
    const outerAtmosGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.08, 36, 22);
    const outerAtmosMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosVertexShader,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vWorldPosition;
            uniform vec3 uViewPosition;
            void main() {
                vec3 viewDir = normalize(uViewPosition - vWorldPosition);
                float fresnel = 1.0 - abs(dot(viewDir, normalize(vNormal)));
                fresnel = pow(fresnel, 5.0);
                float alpha = fresnel * 0.2;
                gl_FragColor = vec4(0.0, 0.5, 0.9, alpha);
            }
        `,
        uniforms: {
            uViewPosition: { value: camera.position }
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const outerAtmosphere = new THREE.Mesh(outerAtmosGeometry, outerAtmosMaterial);
    earthGroup.add(outerAtmosphere);

    // ===== 事故标记系统 =====
    const markersGroup = new THREE.Group();
    earthGroup.add(markersGroup);

    // 生成标记精灵贴图（高饱和度、带光晕）
    function createDotTexture(innerColor, outerColor, size) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const ctx = c.getContext('2d');
        const half = size / 2;
        const grad = ctx.createRadialGradient(half, half, size * 0.02, half, half, half);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.08, innerColor);
        grad.addColorStop(0.25, innerColor);
        grad.addColorStop(0.5, outerColor);
        grad.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    const dotTexLow = createDotTexture('#ffdd00', '#ff8800', 64);    // 低严重度：亮黄→橙光晕
    const dotTexHigh = createDotTexture('#dd1111', '#880000', 72);   // 高严重度：深血红→暗红光晕
    const dotTexHover = createDotTexture('#ffffff', '#66ccff', 88);  // 悬停：白色→蓝白光晕

    // 经纬度 → 3D坐标
    function latLngToVec3(lat, lng, radius) {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = lng * Math.PI / 180;
        return new THREE.Vector3(
            -radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    // ===== 共享材质（3 个实例替代 83 个，大幅减少 GPU 开销）=====
    const sharedMatLow = new THREE.SpriteMaterial({
        map: dotTexLow, blending: THREE.AdditiveBlending,
        depthWrite: false, depthTest: true, transparent: true, opacity: 0.95
    });
    const sharedMatHigh = new THREE.SpriteMaterial({
        map: dotTexHigh, blending: THREE.AdditiveBlending,
        depthWrite: false, depthTest: true, transparent: true, opacity: 0.95
    });
    const sharedMatHover = new THREE.SpriteMaterial({
        map: dotTexHover, blending: THREE.AdditiveBlending,
        depthWrite: false, depthTest: true, transparent: true, opacity: 1
    });

    // 存储标记数据
    let markerDataList = []; // { accident, sprite, position }

    function clearMarkers() {
        // 不再逐个销毁材质（使用共享材质），直接移除子对象
        while (markersGroup.children.length > 0) {
            markersGroup.remove(markersGroup.children[0]);
        }
        markerDataList = [];
    }

    function createMarkers() {
        clearMarkers();
        const { filteredAccidents } = AppState;
        const spriteScale = EARTH_RADIUS * 0.05;

        for (const accident of filteredAccidents) {
            const pos = latLngToVec3(accident.latitude, accident.longitude, EARTH_RADIUS * 1.02);
            const isHigh = accident.fatalities > 50;
            // 所有同类型精灵共享材质，不再每个精灵创建一个材质实例
            const sprite = new THREE.Sprite(isHigh ? sharedMatHigh : sharedMatLow);
            sprite.position.copy(pos);
            sprite.scale.set(spriteScale, spriteScale, 1);
            sprite.userData = { accident, isHigh };
            markersGroup.add(sprite);
            markerDataList.push({ accident, sprite, baseScale: spriteScale });
        }
    }

    // ===== 交互状态 =====
    let isDragging = false;
    let dragPrevX = 0;
    let dragPrevY = 0;
    let didDrag = false;
    let autoRotateSpeed = 0.15; // 自动旋转速度（度/秒）
    let autoRotateEnabled = true;
    let targetZoom = 16;
    let currentZoom = 16;
    const MIN_ZOOM = 7;
    const MAX_ZOOM = 28;
    let hoveredMarker = null;

    // ===== 射线检测 =====
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.5;
    raycaster.params.Sprite.threshold = 0.5;

    function getIntersections(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const mouse = new THREE.Vector2();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const targets = markersGroup.children.length > 0 ? markersGroup.children : [earthMesh];
        return raycaster.intersectObjects(targets, false);
    }

    // ===== 缩放指示器 =====
    function updateZoomIndicator() {
        const indicator = document.querySelector('.map-zoom-indicator');
        if (indicator) {
            const pct = Math.round((currentZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM) * 100);
            indicator.textContent = `${pct}%`;
        }
    }

    // ===== 重置视图 =====
    function resetView() {
        targetZoom = 16;
        earthGroup.rotation.set(0.35, 0, 0);
        autoRotateEnabled = true;
        updateZoomIndicator();
    }

    // ===== 鼠标事件 =====
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        didDrag = false;
        dragPrevX = e.clientX;
        dragPrevY = e.clientY;
        autoRotateEnabled = false;
        canvas.style.cursor = 'grabbing';
        tooltip.style.display = 'none';
        e.preventDefault();
    });

    // 拖拽用缓存向量
    const _dragVecY = new THREE.Vector3(0, 1, 0);
    const _dragVecX = new THREE.Vector3(1, 0, 0);

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const dx = e.clientX - dragPrevX;
            const dy = e.clientY - dragPrevY;
            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) didDrag = true;
            earthGroup.rotateOnWorldAxis(_dragVecY, dx * 0.005);
            _dragVecX.set(1, 0, 0).applyQuaternion(earthGroup.quaternion).normalize();
            earthGroup.rotateOnWorldAxis(_dragVecX, dy * 0.005);
            dragPrevX = e.clientX;
            dragPrevY = e.clientY;
            tooltip.style.display = 'none';
        } else {
            const intersections = getIntersections(e.clientX, e.clientY);
            const hit = intersections.find(i => i.object.userData && i.object.userData.accident);
            if (hit && hit.object.userData.accident !== (hoveredMarker ? hoveredMarker.accident : null)) {
                // 悬停标记：切换到共享高亮材质
                if (hoveredMarker) {
                    hoveredMarker.sprite.material = hoveredMarker.sprite.userData.isHigh ? sharedMatHigh : sharedMatLow;
                }
                hoveredMarker = markerDataList.find(m => m.sprite === hit.object);
                if (hoveredMarker) {
                    hoveredMarker.sprite.material = sharedMatHover;
                    hoveredMarker.sprite.scale.set(hoveredMarker.baseScale * 1.5, hoveredMarker.baseScale * 1.5, 1);
                    canvas.style.cursor = 'pointer';
                    const vec = hoveredMarker.sprite.position.clone();
                    earthGroup.localToWorld(vec);
                    vec.project(camera);
                    const sx = (vec.x * 0.5 + 0.5) * canvas.clientWidth + canvas.getBoundingClientRect().left;
                    const sy = (-vec.y * 0.5 + 0.5) * canvas.clientHeight + canvas.getBoundingClientRect().top;
                    showTooltip(hoveredMarker.accident, sx, sy);
                }
            } else if (!hit && hoveredMarker) {
                // 取消悬停：恢复原始共享材质
                const prev = hoveredMarker;
                hoveredMarker = null;
                prev.sprite.material = prev.sprite.userData.isHigh ? sharedMatHigh : sharedMatLow;
                prev.sprite.scale.set(prev.baseScale, prev.baseScale, 1);
                tooltip.style.display = 'none';
                canvas.style.cursor = 'grab';
            }
            if (!hit && !hoveredMarker && canvas.style.cursor !== 'grab') {
                canvas.style.cursor = 'grab';
            }
        }
    });

    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        canvas.style.cursor = hoveredMarker ? 'pointer' : 'grab';
        // 释放后1.5秒恢复自动旋转
        setTimeout(() => { if (!isDragging) autoRotateEnabled = true; }, 1500);
        if (!didDrag && hoveredMarker && hoveredMarker.accident.id) {
            window.location.href = `table.html#${hoveredMarker.accident.id}`;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        canvas.style.cursor = 'grab';
        tooltip.style.display = 'none';
        if (hoveredMarker) {
            const prev = hoveredMarker;
            hoveredMarker = null;
            prev.sprite.material = prev.sprite.userData.isHigh ? sharedMatHigh : sharedMatLow;
            prev.sprite.scale.set(prev.baseScale, prev.baseScale, 1);
        }
        autoRotateEnabled = true;
    });

    // 滚轮缩放
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom * factor));
        updateZoomIndicator();
    }, { passive: false });

    // 双击重置
    canvas.addEventListener('dblclick', () => {
        resetView();
    });

    // ===== 触摸事件 =====
    let touchStartDist = 0;
    let touchStartZoom = 0;
    let touchPrevX = 0;
    let touchPrevY = 0;

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (e.touches.length === 1) {
            isDragging = true;
            didDrag = false;
            autoRotateEnabled = false;
            touchPrevX = e.touches[0].clientX;
            touchPrevY = e.touches[0].clientY;
            tooltip.style.display = 'none';
        } else if (e.touches.length === 2) {
            touchStartDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            touchStartZoom = targetZoom;
        }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - touchPrevX;
            const dy = e.touches[0].clientY - touchPrevY;
            if (Math.abs(dx) > 2 || Math.abs(dy) > 2) didDrag = true;
            earthGroup.rotateOnWorldAxis(_dragVecY, dx * 0.005);
            _dragVecX.set(1, 0, 0).applyQuaternion(earthGroup.quaternion).normalize();
            earthGroup.rotateOnWorldAxis(_dragVecX, dy * 0.005);
            touchPrevX = e.touches[0].clientX;
            touchPrevY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, touchStartZoom * (dist / touchStartDist)));
            updateZoomIndicator();
        }
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        isDragging = false;
        setTimeout(() => { if (!isDragging) autoRotateEnabled = true; }, 1500);
        tooltip.style.display = 'none';
    }, { passive: false });

    // ===== 缩放按钮 =====
    document.getElementById('mapZoomIn')?.addEventListener('click', () => {
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom / 1.35));
        updateZoomIndicator();
    });
    document.getElementById('mapZoomOut')?.addEventListener('click', () => {
        targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom * 1.35));
        updateZoomIndicator();
    });
    document.getElementById('mapReset')?.addEventListener('click', () => {
        resetView();
    });

    // ===== 筛选器更新 =====
    document.addEventListener('filtersUpdated', () => {
        createMarkers();
    });

    // ===== 窗口大小调整（防抖处理，避免频繁重建）=====
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const rect = container.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            if (w > 0 && h > 0) {
                renderer.setSize(w, h);
                camera.aspect = w / h;
                camera.updateProjectionMatrix();
            }
        }, 150);
    });

    // ===== 隐藏骨架屏 =====
    setTimeout(() => {
        const skeleton = document.querySelector('.map-skeleton');
        if (skeleton) skeleton.classList.add('hidden');
    }, 300);

    // ===== 初始标记和指示器 =====
    createMarkers();
    updateZoomIndicator();

    // ===== 渲染循环（优化：缓存对象、空闲降帧、避免 GC）=====
    const _rotAxisY = new THREE.Vector3(0, 1, 0);  // 缓存旋转轴
    const IDLE_SKIP = 5;  // 空闲时每 6 帧渲染 1 次 ≈ 10fps
    let _lastFrameTime = performance.now();
    let _idleFrames = 0;

    function animate(now) {
        earthAnimationId = requestAnimationFrame(animate);

        const rawDt = (now - _lastFrameTime) / 1000;
        const dt = Math.min(rawDt, 0.1);
        _lastFrameTime = now;

        const isZooming = Math.abs(targetZoom - currentZoom) > 0.02;
        const isRotating = autoRotateEnabled && !isDragging;

        // 空闲帧跳过：无交互时降低渲染频率
        if (!isRotating && !isZooming && !isDragging) {
            _idleFrames++;
            if (_idleFrames % (IDLE_SKIP + 1) !== 0) return;
        } else {
            _idleFrames = 0;
        }

        // 自动旋转（复用缓存的 Vector3，避免 GC）
        if (isRotating) {
            earthGroup.rotateOnWorldAxis(_rotAxisY, autoRotateSpeed * dt * (Math.PI / 180));
        }

        // 平滑缩放
        if (isZooming) {
            currentZoom += (targetZoom - currentZoom) * 8 * dt;
            if (Math.abs(targetZoom - currentZoom) < 0.01) currentZoom = targetZoom;
        }
        camera.position.z = currentZoom;

        // 相机位置变动时才更新大气着色器
        if (isZooming || isRotating || isDragging) {
            atmosMaterial.uniforms.uViewPosition.value.copy(camera.position);
            outerAtmosMaterial.uniforms.uViewPosition.value.copy(camera.position);
        }

        // 标记脉冲（用 rAF 时间戳，避免额外 performance.now() 调用）
        const time = now * 0.001;
        for (let i = 0, len = markerDataList.length; i < len; i++) {
            const md = markerDataList[i];
            if (hoveredMarker && md === hoveredMarker) continue;
            md.sprite.scale.setScalar(md.baseScale * (1 + Math.sin(time * 2.5 + i * 0.3) * 0.12));
        }

        renderer.render(scene, camera);
    }

    // 存储全局引用
    earthGlobe = {
        scene, camera, renderer, earthGroup, markersGroup,
        raycaster, markerDataList, createMarkers, clearMarkers,
        get targetZoom() { return targetZoom; },
        set targetZoom(v) { targetZoom = v; },
        get autoRotateEnabled() { return autoRotateEnabled; },
        set autoRotateEnabled(v) { autoRotateEnabled = v; },
        resetView, updateZoomIndicator
    };

    animate(performance.now());
}
// ===== 初始化图表（Chart.js）=====
function initCharts() {
    const defaults = getChartDefaults();
    
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Accidents',
                data: [],
                borderColor: '#0066CC',
                backgroundColor: 'rgba(0, 102, 204, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#0066CC',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }, {
                label: 'Fatalities',
                data: [],
                borderColor: '#ff3344',
                backgroundColor: 'rgba(255, 51, 68, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: '#ff3344',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const year = trendChart.data.labels[index];
                    const yearMin = document.getElementById('year-min');
                    const yearMax = document.getElementById('year-max');
                    if (yearMin && yearMax) {
                        yearMin.value = year;
                        yearMax.value = year;
                        const yearMinVal = document.getElementById('year-min-val');
                        const yearMaxVal = document.getElementById('year-max-val');
                        if (yearMinVal) yearMinVal.textContent = year;
                        if (yearMaxVal) yearMaxVal.textContent = year;
                        updateFilterState();
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0066CC',
                    bodyColor: '#333333',
                    borderColor: 'rgba(0, 102, 204, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    titleFont: { family: "'Segoe UI', sans-serif", size: 11 }
                }
            },
            scales: {
                x: {
                    grid: { color: defaults.gridColor },
                    ticks: { maxTicksLimit: 10 }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor },
                    title: {
                        display: true,
                        text: 'Accidents',
                        color: '#555566'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: {
                        display: true,
                        text: 'Fatalities',
                        color: '#555566'
                    }
                }
            }
        }
    });
    
    const causeCtx = document.getElementById('causeChart').getContext('2d');
    causeChart = new Chart(causeCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ffb800',
                    '#3b82f6',
                    '#a855f7',
                    '#ff3344',
                    '#555566'
                ],
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12,
                        padding: 12,
                        font: { size: 11 }
                    }
                }
            }
        }
    });
    
    const fatalityCtx = document.getElementById('fatalityChart').getContext('2d');
    const airlineColors = [
        '#0066CC', '#E85D3A', '#2E9A5E', '#8B5CF6', '#F59E0B',
        '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#A855F7'
    ];
    fatalityChart = new Chart(fatalityCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Fatalities',
                data: [],
                backgroundColor: airlineColors.slice(0, 10),
                borderRadius: 4,
                barThickness: 14,
                categoryPercentage: 0.7,
                barPercentage: 0.75
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#0066CC',
                    bodyColor: '#333333',
                    borderColor: 'rgba(0, 102, 204, 0.3)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor }
                },
                y: {
                    grid: { display: false }
                }
            }
        }
    });
    
    const survivalCtx = document.getElementById('survivalChart').getContext('2d');
    survivalChart = new Chart(survivalCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Fatal',
                data: [],
                backgroundColor: '#ff3344'
            }, {
                label: 'Injured',
                data: [],
                backgroundColor: '#ffb800'
            }, {
                label: 'Uninjured',
                data: [],
                backgroundColor: '#00cc88'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 11 }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: defaults.gridColor }
                }
            }
        }
    });
}
// ===== 更新仪表盘数据图表 =====
let updateTimeout;
function updateDashboard() {
    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
        const { filteredAccidents } = AppState;
        
        needsRedraw = true;
        
        updateStatCards(filteredAccidents);
        updateTrendChart(filteredAccidents);
        updateCauseChart(filteredAccidents);
        updateFatalityChart(filteredAccidents);
        updateRegionList(filteredAccidents);
        updatePhaseGrid(filteredAccidents);
        updateSurvivalChart(filteredAccidents);
    }, 150);
}
// 【更新统计卡片/趋势图/原因图/航空公司图/区域列表/阶段分布/生存率】
function updateStatCards(accidents) {
    const totalAccidents = accidents.length;
    const totalFatalities = accidents.reduce((sum, a) => sum + a.fatalities, 0);
    
    const totalEl = document.getElementById('stat-total-accidents');
    const fatEl = document.getElementById('stat-total-fatalities');
    
    animateNumber(totalEl, totalAccidents);
    animateNumber(fatEl, totalFatalities);
    
    const yearCounts = {};
    accidents.forEach(a => {
        const year = getYearFromDate(a.date);
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });
    
    let safestYear = '--';
    let minAccidents = Infinity;
    Object.entries(yearCounts).forEach(([year, count]) => {
        if (count < minAccidents) {
            minAccidents = count;
            safestYear = year;
        }
    });
    
    const safestYearEl = document.getElementById('stat-safest-year');
    if (safestYearEl) {
        safestYearEl.textContent = safestYear === '--' ? safestYear : `${safestYear}`;
    }
    
    const airlineCounts = {};
    accidents.forEach(a => {
        airlineCounts[a.airline] = (airlineCounts[a.airline] || 0) + 1;
    });
    
    let highRiskAirline = '--';
    let maxAccidents = 0;
    Object.entries(airlineCounts).forEach(([airline, count]) => {
        if (count > maxAccidents) {
            maxAccidents = count;
            highRiskAirline = airline;
        }
    });
    
    const riskAirlineEl = document.getElementById('stat-high-risk-airline');
    if (riskAirlineEl) {
        riskAirlineEl.textContent = highRiskAirline === '--' ? highRiskAirline : `${td(highRiskAirline)}`;
    }
}
function updateTrendChart(accidents) {
    const yearData = {};
    
    accidents.forEach(accident => {
        const year = getYearFromDate(accident.date);
        if (!yearData[year]) {
            yearData[year] = { accidents: 0, fatalities: 0 };
        }
        yearData[year].accidents++;
        yearData[year].fatalities += accident.fatalities;
    });
    
    const yearLabels = Object.keys(yearData).sort();
    const accidentCounts = yearLabels.map(y => yearData[y].accidents);
    const fatalityCounts = yearLabels.map(y => yearData[y].fatalities);
    
    trendChart.data.labels = yearLabels;
    trendChart.data.datasets[0].data = accidentCounts;
    trendChart.data.datasets[1].data = fatalityCounts;
    trendChart.update('active');
}
function updateCauseChart(accidents) {
    const causeCounts = {};
    accidents.forEach(a => {
        causeCounts[a.cause] = (causeCounts[a.cause] || 0) + 1;
    });
    
    const causes = Object.keys(causeCounts);
    const counts = causes.map(c => causeCounts[c]);
    
    causeChart.data.labels = causes.map(c => t('cause.' + c));
    causeChart.data.datasets[0].data = counts;
    causeChart.update('active');
}
function updateFatalityChart(accidents) {
    const airlineFatalities = {};
    accidents.forEach(a => {
        airlineFatalities[a.airline] = (airlineFatalities[a.airline] || 0) + a.fatalities;
    });
    
    const sorted = Object.entries(airlineFatalities)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    const labels = sorted.map(([name]) => {
        const translated = td(name);
        return translated.length > 20 ? translated.substring(0, 18) + '...' : translated;
    });
    const data = sorted.map(([, count]) => count);
    
    fatalityChart.data.labels = labels;
    fatalityChart.data.datasets[0].data = data;
    fatalityChart.update('active');
}
function updateRegionList(accidents) {
    const regionCounts = {};
    accidents.forEach(a => {
        regionCounts[a.region] = (regionCounts[a.region] || 0) + 1;
    });
    
    const sorted = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...sorted.map(([, c]) => c));
    
    const container = document.getElementById('regionList');
    if (!container) return;
    
    container.innerHTML = sorted.map(([region, count]) => `
        <div class="region-item">
            <span class="region-name">${td(region)}</span>
            <div class="region-bar-container">
                <div class="region-bar" style="width: ${(count / maxCount) * 100}%"></div>
            </div>
            <span class="region-count">${count}</span>
        </div>
    `).join('');
}
function updatePhaseGrid(accidents) {
    const phaseCounts = {};
    accidents.forEach(a => {
        phaseCounts[a.phase] = (phaseCounts[a.phase] || 0) + 1;
    });
    
    const phases = ['Takeoff', 'Landing', 'Cruise', 'Taxi'];
    const colors = ['#ffb800', '#3b82f6', '#a855f7', '#00cc88'];
    
    const container = document.getElementById('phaseGrid');
    if (!container) return;
    
    container.innerHTML = phases.map((phase, i) => `
        <div class="phase-item">
            <div class="phase-dot" style="background: ${colors[i]}"></div>
            <span class="phase-name">${t('phase.' + phase)}</span>
            <span class="phase-count">${phaseCounts[phase] || 0}</span>
        </div>
    `).join('');
}
function updateSurvivalChart(accidents) {
    const stats = { fatal: 0, injured: 0, uninjured: 0 };

    accidents.forEach(a => {
        stats.fatal += a.fatalities || 0;
        stats.injured += a.injuries || 0;
        stats.uninjured += Math.max(0, (a.totalOccupants || 0) - (a.fatalities || 0) - (a.injuries || 0));
    });
    
    survivalChart.data.labels = ['Total'];
    survivalChart.data.datasets[0].data = [stats.fatal];
    survivalChart.data.datasets[1].data = [stats.injured];
    survivalChart.data.datasets[2].data = [stats.uninjured];
    survivalChart.update();
}