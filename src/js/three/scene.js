import * as THREE from 'three';

let scene, camera, renderer, garmentMesh;
let currentMaterial;

export function initScene(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Cleanup previous renderer to avoid "Too many active WebGL contexts"
    if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
    }

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1A1A1A); // Dark background

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true, // Necesario para capturar screenshots
        alpha: true // Permite fondo transparente
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Placeholder Garment (Simple T-Shape using Group)
    createPlaceholderGarment();

    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        if (garmentMesh) {
            garmentMesh.rotation.y += 0.005;
        }
        renderer.render(scene, camera);
    }
    animate();

    // Handle Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function createPlaceholderGarment() {
    const group = new THREE.Group();

    // Create material with default white color
    currentMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.8,
        metalness: 0.2
    });

    // Body
    const bodyGeometry = new THREE.BoxGeometry(2, 3, 0.5);
    const body = new THREE.Mesh(bodyGeometry, currentMaterial);
    group.add(body);

    // Sleeves
    const sleeveGeometry = new THREE.BoxGeometry(1, 0.8, 0.5);

    const leftSleeve = new THREE.Mesh(sleeveGeometry, currentMaterial);
    leftSleeve.position.set(-1.5, 1, 0);
    group.add(leftSleeve);

    const rightSleeve = new THREE.Mesh(sleeveGeometry, currentMaterial);
    rightSleeve.position.set(1.5, 1, 0);
    group.add(rightSleeve);

    garmentMesh = group;
    scene.add(garmentMesh);
}

export function updateGarmentColor(colorHex) {
    if (currentMaterial) {
        currentMaterial.color.set(colorHex);
    }
}

export function updateGarmentTexture(textureName) {
    if (!currentMaterial) return;

    // Update material properties based on texture type
    switch (textureName) {
        case 'algodon':
            currentMaterial.roughness = 0.9;
            currentMaterial.metalness = 0.1;
            break;
        case 'licra':
            currentMaterial.roughness = 0.3;
            currentMaterial.metalness = 0.4;
            break;
        case 'denim':
            currentMaterial.roughness = 0.95;
            currentMaterial.metalness = 0.05;
            break;
        case 'cuero':
            currentMaterial.roughness = 0.4;
            currentMaterial.metalness = 0.6;
            break;
        case 'lana':
            currentMaterial.roughness = 1.0;
            currentMaterial.metalness = 0.0;
            break;
        default:
            currentMaterial.roughness = 0.8;
            currentMaterial.metalness = 0.2;
    }
    currentMaterial.needsUpdate = true;
}

export function updateGarmentType(type) {
    if (!scene || !garmentMesh) return;

    // Remove old garment
    scene.remove(garmentMesh);

    // Create new garment based on type
    const group = new THREE.Group();

    switch (type.toLowerCase()) {
        case 'polera':
        case 'hoodie':
            // Hoodie: larger body with hood
            const hoodieBody = new THREE.Mesh(
                new THREE.BoxGeometry(2.2, 3.2, 0.6),
                currentMaterial
            );
            group.add(hoodieBody);

            // Hood
            const hood = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.8, 0.8),
                currentMaterial
            );
            hood.position.set(0, 1.8, 0.2);
            group.add(hood);

            // Sleeves
            const hoodieSleeveL = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.9, 0.6),
                currentMaterial
            );
            hoodieSleeveL.position.set(-1.6, 1, 0);
            group.add(hoodieSleeveL);

            const hoodieSleeveR = new THREE.Mesh(
                new THREE.BoxGeometry(1.1, 0.9, 0.6),
                currentMaterial
            );
            hoodieSleeveR.position.set(1.6, 1, 0);
            group.add(hoodieSleeveR);
            break;

        case 'casaca':
        case 'jacket':
            // Jacket: structured with collar
            const jacketBody = new THREE.Mesh(
                new THREE.BoxGeometry(2.1, 3, 0.5),
                currentMaterial
            );
            group.add(jacketBody);

            // Collar
            const collar = new THREE.Mesh(
                new THREE.BoxGeometry(1.5, 0.3, 0.3),
                currentMaterial
            );
            collar.position.set(0, 1.6, 0.15);
            group.add(collar);

            // Sleeves
            const jacketSleeveL = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 0.5),
                currentMaterial
            );
            jacketSleeveL.position.set(-1.5, 1, 0);
            group.add(jacketSleeveL);

            const jacketSleeveR = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 0.5),
                currentMaterial
            );
            jacketSleeveR.position.set(1.5, 1, 0);
            group.add(jacketSleeveR);
            break;

        case 'camisa':
        case 'shirt':
            // Shirt: slim fit with collar
            const shirtBody = new THREE.Mesh(
                new THREE.BoxGeometry(1.8, 3, 0.4),
                currentMaterial
            );
            group.add(shirtBody);

            // Collar
            const shirtCollar = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.2, 0.2),
                currentMaterial
            );
            shirtCollar.position.set(0, 1.6, 0.1);
            group.add(shirtCollar);

            // Sleeves (shorter)
            const shirtSleeveL = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.4),
                currentMaterial
            );
            shirtSleeveL.position.set(-1.3, 1.2, 0);
            group.add(shirtSleeveL);

            const shirtSleeveR = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.4),
                currentMaterial
            );
            shirtSleeveR.position.set(1.3, 1.2, 0);
            group.add(shirtSleeveR);
            break;

        default: // polo / t-shirt
            const poloBody = new THREE.Mesh(
                new THREE.BoxGeometry(2, 3, 0.5),
                currentMaterial
            );
            group.add(poloBody);

            const poloSleeveL = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 0.5),
                currentMaterial
            );
            poloSleeveL.position.set(-1.5, 1, 0);
            group.add(poloSleeveL);

            const poloSleeveR = new THREE.Mesh(
                new THREE.BoxGeometry(1, 0.8, 0.5),
                currentMaterial
            );
            poloSleeveR.position.set(1.5, 1, 0);
            group.add(poloSleeveR);
    }

    garmentMesh = group;
    scene.add(garmentMesh);
}

export function getDesignConfig() {
    // Return current state for saving
    const color = currentMaterial ? currentMaterial.color.getHexString() : 'ffffff';
    return {
        color: `#${color}`,
        model: 't-shirt-basic'
    };
}

export function captureScreenshot() {
    if (!renderer) return null;

    // Render one frame to ensure everything is up to date
    renderer.render(scene, camera);

    // Get the canvas as a data URL (PNG with transparency)
    return renderer.domElement.toDataURL('image/png');
}
