/**
 * Dotted Surface Background Module
 * Three.js animated particle background
 */

(function() {
    const container = document.getElementById('dottedSurface');
    if (!container) return;

    const SEPARATION = 150;
    const AMOUNTX = 40;
    const AMOUNTY = 60;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 2000, 10000);

    const camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
    );
    camera.position.set(0, 355, 1220);

    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(scene.fog.color, 0);
    container.appendChild(renderer.domElement);

    // Create particles
    const positions = [];
    const colors = [];

    // Theme colors - cyan accent
    const accentColor = new THREE.Color(0x00f0ff);
    const dimColor = new THREE.Color(0x2a2a35);

    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            const y = 0;
            const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

            positions.push(x, y, z);

            // Mix cyan accent with dim colors for variety
            const mixFactor = Math.random() * 0.5 + 0.5;
            const color = dimColor.clone().lerp(accentColor, mixFactor * 0.3);
            colors.push(color.r, color.g, color.b);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 6,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId;

    // Animation function
    function animate() {
        animationId = requestAnimationFrame(animate);

        const positionAttribute = geometry.attributes.position;
        const positionsArray = positionAttribute.array;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                const index = i * 3;

                // Animate Y position with sine waves
                positionsArray[index + 1] =
                    Math.sin((ix + count) * 0.3) * 50 +
                    Math.sin((iy + count) * 0.5) * 50;

                i++;
            }
        }

        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
        count += 0.05;
    }

    // Handle window resize
    function handleResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup function (for potential future use)
    window.dottedSurfaceCleanup = function() {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        if (container && renderer.domElement) {
            container.removeChild(renderer.domElement);
        }
    };
})();
