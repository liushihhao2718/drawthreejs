let scene, camera, renderer,
	width = 600,height=600;
let objects = [];
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),intersected;
main();

function main(){
	setupThreejs();
	setMouseListener();

	dosomething();

	render();
}

function setupThreejs(){
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera( width / - 2, width / 2,
		height / 2,	height / - 2, 1, 10 );
	camera.position.z = 5;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	document.body.appendChild(renderer.domElement);
}

function setMouseListener() {
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
}
	

function onDocumentMouseMove( e ) {
	e.preventDefault();

	mouse.x = ( (event.clientX - e.target.getBoundingClientRect().left) / width ) * 2 - 1;
	mouse.y = - ( (event.clientY - e.target.getBoundingClientRect().top) / height ) * 2 + 1;

	raycast(objects);
}
//!不可以動
function raycast(objects) {
	raycaster.setFromCamera( mouse, camera );	
	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {
		intersected = intersects[ 0 ].object;
		intersected.material.color.setHex( 0xff0000 );
	}
	else if ( intersected ) {

		intersected.material.color.setHex( 0x0099ff );
		intersected = null;
	}
}

function dosomething(){

	setDrawingPanel();
	setNode(0, 0);
	setNode(100, 100);
}

function setDrawingPanel(){
	var geometry = new THREE.PlaneGeometry( width, height );
	var material = new THREE.MeshBasicMaterial( {color: 0xe6e6e6, side: THREE.FrontSide} );
	var plane = new THREE.Mesh( geometry, material );
	scene.add( plane );
}

function setNode(x, y) {
	var geometry = new THREE.PlaneGeometry( 10, 10 );
	var material = new THREE.MeshBasicMaterial( {color: 0x0099ff, side: THREE.FrontSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.x = x;
	plane.position.y = y;

	objects.push(plane);
	scene.add( plane );
}

function render() {
	requestAnimationFrame( render );
	renderer.render( scene, camera );
}