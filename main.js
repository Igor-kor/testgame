// main.js
import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

// Инициализация сцены, камеры и рендерера
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Переменные для интерфейса
let ammo = 100;
let health = 100;
let kills = 0;
let gameOver = false;

// Загрузка текстуры для скайбокса
const textureLoader = new THREE.TextureLoader();
const skyboxTexture = textureLoader.load('textures/skybox.png');

// Создание материала с использованием текстуры
const skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide });

// Создание геометрии куба для скайбокса
const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);

// Создание меша с использованием геометрии и материала
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

// Добавление меша в сцену
scene.add(skybox);

// Элементы интерфейса (HUD)
const ammoDisplay = document.getElementById('ammo');
const healthDisplay = document.getElementById('health');
const killsDisplay = document.getElementById('kills');

// Загрузка звука выстрела
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/509468-SFX-SP-Riffle04-Shot-Single-02.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
});

// Проверка на существование элементов интерфейса
if (ammoDisplay && healthDisplay && killsDisplay) {
    // Функция обновления интерфейса
    function updateHUD() {
        ammoDisplay.textContent = 'Ammo: ' + ammo;
        healthDisplay.textContent = 'Health: ' + health;
        killsDisplay.textContent = 'Kills: ' + kills;
    }

    // Функция для сброса значений и перезапуска игры
    function resetGame() {
        ammo = 10;
        health = 100;
        kills = 0;
        gameOver = false;
        monster.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
        camera.position.set(0, 2, 5);
        updateHUD();
        animate();
    }

    // Добавление источника света
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10).normalize();
    scene.add(light);

    // Плоскость земли
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({color: 0x00aa00});
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5; // Поднять плоскость земли немного выше
    scene.add(ground);

    // Загрузка модели монстра
    const loader = new GLTFLoader();
    let monster;
    loader.load('models/sas_red.glb', function (gltf) {
        monster = gltf.scene;
        monster.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
        scene.add(monster);
    });
    // Начальная позиция камеры
    camera.position.z = 5;
    camera.position.y = 2;
    // Загрузка модели пистолета и добавление к камере
    let gun;
    loader.load('models/pistol__usp_no_silencer_weapon_model_cs2.glb', function (gltf) {
        gun = gltf.scene;
        gun.scale.set(2, 2, 2); // Увеличение масштаба модели пистолета
        gun.position.set(0.5, -0.5, -1.5); // Изменение позиции пистолета относительно камеры
        camera.add(gun);
    });

    // Управление стрелками для перемещения камеры
    document.addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowUp':
                camera.position.z -= 0.1;
                break;
            case 'ArrowDown':
                camera.position.z += 0.1;
                break;
            case 'ArrowLeft':
                camera.position.x -= 0.1;
                break;
            case 'ArrowRight':
                camera.position.x += 0.1;
                break;
        }
    });

    // Выстрелы: уменьшение боезапаса и уничтожение монстра
    document.addEventListener('click', function () {
        if (ammo > 0 && monster) {
            ammo--;
            updateHUD();
            sound.stop();
            sound.play(); // Воспроизведение звука выстрела

            // Проверка попадания по монстру
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
            const intersects = raycaster.intersectObject(monster, true);

            if (intersects.length > 0) {
                kills++;
                updateHUD();
                monster.position.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5); // Телепортация монстра на случайное место
            }
        }
    });

    // Переменные для плавного перемещения монстра
    let monsterSpeed = 0.01;
    let targetPosition = new THREE.Vector3(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);

    // Функция для плавного перемещения монстра
    function moveMonster() {
        if (monster && monster.position.distanceTo(targetPosition) < 0.1) {
            targetPosition.set(Math.random() * 10 - 5, 0.5, Math.random() * 10 - 5);
        } else if (monster) {
            monster.position.lerp(targetPosition, monsterSpeed);
        }
    }

    // Функция для проверки расстояния между монстром и камерой
    function checkCollision() {
        if (monster && monster.position.distanceTo(camera.position) < 2) {
            health -= 1;
            updateHUD();
            if (health <= 0) {
                gameOver = true;
                alert('Game Over');
                resetGame();
            }
        }
    }

    // Обновление сцены
    function animate() {
        if (!gameOver) {
            requestAnimationFrame(animate);
            moveMonster();
            checkCollision();
            renderer.render(scene, camera);
        }
    }
    // Переменные для хранения углов поворота камеры
    let cameraRotationX = 0;
    let cameraRotationY = 0;

    // Обработчик событий для движения мыши
    document.addEventListener('mousemove', (event) => {
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        // Обновление углов поворота камеры
        cameraRotationX -= movementY * 0.002;
        cameraRotationY -= movementX * 0.002;

        // Ограничение углов поворота по оси X (чтобы камера не переворачивалась)
        cameraRotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotationX));

        // Обновление ориентации камеры
        camera.rotation.x = cameraRotationX;
        camera.rotation.y = cameraRotationY;
    });
    // Запуск анимации
    animate();

    // Адаптация под изменение размеров окна
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });
} else {
    console.error('Elements with id "ammo", "health", and "kills" are required in the HTML.');
}
