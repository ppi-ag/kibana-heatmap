"use strict";

// Author: Lukas Havemann
// PPI AG 2014

// JSHint config
/* global requestAnimationFrame:false */
/* global THREE:false */

define([
  'angular',
  'app',
  'lodash',
  'jquery'
], function(angular, app, _, $){

  var container, 
      camera, 
      controls, 
      scene, 
      projector, 
      renderer, 
      data,
      contWidth,
      contHeight,
      tiles = [];

  var mouse  = new THREE.Vector2();

  var MAP_WIDTH    = 24;
  var MAP_DEPTH    = 7;
  var FACTOR       = 7;
  var BOX_SIZE     = 30;
  var PADDING      = 2;
  var heightOffset = -70;

  var initialized = false;

  function display(chartData, cont, coloring) {
    data = chartData;
    container = cont;

    coloring = $.plot.heatmap.coloring[coloring];
    
    if(!initialized) {
      init(coloring);
      initialized = true;
    }
    else {
      _.each(tiles, function( object ) {
        scene.remove(object);
      });

      tiles = [];

      renderHeatmapTiles(data, coloring);      
    }
      
    animate();
  }
 
  function init(coloring) {
    contWidth  = container.clientWidth;
    contHeight = container.clientHeight;

    camera     = createCamera();
    controls   = createControls();
    scene      = createScene();
    
    scene.add(createSpotLight(500, 2000, 0x555555, 0.8));
    scene.add(createSpotLight(-500, -2000, 0x555555, 0.5));

    renderHeatmapTiles(data, coloring);
    renderLabelText();

    projector = new THREE.Projector();
    
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    //renderer.setClearColor( 0x1F1F1F );
    renderer.setClearColor(0xffffff);
    renderer.setSize(contWidth, contHeight);
    renderer.sortObjects = false;

    renderer.shadowMapEnabled = true;
    renderer.shadowMapType = THREE.PCFShadowMap;

    container.appendChild( renderer.domElement );

    /* AUTO TILT
    var x = -70, flag = true;
    setInterval(function() {
      x += (flag) ? -0.5 : 0.5;

      if(x > 70 || x < -70) {
         flag = !flag;
      } 

      camera.position.x += x * 0.05;
      camera.position.x = Math.max( Math.min( camera.position.x, 2000 ), -2000 );
      camera.lookAt( scene.position );
    }, 20); */

    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
    renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
    renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

    window.addEventListener( 'resize', onWindowResize, false );
  } //END init

  function renderHeatmapTiles(data, coloring) {
    var range = $.plot.heatmap.getValueRange(data);

    $.each(data, function(idx, val) {
      // TODO not noce

      var timeSlice = $.plot.heatmap.parseTimeSliceLabel(val.label);
      var value     = val.data[0][1];
      var heat      = value / range.diff;
      var height    = BOX_SIZE * heat * FACTOR;
      var color     = coloring(heat);

      var object = createHeatmapTile(timeSlice.hour.start, timeSlice.day, BOX_SIZE, height, color);

      tiles.push(object);
      scene.add( object );
    });
  }

  function renderLabelText() {
    // labeltext rendering

    // TODO : do not hard code
    $.each(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], function(idx, value){
      scene.add(createLabelText(value, 7, 12 * BOX_SIZE, 20,  BOX_SIZE * idx - (PADDING * BOX_SIZE) - 85 ));  
    });

    
    for(var i= 1; i <= 24; i++) {
      var value = i + " h";
      scene.add(createLabelText(value, 7, (-13.2 * BOX_SIZE) + i * BOX_SIZE, 20, (PADDING * BOX_SIZE) + 10));
    }
  }

  function createCamera(){
    var camera = new THREE.PerspectiveCamera( 35, contWidth / contHeight, 1, 10000 );
    camera.position.z = 800;
    camera.position.y = 500;
    
    camera.rotation.x = -Math.PI / 4;

    return camera;
  }

  function createControls(){
    var controls = new THREE.TrackballControls(camera, container);
    
    controls.rotateSpeed            = 1.0;
    controls.zoomSpeed              = 1.2;
    controls.panSpeed               = 0.8;
    controls.noZoom                 = false;
    controls.noPan                  = false;
    controls.staticMoving           = true;
    controls.dynamicDampingFactor   = 1;
    controls.enabled                = true;

    return controls;
  }

  function createScene() {
    var scene = new THREE.Scene();
    scene.add( new THREE.AmbientLight( 0xb3b3b3 ) );
     
    return scene;
  }

  function createSpotLight(y, z, color, intensity) {
    var light = new THREE.SpotLight(color, intensity);

    light.position.set( 0, y, z );
    //light.castShadow = true;
    light.castShadow = false;

    light.shadowCameraNear   = 200;
    light.shadowCameraFar    = camera.far;
    light.shadowCameraFov    = 50;

    light.shadowBias         = -0.00022;
    light.shadowDarkness     = 0.5;

    light.shadowMapWidth     = 2048;
    light.shadowMapHeight    = 2048;

    return light;
  }

  function createHeatmapTile(x, y, BOX_SIZE, height, color) {
    var geometry   = new THREE.BoxGeometry( BOX_SIZE, height, BOX_SIZE );
    var object     = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color} ) );

    object.material.ambient = object.material.color;

    object.position.x = (MAP_WIDTH / -2 * BOX_SIZE) + x * (BOX_SIZE);
    object.position.y = height / 2;
    object.position.z = (MAP_DEPTH / -2 * BOX_SIZE) + y * (BOX_SIZE) -10;
    
    object.translateY(heightOffset);

    return object;
  }


  var texte = [];

  function createLabelText(value, size, x, y, z) {
    var shape   = new THREE.TextGeometry(value, {font: 'helvetiker', "size" : size, height: 0, color: 0x333333});
    var wrapper = new THREE.MeshBasicMaterial({color: 0x333333});
    var object   = new THREE.Mesh(shape, wrapper);

    object.rotation.x = - Math.PI / 3;

    object.position.x = x;
    object.position.y = y -50 ;
    object.position.z = z;

    object.translateY(heightOffset);

    texte.push(object);

    return object;
  }

  function onDocumentMouseMove( event ) {
    event.preventDefault();

    mouse.x = ( event.clientX / contWidth ) * 2 - 1;
    mouse.y = -( event.clientY / contHeight ) * 2 + 1;

    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );

    /*$.each(texte, function(idx, val) {
     // val.lookAt(camera.position);

    });*/

    projector.unprojectVector( vector, camera );
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();

    var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
    projector.unprojectVector( vector, camera );
  }

  function onDocumentMouseUp(event) {
    event.preventDefault();

    controls.enabled = true;
    container.style.cursor = 'auto';
  }

  function onWindowResize(event) {
    // hide canvas element so the outer container can resize
    $(renderer.domElement).hide();

    contWidth  = container.clientWidth;
    contHeight = container.clientHeight;

    camera.aspect =  contWidth / contHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(contWidth, contHeight);

    $(renderer.domElement).show();
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  function render() {
    controls.update();
    renderer.render( scene, camera );
  }

  return {
    "display" : display
  };
});