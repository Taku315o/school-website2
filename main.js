import * as THREE from 'three';

// ローダーを非表示にする関数
function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); // フェードアウトアニメーションの完了後に要素を削除
    }
}

// ページが完全に読み込まれたらローダーを非表示にする
window.addEventListener('load', () => {
    hideLoader();
});

// 追加の安全策として、DOMContentLoadedでも実行
document.addEventListener('DOMContentLoaded', () => {
    // 最低限の表示時間を設けて、ローディングを感じさせる
    setTimeout(hideLoader, 1000);
});

// 必須の3要素：シーン、カメラ、レンダラー
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    alpha: true, // 背景を透過させる
    antialias: true // アンチエイリアスを有効に
});

// キャンバスを配置するコンテナを取得
const container = document.getElementById('three-canvas-container');
if (!container) {
    console.error('three-canvas-container not found!');
} else {
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
}

// カメラの位置を設定
camera.position.z = 5;

// --- パーティクルの作成 ---
const particleCount = 7000; // パーティクルの数
const positions = new Float32Array(particleCount * 3); // 各パーティクルの(x, y, z)座標を格納

for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // 球状にパーティクルを配置
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const radius = Math.random() * 10 + 2; // 半径にばらつきを持たせる
    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const material = new THREE.PointsMaterial({
    color: 0xffffff, // パーティクルの色
    size: 0.03, // パーティクルのサイズ
    blending: THREE.AdditiveBlending, // 加算合成で明るく輝く効果
    transparent: true, // 透過を有効に
    opacity: 0.8 // 少し透明にする
});

const particles = new THREE.Points(geometry, material);
scene.add(particles);

// --- マウス座標の取得 ---
const mouse = new THREE.Vector2();
window.addEventListener('mousemove', (event) => {
    // マウス座標を-1から1の範囲に正規化
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// --- アニメーションループ ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // パーティクルをゆっくりと回転させる
    particles.rotation.y = elapsedTime * 0.05;
    particles.rotation.x = elapsedTime * 0.05;
    
    // マウスの位置に応じてカメラ（視点）を少し動かす
    // これにより、マウスを動かすとパーティクルが追従するように見える
    const targetX = mouse.x * 0.5;
    const targetY = mouse.y * 0.5;
    
    // Lerp（線形補間）を使って滑らかな動きにする
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (targetY - camera.position.y) * 0.02;

    // 視点をシーンの中心に保つ
    camera.lookAt(scene.position);

    // レンダリング
    renderer.render(scene, camera);
}

animate();

// --- ウィンドウリサイズ対応 ---
window.addEventListener('resize', () => {
    // カメラのアスペクト比を更新
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    // レンダラーのサイズを更新
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
});