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
    opacity: 0.3 // 少し透明にする
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

//
// ...（既存コード省略）...

// ===== レーザー変数 =====
// let laser = null;
// let laserTimeout = null;
// const laserColor = 0xff0099;

// ===== レーザー発射関数 =====
// function shootLaser(from, to) {
//     if (laser) {
//         scene.remove(laser);
//         laser.geometry.dispose();
//         laser.material.dispose();
//         laser = null;
//     }
    
//     // レーザーの長さと方向を計算
//     const direction = new THREE.Vector3().subVectors(to, from);
//     const distance = direction.length();
    
//     // 円筒形のジオメトリでレーザーを作成（太いレーザー）
//     const geometry = new THREE.CylinderGeometry(0.02, 0.02, distance, 8);
//     const material = new THREE.MeshBasicMaterial({ 
//         color: laserColor,
//         transparent: true,
//         opacity: 0.8
//     });
    
//     laser = new THREE.Mesh(geometry, material);
    
//     // レーザーの位置と向きを設定
//     laser.position.copy(from).add(direction.multiplyScalar(0.5));
//     laser.lookAt(to);
//     laser.rotateX(Math.PI / 2); // 円筒の向きを調整
    
//     scene.add(laser);

//     // 消す
//     if (laserTimeout) clearTimeout(laserTimeout);
//     laserTimeout = setTimeout(() => {
//         if (laser) {
//             scene.remove(laser);
//             laser.geometry.dispose();
//             laser.material.dispose();
//             laser = null;
//         }
//     }, 500);
// }

// ===== マウスクリックで発射 =====
// window.addEventListener('mousedown', (event) => {
//     const mouseNDC = new THREE.Vector2(
//         (event.clientX / window.innerWidth) * 2 - 1,
//         -(event.clientY / window.innerHeight) * 2 + 1
//     );
//     const raycaster = new THREE.Raycaster();
//     raycaster.setFromCamera(mouseNDC, camera);
//     const from = camera.position.clone();
//     const to = raycaster.ray.at(20, new THREE.Vector3());
//     shootLaser(from, to);
// });

// ===== トップへ戻るボタン機能 =====
const backToTopButton = document.getElementById('back-to-top');

if (backToTopButton) {
    // スクロール時の処理
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // 300pxスクロールしたら表示
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });

    // ボタンクリック時の処理
    backToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // スムーズなスクロール
        });
    });
}
