onload = function update() {

    let SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        mouseX = 0, mouseY = 0,

        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2,

        audioSource, audioAnalyser, bufferLength, audioContext, dataArray,

        camera, scene, renderer;


    let audio = new Audio();
    audio.src = 'assets/audio/strunk.mp3';
    audio.controls = true;
    audio.loop = true;
    audio.autoplay = true;

    let paused = false;

    //const audioPlayer = document.getElementById('audioPlayer');

    let sphere;
    const particles = [];
    const particlesMirror = [];

    let hint = document.getElementById('hint'),
        progress = document.getElementById('progress');

    function init() {

        initAudio();

        let container;

        container = document.createElement('div');

        document.body.appendChild(container);

        camera = new THREE.PerspectiveCamera(75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000);
        camera.position.z = 2000;

        scene = new THREE.Scene();

        renderer = new THREE.CanvasRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.setClearColor( 0xffffff, 0);
        container.appendChild(renderer.domElement);

        var geometry = new THREE.PlaneBufferGeometry( 200, 3000 );
        geometry.rotateX( - Math.PI / 2 );
        var materialPlane = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, overdraw: true } );
        plane = new THREE.Mesh( geometry, materialPlane );
        plane.position.y = -600;
        plane.position.z = -100;
        //scene.add(plane);


        //Start Particles
        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteCanvasMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 0.5, 0, PI2, true);
                context.fill();
            }
        });

        for (var i = 0; i < 1000; i++) {

            let particle = new THREE.Sprite(material);
            particle.position.x = Math.random() - 1;
            particle.position.y = Math.random() * 2 - 1;
            particle.position.z = Math.random() * 2 - 1;
            particle.position.normalize();
            particle.position.multiplyScalar(100);
            particle.position.x = particle.position.x - 20;
            particle.scale.multiplyScalar(4);

            let particleMirrored = particle.clone();
            particleMirrored.position.negate();
            particleMirrored.position.y = particleMirrored.position.y * (-1);
            particleMirrored.position.z = particleMirrored.position.z * (-1);

            particles.push(particle);
            particlesMirror.push(particleMirrored);

            scene.add(particle);
            scene.add(particleMirrored);

        }
        //End Particles

        let sphereMaterial =
            new THREE.MeshLambertMaterial({color: 0x000000, overdraw: true});

        let radius = 350,
            segments = 16,
            rings = 16;

        sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);
        
        scene.add(sphere);

        //Light
        var pointLight =
            new THREE.PointLight(0x555555);

        pointLight.position.x = 10;
        pointLight.position.y = -350;
        pointLight.position.z = 130;

        //scene.add(pointLight);


        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

        window.addEventListener('resize', onWindowResize, false);

        update();

    }

    function initAudio(){

        //window.AudioContext = window.AudioContext||window.webkitAudioContext;
        audioContext = new webkitAudioContext();

        audioAnalyser = audioContext.createAnalyser();

        audioAnalyser.fftSize = 2048;
        bufferLength = audioAnalyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        audioAnalyser.getByteTimeDomainData(dataArray);

        audioSource = audioContext.createMediaElementSource(audio);
        audioSource.connect(audioAnalyser);
        audioAnalyser.connect(audioContext.destination);

    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    //

    function onDocumentMouseMove(event) {

        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart(event) {

        if (event.touches.length > 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

        }

    }

    function onDocumentTouchMove(event) {

        if (event.touches.length == 1) {

            event.preventDefault();

            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;

        }

    }

    document.body.onkeydown = function(e) {
        if(e.keyCode == 32) {
            e.preventDefault();
            if(paused) {
                paused = false;
                audio.play();
                hint.innerHTML = "space to pause";
            } else {
                paused = true;
                audio.pause();
                hint.innerHTML = "space to play";
            }
        }
    };


    const update = function () {
        requestAnimationFrame(update);

        render();
    };


    const render = function () {


        audioAnalyser.getByteTimeDomainData(dataArray);

        particles.forEach(function (p, i){

            p.position.setLength((dataArray[i] * 2) + 300);
            particlesMirror[i].position.setLength((dataArray[i] * 2) + 300);

        });

        let prog = (audio.currentTime / audio.duration) * 100;

        progress.style.width = prog + "%";

        updateCamera();
    };

    const updateCamera = function(){
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( -mouseY + 200 - camera.position.y ) * .05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    init();

};