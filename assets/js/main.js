onload = function update() {

    let SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        mouseX = 0, mouseY = 0,

        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2,

        audioSource, audioAnalyser, bufferLength, audioContext, dataArray,

        camera, scene, renderer, composer;


    let audio = new Audio();
    audio.src = 'assets/audio/Radiohead - Burn The Witch.mp3';
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

        renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        renderer.setClearColor( 0xffffff, 0);
        container.appendChild(renderer.domElement);

        //Start Particles
        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteMaterial({
            color: 0xffffff,
            program: function (context) {
                context.beginPath();
                context.arc(0, 0, 0.5, 0, PI2, true);
                context.fill();
            }
        });

        for (var i = 0; i < 1200; i++) {

            let particle = new THREE.Sprite(material);
            particle.position.x = Math.random() - 1;
            particle.position.y = Math.random() * 2 - 1;
            particle.position.z = Math.random() * 2 - 1;
            particle.position.normalize();
            particle.position.setLength(100);
            particle.position.x = particle.position.x - 20;
            particle.scale.multiplyScalar(4);

            particles.push(particle);
            scene.add(particle);

            let particleMirrored = particle.clone();
            particleMirrored.position.negate();
            particleMirrored.position.y = particleMirrored.position.y * (-1);
            particleMirrored.position.z = particleMirrored.position.z * (-1);

            particlesMirror.push(particleMirrored);

            scene.add(particleMirrored);

        }
        //End Particles

        let sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000, overdraw: true});

        let radius = 350,
            segments = 16,
            rings = 16;

        sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

        scene.add(sphere);

        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );

        var effect = new THREE.ShaderPass( THREE.DotScreenShader );
        effect.uniforms[ 'scale' ].value = 4;
        //composer.addPass( effect );

        var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
        effect.uniforms[ 'amount' ].value = 0.0015;
        effect.renderToScreen = true;
        //composer.addPass( effect );

        console.log(composer);

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
        composer.setSize( window.innerWidth, window.innerHeight );

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
        composer.render();
    };

    const updateCamera = function(){
        camera.position.x += ( mouseX - camera.position.x ) * .05;
        camera.position.y += ( -mouseY + 200 - camera.position.y ) * .05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    init();

};