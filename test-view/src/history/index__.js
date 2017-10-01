const THREE = require('three')
const OrbitControls = require('three-orbit-controls')(THREE)
const OBJLoader = require('three-obj-loader')(THREE)
const MTLLoader = require('three-mtl-loader')

class HistoryView {
  constructor() {
    const rootView = document.createElement('div')

    const WIDTH = window.innerWidth
    const HEIGHT = window.innerHeight

    const renderer = new THREE.WebGLRenderer({
      antialias: true
    })
    renderer.setSize(WIDTH, HEIGHT)
    renderer.physicallyCorrectLights = true;
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.shadowMap.enabled = true;
		renderer.toneMapping = THREE.ReinhardToneMapping;
		renderer.setPixelRatio( window.devicePixelRatio );

    const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.set(0, 300, 100)

    const scene = new THREE.Scene()

    rootView.appendChild(renderer.domElement)
    const control = new OrbitControls(camera, renderer.domElement)

    //light
    const bulbGeometry = new THREE.SphereGeometry( 0.0000002, 8, 8 );
		const bulbLight = new THREE.PointLight( 0xffffff, 300, 1000);
    const bulbMat = new THREE.MeshStandardMaterial( {
					emissive: 0xffffff,
					emissiveIntensity: 100000
				});
				bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
				bulbLight.position.set( 0, 100, 18 );
				bulbLight.castShadow = true;
				scene.add( bulbLight );

    const hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.5 );
		scene.add( hemiLight );

		const cubeMat = new THREE.MeshStandardMaterial( {
			roughness: 0.7,
			color: 0xffffff,
			bumpScale: 0.002,
			metalness: 0.2
		});
    const boxGeometry = new THREE.BoxGeometry( 50, 64, 1 );
    const boxMesh = new THREE.Mesh( boxGeometry, cubeMat );
    boxMesh.position.set(0., 32., 14);
    boxMesh.rotation.x =  -Math.PI * 0.05;
    boxMesh.rotation.y =  -Math.PI * 0.01;
    boxMesh.castShadow = true;
//    scene.add( boxMesh );

    const boxGeometry2 = new THREE.BoxGeometry( 20, 20, 20 );
    const boxMesh2 = new THREE.Mesh( boxGeometry2, cubeMat );
    boxMesh2.position.set(0., 10., 36);
    boxMesh2.castShadow = true;
//    scene.add( boxMesh2 );

    var floorMat = new THREE.MeshStandardMaterial( {
    					roughness: 0.8,
    					color: 0x111111,
    					metalness: 0.2,
    					bumpScale: 0.0005
    				});

    var floorGeometry = new THREE.PlaneBufferGeometry( 500, 500 );
    				var floorMesh = new THREE.Mesh( floorGeometry, floorMat );
    				floorMesh.receiveShadow = true;
    				floorMesh.rotation.x = -Math.PI / 2.0;
//   				scene.add( floorMesh );


    const loader = new THREE.OBJLoader()
    loader.load(
      'resources/unknown_french_floor_lamp_obj.obj',
      function(obj) {
        scene.add(obj)
      }
    )

    var mtlLoader = new MTLLoader();
    mtlLoader.load('./resources/frame2.mtl', function(matl) {
      matl.preload();

      const objLoader = new THREE.OBJLoader()
      objLoader.setMaterials( matl );
      objLoader.load( './resources/frame2.obj', function ( obj ) {
        obj.scale.set(3, 3, 0.5)
        obj.position.set(0., 0., 16)
        scene.add(obj)
      });
    });

    this.renderer = renderer
    this.scene = scene
    this.rootView = rootView
    this.camera = camera

    const render = (t) => {
      renderer.render(scene, camera)
//      bulbLight.position.set(1 * Math.abs(Math.cos(t * 0.001)), 1 * Math.abs(Math.sin(t * 0.001)), 0)
      requestAnimationFrame(render)
    }

    requestAnimationFrame(render)
  }

  appendTo(ele) {
    ele.appendChild(this.rootView)
  }
}

export default HistoryView
