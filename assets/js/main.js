const vizualiser = function() {

    this.length = 400;

    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;

    this.mouseX = 0;
    this.mouseY = 0;

    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;

    this.audioSource = null;
    this.audioAnalyser = null;
    this.bufferLength = null;
    this.audioContext = null;
    this.dataArray = null;


    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.composer = null;


    this.audio = new Audio();
    this.audio.src = 'assets/audio/Radiohead - Burn The Witch.mp3';
    this.audio.controls = true;
    this.audio.loop = true;
    this.audio.autoplay = true;

    this.paused = false;


    this.N_RING = 10;
    this.intensity = 0.5;

    this.sphere = null;
    this.particles = [];
    this.particlesMirror = [];

    this.hint = document.getElementById('hint');
    this.progress = document.getElementById('progress');


    this.init = function() {

        this.initAudio();

        let container;

        container = document.createElement('div');

        document.body.appendChild(container);

        this.camera = new THREE.PerspectiveCamera(75, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000);
        this.camera.position.z = 2000;

        this.scene = new THREE.Scene();

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
        this.renderer.setClearColor( 0xffffff, 0);
        container.appendChild(this.renderer.domElement);

        //Start Particles
        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteMaterial({
            color: 0xffffff
        });

        for(let i = 0; i < this.N_RING; i++){
            let nParticles = 40 * (i + 1),
                radius = 20 * (i + 1),
                xDist = -500 / (i + 1);

            this.generateParticleRing(nParticles, radius, xDist, material);
        }

        console.log(this.particles.length * 2);

        //End Particles

        let sphereMaterial = new THREE.MeshLambertMaterial({color: 0x000000, overdraw: true});

        let radius = 350,
            segments = 16,
            rings = 16;

        this.sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, rings), sphereMaterial);

        this.scene.add(this.sphere);

        this.composer = new THREE.EffectComposer( this.renderer );
        this.composer.addPass( new THREE.RenderPass( this.scene, this.camera ) );

        var effect = new THREE.ShaderPass( THREE.DotScreenShader );
        effect.uniforms[ 'scale' ].value = 4;
        //composer.addPass( effect );

        var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
        effect.uniforms[ 'amount' ].value = 0.0015;
        effect.renderToScreen = true;
        //composer.addPass( effect );

        console.log(this.composer);

        document.addEventListener('mousemove', this.onDocumentMouseMove, false);
        document.addEventListener('touchstart', this.onDocumentTouchStart, false);
        document.addEventListener('touchmove', this.onDocumentTouchMove, false);

        window.addEventListener('resize', this.onWindowResize, false);

        this.update();

    };

    this.initAudio = function(){

        //window.AudioContext = window.AudioContext||window.webkitAudioContext;
        this.audioContext = new webkitAudioContext();

        this.audioAnalyser = this.audioContext.createAnalyser();

        this.audioAnalyser.fftSize = 4096;
        this.bufferLength = this.audioAnalyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.audioAnalyser.getByteTimeDomainData(this.dataArray);

        this.audioSource = this.audioContext.createMediaElementSource(this.audio);
        this.audioSource.connect(this.audioAnalyser);
        this.audioAnalyser.connect(this.audioContext.destination);

    };

    this.generateParticleRing = function(nParticles, radius, xDist, material){
        for (let i = 0; i < nParticles; i++) {

            let particle = new THREE.Sprite(material);
            particle.position.x = xDist;
            particle.position.y = (this.scene.position.y + radius * Math.cos(2 * Math.PI * i / nParticles));
            particle.position.z = (this.scene.position.z + radius * Math.sin(2 * Math.PI * i / nParticles));

            particle.position.normalize();
            particle.position.setLength(this.length);
            particle.scale.multiplyScalar(4);

            this.particles.push(particle);
            this.scene.add(particle);

            let particleMirrored = particle.clone();
            particleMirrored.position.negate();
            particleMirrored.position.y = particleMirrored.position.y * (-1);
            particleMirrored.position.z = particleMirrored.position.z * (-1);

            this.particlesMirror.push(particleMirrored);

            this.scene.add(particleMirrored);

        }
    };

    this.onWindowResize = function() {

        this.windowHalfX = window.innerWidth / 2;
        this.windowHalfY = window.innerHeight / 2;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize( window.innerWidth, window.innerHeight );

    };

    //

    this.onDocumentMouseMove = function(event) {

        this.mouseX = event.clientX - this.windowHalfX;
        this.mouseY = event.clientY - this.windowHalfY;
    };

    this.onDocumentTouchStart = function(event) {

        if (event.touches.length > 1) {

            event.preventDefault();

            this.mouseX = event.touches[0].pageX - this.windowHalfX;
            this.mouseY = event.touches[0].pageY - this.windowHalfY;

        }

    };

    this.onDocumentTouchMove = function(event) {

        if (event.touches.length == 1) {

            event.preventDefault();

            this.mouseX = event.touches[0].pageX - this.windowHalfX;
            this.mouseY = event.touches[0].pageY - this.windowHalfY;

        }

    };

    document.body.onkeydown = function(e) {
        if(e.keyCode == 32) {
            e.preventDefault();
            if(this.paused) {
                this.paused = false;
                this.audio.play();
                this.hint.innerHTML = "space to pause";
            } else {
                this.paused = true;
                this.audio.pause();
                this. hint.innerHTML = "space to play";
            }
        }
    };

    this.hint.onclick = function(e) {
        e.preventDefault();
        if(this.paused) {
            this.paused = false;
            this.audio.play();
            this.hint.innerHTML = "space to pause";
        } else {
            this.paused = true;
            this.audio.pause();
            this.hint.innerHTML = "space to play";
        }
    };


    this.update = function () {
        requestAnimationFrame(this.update.bind(this));

        this.render();
    };


    this.render = function () {


        this.audioAnalyser.getByteTimeDomainData(this.dataArray);

        let _self = this;

        this.particles.forEach(function (p, i){

            p.position.setLength((_self.dataArray[i] * _self.intensity) + _self.length);
            _self.particlesMirror[i].position.setLength((_self.dataArray[i] * _self.intensity) + _self.length);

        });

        let prog = (this.audio.currentTime / this.audio.duration) * 100;

        this.progress.style.width = prog + "%";

        this.updateCamera();
        //composer.render();
    };

    this.updateCamera = function(){
        this.camera.position.x = this.scene.position.x + 2000 * Math.cos(.3 * this.audio.currentTime );
        this.camera.position.z = this.scene.position.z + 2000 * Math.sin(.3 * this.audio.currentTime );
        this.camera.position.x += ( this.mouseX - this.camera.position.x ) * .05;
        this.camera.position.y += ( -this.mouseY + 200 - this.camera.position.y ) * .05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    };

    this.init();

};



window.onload = function() {
    const datVizualiser = new vizualiser();
    let gui = new dat.GUI();
    gui.add(datVizualiser, 'length', 200, 1000);
    gui.add(datVizualiser, 'intensity', 0, 10);
};