/*
	This script includes all the APIs for the engine.
*/

import * as util from "./utility.js";

const INPUT_TYPE = {
    PRESS:   0,
    RELEASE: 1,
    DOWN:    2,
}

const INPUT_STATE = {
    PRESSED:  0,
    RELEASED: 1,
    NONE:     2,
}

const ENTITY_TYPE = {
    GAMEPLAY_OBJECT: 0,
    GUI:             1,
}

const SCENE_TYPE = {
    DEFAULT:       0,
    GUI_ONLY:      1,
    GAMEPLAY_ONLY: 2,
}


export const KEY = {
    SPACE:       " ",
    TAB:         "Tab",
    ENTER:       "Enter",
    SHIFT:       "Shift",
    CONTROL:     "Control",
    ALT:         "Alt",
    CAPSLOCK:    "CapsLock",
    ESCAPE:      "Escape",
    ARROW_LEFT:  "ArrowLeft",
    ARROW_RIGHT: "ArrowRight",
    ARROW_UP:    "ArrowUp",
    ARROW_DOWN:  "ArrowDown",
    A:           "a",
    B:           "b",
    C:           "c",
    D:           "d",
    E:           "e",
    F:           "f",
    G:           "g",
    H:           "h",
    I:           "i",
    J:           "j",
    K:           "k",
    L:           "l",
    M:           "m",
    N:           "n",
    O:           "o",
    P:           "p",
    Q:           "q",
    R:           "r",
    S:           "s",
    T:           "t",
    U:           "u",
    V:           "v",
    W:           "w",
    X:           "x",
    Y:           "y",
    Z:           "z",
    ONE:         "1",
    TWO:         "2",
    THREE:       "3",
    FOUR:        "4",
    FIVE:        "5",
    SIX:         "6",
    SEVEN:       "7",
    EIGHT:       "8",
    NINE:        "9",
    ZERO:        "0",
    COMA:        ",",
    DOT:         ".",
    SLASH:       "/",
    BACKSLASH:   "\\",
    COLON:       ":",
    SEMI_COLON:  "\;",
    QUOTE:       "\"",
    EXCLAMATION: "\!",
}

export class Color{

	constructor(r, g, b, a) {
		this.r = (r === undefined) ? 255 : r;
		this.g = (r === undefined) ? 255 : g;
		this.b = (r === undefined) ? 255 : b;
		this.a = (r === undefined) ? 1 : a; // alpha channel is from 0 to 1 scale	
	}

	clone() {
		return new Color(this.r, this.g, this.b, this.a);
	}
}

// all supported color name : https://www.w3schools.com/colors/colors_names.asp
export const COLOR = {
    BLACK:      new Color(0, 0, 0, 1),
    LIGHT_BLACK:      new Color(105, 105, 105, 1),
    WHITE:      new Color(255, 255, 255, 1),
    BLUE:       new Color(0, 0, 255, 1),
    RED:        new Color(255, 0, 0, 1),
    YELLOW:     new Color(255, 255, 0, 1),
    GREEN:      new Color(0, 255, 0, 1),
    LIGHT_BLUE: new Color(173, 216, 230, 1)
}


export const COMPONENT_TYPE = {
    TRANSFORM:        0,
    BOUNDING_BOX:     1,
    PHYSICS:          2,
    SPRITE:           3,
    ANIMATION:        4,
    TEXT:             5,
    COLOR_RECTANGLE:  6,
    PARTICLE_EMITTER: 7,
}

export const PARTICLE_TYPE = {
	DEFAULT: 0,
}

export const EMIT_SHAPE = {
    CIRCLE: 0,
    SQUARE: 1,
    CONE:   2,
    LINE:   3,
}

export const COLLISION_TYPE = {
    STATIC:    0,
    KINEMATIC: 1,
}

export function degrees_to_radians(deg) {
	return deg * (Math.PI/180);
}

export class Vector2 {
	constructor(x, y) {
		this.x = (x === undefined) ? 0 : x;
		this.y = (y === undefined) ? 0 : y;
	}
	set(x, y) {
		this.x = x || 0;
		this.y = y || 0;
	}
	clone() {
		return new Vector2(this.x, this.y)
	}
	isEqual(vector) {
		return this.x === vector.x && this.y === vector.y;
	}
	add(vector) {
		this.x += vector.x;
		this.y += vector.y;
	}
	addAndCopy(vector) {
		return new Vector2(this.x + vector.x, this.y + vector.y);
	}
	subtract(vector) {
		return new Vector2(this.x - vector.x, this.y - vector.y);
	}
	scale(scalar) {
		return new Vector2(this.x * scalar, this.y * scalar);
	}
	dot(vector) {
		return (this.x * vector.x + this.y * vector.y);
	}
	mutiply(vector) {
		return new Vector2(this.x * vector.x, this.y * vector.y);
	}
	delta(vector) {
		return new Vector2(Math.abs(this.x - vector.x), Math.abs(this.y - vector.y));
	}
	moveTowards(vector, t) {
		// Linearly interpolates between vectors A and B by t.
		// t = 0 returns A, t = 1 returns B
		t = Math.min(t, 1); // still allow negative t
		var diff = vector.subtract(this);
		return this.add(diff.scale(t));
	}
	magnitude() {
		return Math.sqrt(this.magnitudeSqr());
	}
	magnitudeSqr() {
		return (this.x * this.x + this.y * this.y);
	}
	distance(vector) {
		return Math.sqrt(this.distanceSqr(vector));
	}
	distanceSqr(vector) {
		var deltaX = this.x - vector.x;
		var deltaY = this.y - vector.y;
		return (deltaX * deltaX + deltaY * deltaY);
	}
	normalize() {
		var mag = this.magnitude();
		var vector = this.clone();
		if(Math.abs(mag) < 1e-9) {
			vector.x = 0;
			vector.y = 0;
		} else {
			vector.x /= mag;
			vector.y /= mag;
		}
		return vector;
	}
	angle() {
		return Math.atan2(this.y, this.x);
	}
	rotate(alpha) {
		var cos = Math.cos(alpha);
		var sin = Math.sin(alpha);
		var vector = new Vector2();
		vector.x = this.x * cos - this.y * sin;
		vector.y = this.x * sin + this.y * cos;
		return vector;
	}
	toPrecision(precision) {
		var vector = this.clone();
		vector.x = vector.x.toFixed(precision);
		vector.y = vector.y.toFixed(precision);
		return vector;
	}
	toString() {
		var vector = this.toPrecision(1);
		return ("[" + vector.x + "; " + vector.y + "]");
	}

}


const QUAD_MAX_ENTITY = 10;
const QUAD_MAX_LEVEL  = 4;

class QuadTree {
	constructor(pos, size, level) {
        this.pos             = (pos === undefined) ? new Vector2() : pos; //NOTE: top-left corner
        this.size            = (size === undefined) ? new Vector2() : size;
        this.level           = (level === undefined) ? 0 : level; //NOTE: region amounts
        this.staticEntityIds = new Array();
	}
}

class Component {
	constructor() {
		this.userId = -1; // -1 means no entity using this component
		this.active = true;
	}
	get_user() {
		return this.userId;
	}
	set_user(entityId) {
		this.userId = entityId;
	}
	erase_user() {
		this.userId = -1;
	}
	is_used() {
		return (this.userId !== -1 ) ? true : false;
	}
	set_active(b) {
		this.active = b
	}
	is_active() {
		return this.active;
	}
}

class Transform extends Component {
	constructor(pos, rot, scale) {
		super();
		this.pos = (pos === undefined) ? new Vector2() : pos;
		this.rot = (rot === undefined) ? 0 : rot;
		this.scale = (scale === undefined) ? 1 : scale;
	}
}

class BoundingBox extends Component {
	constructor(size, halfSize) {
		super();
		this.size = (size === undefined) ? new Vector2() : size;
		this.halfSize = (halfSize === undefined) ? new Vector2() : halfSize;
		this.collisionType = COLLISION_TYPE.STATIC;
	}
}

class Sprite extends Component {
	constructor(image, pos, size, spos, ssize) {
		super();
		this.image = (image === undefined) ? new Image() : image;
		this.pos = (pos === undefined) ? new Vector2() : pos; //starting point when first loaded
		this.size = (size === undefined) ? new Vector2(this.image.width, this.image.height) : size;
		this.spos = (spos === undefined) ? new Vector2() : spos;
		this.ssize = (ssize === undefined) ? new Vector2(this.image.width, this.image.height) : ssize;
 		this.halfSize = new Vector2();
 		this.flipH = false;
 		this.usedByAnimation = false;
 	}
 	set_size() {
 		this.size = new Vector2(this.image.width, this.image.height);
		this.ssize = new Vector2(this.image.width, this.image.height);
		this.halfSize.set(this.image.width*0.5, this.image.height*0.5);
 	}
 	set_origin() {
 		this.pos.add(this.size.scale(0.5));
 	}
}

class Animation extends Component {
	constructor(name, sprite, frameCount, currentFrame, speed, size) {
		super();
		this.name = (name === undefined) ? "" : name;
		this.sprite = (sprite === undefined) ? new Sprite() : sprite;
		this.frameCount = (frameCount === undefined) ? 1 : frameCount;
		this.currentFrame = (currentFrame === undefined) ? 0 : currentFrame;
		this.speed = (speed === undefined) ? 1 : speed;
		this.sprite.ssize = (size === undefined) ? new Vector2(this.sprite.image.width/this.frameCount, this.sprite.image.height) : size;
		this.sprite.size = (size === undefined) ? new Vector2(this.sprite.image.width/this.frameCount, this.sprite.image.height) : size;
	}

	setup(name, frameCount, speed) {
		this.name = name;
		this.frameCount = frameCount;
		this.speed = speed;
		this.sprite.ssize = new Vector2(this.sprite.image.width/this.frameCount, this.sprite.image.height);
		this.sprite.size = new Vector2(this.sprite.image.width/this.frameCount, this.sprite.image.height);
		this.sprite.halfSize.set(this.sprite.size.x*0.5, this.sprite.size.y*0.5);
	}
}

class Text extends Component {
	constructor(font, text, pos, tint) {
		super();
		this.font = (font === undefined) ? "25px Arial" : font;
		this.text = (text === undefined) ? "TEXT WRITTEN HERE" : text;
		this.pos = (pos === undefined) ? new Vector2() : pos;
		this.tint = (tint === undefined) ? COLOR.BLACK : tint;
	}
}

class ColorRectangle extends Component {
	constructor(pos, size, fillTint) {
		super();
		this.pos = (pos === undefined) ? new Vector2() : pos;
		this.size = (pos === undefined) ? new Vector2(1, 1) : size;
		this.fillTint === (fillTint === undefined) ? COLOR.WHITE : fillTint;
	}
}

class Physics extends Component {
	constructor() {
		super();
		this.velocity = new Vector2();
		this.acceleration = new Vector2();
		this.maxSpeed = 0;
		this.maxForce = 0;
		this.mass = 0;
	}
}


/*
	Emitter :
		- position
		- rate/amount
		- duration
		- setup particle's properties  
	particle :
		- pos
		- size
		- angle
		- vel
		- rot
		- lifetime
		- col
		- sprite
		- blend mode
*/


class ParticleEmitter extends Component {
	constructor(pos, duration, amount, col) {
		super();
		this.pos = (pos === undefined) ? new Vector2() : pos;
		this.amount = (amount === undefined) ? 10 : amount;
		this.col = (col === undefined) ? COLOR.WHITE : col; 
		this.particles = new Array();
		this.isEmitting = true;
		this.minVel = new Vector2(0, 0);
		this.maxVel = new Vector2(1, 1);
		// Add enum for different emit shape
	}
}

class Particle {
	constructor() {
		this.pos = new Vector2();
		this.size = new Vector2();
		this.vel = new Vector2();
		this.lifeTime = 1;
		this.time = 0;
		this.startTime = Math.random();
		this.colRect = new ColorRectangle(this.pos, this.size, COLOR.RED);
		this.isAlive = true;

		this.angle = 180; // in degrees
		this.radius = 100;

		// this.sprite = new Sprite();
		// this.blend = null;		
		// this.angle = 0;
		// this.rot = 0;
	}
}


/* 
	Note :
	the problem with Class approach (putting all the 
	components inside every entity) is
	when iterating through entityMap to access
	one specific component, it loads all the thing inside the
	entity, so it required a lot more time to call
	rather than grouped every component on its own
	data structure such as array. But its nicer to organized .
*/


class Entity {
	constructor(entityType) {
        this.id     = -1;
        this.active = true;
        this.name = "NONE"
		
		// keep track the used comp by its index. -1 means using none.
		if (entityType === ENTITY_TYPE.GAMEPLAY_OBJECT) {
            this.transformIdx       = -1;
            this.boundingBoxIdx     = -1;
            this.spriteIdx          = -1;
            this.animationIdx       = -1;
            this.particleEmitterIdx = -1;
		} else if (entityType === ENTITY_TYPE.GUI) {
            this.transformIdx       = -1;
            this.textIdx            = -1;
            this.colorRectIdx       = -1;
            this.particleEmitterIdx = -1;
		}
	}

	get_id() {
		return this.id;
	}

	check_id(id) {
		return this.id === id;
	}

	set_name(name) {
		this.name = name;
	}
	get_name() {
		return this.name;
	}
	is_active() {
		return this.active;
	}
	set_active(b) {
		this.active = b;
	}
}

class InputKey {
	constructor(name, key, type) {
		this.name = name;
		this.key = key;
		this.type = type; //pressed, release, down 
		this.state = INPUT_STATE.NONE;
	}
}


class Scene {
	constructor(sceneType) {
        this.type   = sceneType;
        this.setup  = () => {console.error("This should be override/replaced as scene's _setup_ function")};
        this.input  = () => {console.error("This should be override/replaced as scene's _input_ function")};
        this.update = (dt) => {console.error("This should be override/replaced as scene's _update_ function")}; // game logic goes here
		switch (sceneType) {
			case SCENE_TYPE.GUI_ONLY:
				this.guiEntityMap = new Map();
				this.cTexts = new Array();
				this.cColorRectangles = new Array();
				break;
			case SCENE_TYPE.GAMEPLAY_ONLY:
				this.entityMap = new Map();
				this.cTransforms = new Array();
				this.cBoundingBoxes = new Array();
				this.cSprites = new Array();
				this.cAnimations = new Array();
				break;
			case SCENE_TYPE.DEFAULT:
				this.guiEntityMap = new Map();
				this.cTexts = new Array();
				this.cColorRectangles = new Array();

				this.entityMap = new Map();
				this.cTransforms = new Array();
				this.cBoundingBoxes = new Array();
				this.cSprites = new Array();
				this.cAnimations = new Array();
		        this.cParticleEmitters = new Array();
		        this.quadTrees = new Array();
				break;
		}
	}
}


class EngineSettings {
	constructor() {
		this.isPaused = false;
		this.isDrawImage = true;
		this.isDrawCollisionShape = true;
		this.showFPS = false;

		this.inputMap = new Map();
		this.sceneMap = new Map();
		this.assetImageMap = new Map();

		this.currentScene = null;
		this.mouse_position = new Vector2();
	}
}


const settings = new EngineSettings();
let currScene = settings.currentScene;
console.log(settings);

const camera = {
	pos : new Vector2(),
	size : new Vector2(),
}

//grouping objects and checking AABB collision based on its positions
//the problem now, is how to group all of the objects with the current implementation ?
//change entities data structure to array so, we can sort the that based on its position.
/*
	1. make the data structure
	2. create 4 region (quad)
	3. check the position of all entity with BoundingBox typed STATIC component
	4. determine its region and the store the information.
	5. only check entity with BoundingBox typed KINEMATIC component based on its position on the region (quad).
	then do AABB checks.
	6. check the max object amount. if maxed out, then this reqion will be divided into four equally
	7. check the 
*/

function quad_tree_setup() {
	//setup initial region
	const sizeX = canvas_get().width/QUAD_MAX_LEVEL;
	const sizeY = canvas_get().height/QUAD_MAX_LEVEL;
	const pattern = [[0,0], [0,1], [1,0], [1,1]];
	let level = 1;
	
	for(let p of pattern) {
		console.log(p[0], p[1]);
		const pos = new Vector2(sizeX * p[0], sizeY * p[1]); 
		const size = new Vector2(sizeX, sizeY);
		const newQuad = new QuadTree(pos, size, level);
		currScene.quadTrees.push(newQuad);
		level += 1;	
	}

	// //setup all the static objects
	// for (let of currScene.cBoundinBoxes) {
	// 	if 
	// }

}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}


function animation_update(anim) {
	anim.currentFrame++;
	const animFrame = Math.floor((anim.currentFrame / anim.speed) % anim.frameCount);
	const spriteXSSize = anim.sprite.ssize.x;
	anim.sprite.spos.x = animFrame * spriteXSSize;	
	util.draw_image(anim.sprite);
}

export function animation_set_sprite(animId, spriteId) {
	const s = currScene.cSprites[spriteId];
	s.usedByAnimation = true;
	currScene.cAnimations[animId].sprite = s;
}

export function animation_setup(animIdx, name, frameCount, speed) {
	currScene.cAnimations[animIdx].setup(name,frameCount, speed);
}


export function animation_change(entity, animName) {
	const currAnim = component_get(entity.get_id(), COMPONENT_TYPE.ANIMATION);
	currAnim.set_active(false);
	for (let i= 0 ; i < currScene.cAnimations.length; i += 1) {
		const animation = currScene.cAnimations[i];
		if (animation.name == animName) {
			animation.set_active(true);
			entity.animationIdx = i;
			// console.log(entity.animationIdx);
			break;
		}

	}
}

export function asset_load_image(name, src, width, height) {
	const img = new Image();
	img.onload = () => {};
	img.src = src;
	img.width = width;
	img.height = height;
	// console.log(img.height);
	settings.assetImageMap.set(name, img);
	return img;
}

export function asset_get_image(name) {
	return settings.assetImageMap.get(name);
}


export function canvas_get() {
	return util.canvas_get();
}

export function camera_movement(vel) {
	camera.pos.add(vel);
	util.canvas_set_translate(camera.pos);
	// console.log(camera.pos.x);
}

export function collision_rect_debug(bb) {
	const transform = component_get(bb.get_user(), COMPONENT_TYPE.TRANSFORM);
	util.draw_stroke_rect(transform.pos, bb.size, COLOR.WHITE);
}

export function collision_rect_check(tIdx1, tIdx2, bbIdx1, bbIdx2) {
	const ct = currScene.cTransforms;
	const cbb = currScene.cBoundingBoxes;
	let dpos = ct[tIdx1].pos.delta(ct[tIdx2].pos);
	let overlap = ((cbb[bbIdx1].halfSize).addAndCopy(cbb[bbIdx2].halfSize)).subtract(dpos);
	// console.log(overlap);
	// console.log(cbb[bbIdx2].halfSize);
	return (overlap.x > 0.0 && overlap.y > 0.0) ? overlap : null;
}

export function bounding_box_set(bbId, size, collType) {
	currScene.cBoundingBoxes[bbId].size = size;
	currScene.cBoundingBoxes[bbId].halfSize = size.scale(0.5);
	currScene.cBoundingBoxes[bbId].collisionType = collType;
}


export function component_create(compType) {
	switch (compType) {
		case COMPONENT_TYPE.TEXT:
			const t = new Text();
			currScene.cTexts.push(t);
			return t;
		default:
			console.error("wrong component type.");
	}
}

export function component_add(ent, compType) {
	switch (compType) {
		case COMPONENT_TYPE.TRANSFORM:
			const t = new Transform();
			currScene.cTransforms.push(t);
			ent.transformIdx = currScene.cTransforms.length - 1;
			t.set_user(ent.id);
			break;
		case COMPONENT_TYPE.SPRITE:
			const s = new Sprite();
			s.pos = currScene.cTransforms[ent.transformIdx].pos;
			currScene.cSprites.push(s);
			ent.spriteIdx = currScene.cSprites.length - 1;
			s.set_user(ent.id);
			break;
		case COMPONENT_TYPE.ANIMATION:
			const a = new Animation();
			currScene.cAnimations.push(a);
			ent.animationIdx = currScene.cAnimations.length - 1;
			a.set_user(ent.id);
			break;
		case COMPONENT_TYPE.BOUNDING_BOX:
			const bb = new BoundingBox();
			currScene.cBoundingBoxes.push(bb);
			ent.boundingBoxIdx = currScene.cBoundingBoxes.length - 1;
			bb.set_user(ent.id);
			break;
		case COMPONENT_TYPE.PARTICLE_EMITTER:
			const pe = new ParticleEmitter();
			pe.pos = currScene.cTransforms[ent.transformIdx].pos;
			currScene.cParticleEmitters.push(pe);
			ent.particleEmitterIdx = currScene.cParticleEmitters.length - 1;
			pe.set_user(ent.id);
			break;
		default:
			console.error("wrong component type.");
	}
}

export function component_get(entityId, type) {
	const entity = entity_get_by_id(entityId);
	switch (type) {
		case COMPONENT_TYPE.ANIMATION:
			return currScene.cAnimations[entity.animationIdx];
			break;
		case COMPONENT_TYPE.TRANSFORM:
			return currScene.cTransforms[entity.transformIdx];
			break;
		case COMPONENT_TYPE.SPRITE:
			return currScene.cSprites[entity.spriteIdx];
			break;
		case COMPONENT_TYPE.BOUNDING_BOX:
			return currScene.cBoundingBoxes[entity.boundingBoxIdx];
			break;
		case COMPONENT_TYPE.PARTICLE_EMITTER:
			return currScene.cParticleEmitters[entity.particleEmitterIdx];
			break;
		default:
			console.error("wrong component type passed.");
			break;
	}
}


export function entity_create(name) {
	console.assert(currScene.entityMap.has(name) === false);
	const newEntity = new Entity(ENTITY_TYPE.GAMEPLAY_OBJECT);
	newEntity.id = currScene.entityMap.size;
	newEntity.set_name(name);
	currScene.entityMap.set(name, newEntity);
	console.log(newEntity);
	return newEntity;
}

export function entity_get(name) {
	return currScene.entityMap.get(name);
}

export function entity_get_by_id(id) {
	for (let e of currScene.entityMap.values()) {
		if (e.check_id(id)) {
			return e;
		}
	}
}

export function entity_remove(name) {
	currScene.entityMap.delete(name);
}

export function entity_get_map() {
	return currScene.entityMap;
}

export function entity_gui_create(name) {
	const guiEntity = new Entity(ENTITY_GUI);
	guiEntity.id = currScene.guiEntityMap.size;
	currScene.guiEntity.set(name, guiEntity);
	return guiEntity;
}

export function entity_gui_get(name) {
	return currScene.guiEntityMap.get(name);
}

export function entity_gui_remove(name) {
	currScene.guiEntity.delete(name);
}

export function entity_gui_get_map() {
	return currScene.guiEntityMap;
}


export function input_press_create(name, key) {
	const inputKey = new InputKey(name, key, INPUT_TYPE.PRESS);
	settings.inputMap.set(name, inputKey);
}
export function input_release_create(name, key) {
	const inputKey = new InputKey(name, key, INPUT_TYPE.RELEASE);
	settings.inputMap.set(name, inputKey);
}
export function input_down_create(name, key) {
	const inputKey = new InputKey(name, key, INPUT_TYPE.DOWN);
	settings.inputMap.set(name, inputKey);
}

export function is_key_pressed(name) {
	const input = settings.inputMap.get(name);
	if (input.type === INPUT_TYPE.PRESS && 
		input.state === INPUT_STATE.PRESSED) 
	{
		input.state = INPUT_STATE.NONE
		return true;
	}
	return false;
}

export function is_key_down(name) {
	const input = settings.inputMap.get(name);
	return (input.type === INPUT_TYPE.DOWN && 
			input.state === INPUT_STATE.PRESSED) ? true : false;
}

export function is_key_released(name) {
	const input = settings.inputMap.get(name);
	if (input.type === INPUT_TYPE.RELEASE && 
		input.state === INPUT_STATE.RELEASED)
	{
		input.state = INPUT_STATE.NONE;
		return true; 
	}
	return false;
}

export function is_paused() {
	return settings.isPaused;
}

export function is_draw_image() {
	return settings.isDrawImage;
}

export function is_draw_collision_shape() {
	return settings.isDrawCollisionShape;
}

export function is_show_fps() {
	return settings.showFPS;
}


export function settings_get() {
	return settings;
}


export function scene_create(name) {
	const newScene = new Scene(SCENE_TYPE.DEFAULT);
	settings.sceneMap.set(name, newScene);
	return newScene;
}

export function scene_gui_create(name) {
	const newScene = new Scene(SCENE_TYPE.GUI_ONLY);
	settings.sceneMap.set(name, newScene);
	return newScene;
}

export function scene_gameplay_create(name) {
	const newScene = new Scene(SCENE_TYPE.GAMEPLAY_ONLY);
	settings.sceneMap.set(name, newScene);
	return newScene;
}

export function scene_is_gui_only() {
	return scene_get_type() === SCENE_GUI_ONLY;
}

export function scene_change(name) {
	settings.currentScene = settings.sceneMap.get(name);
	currScene = settings.currentScene;
	console.log(currScene);
}

export function scene_get_current() {
	return settings.currentScene;
}

export function scene_get_type() {
	return settings.currentScene.type;
}

export function sprite_set(sprId, imgName) {
	currScene.cSprites[sprId].image = asset_get_image(imgName);
	currScene.cSprites[sprId].set_size();
	// currScene.cSprites[sprId].set_origin();
}


export function canvas_setup(canvas, width, height) {
	util.context_setup(canvas);
	util.canvas_set_size(width, height);
}

export function init() {
	currScene.setup();
	// quad_tree_setup();
	// camera_setup();
	window.requestAnimationFrame(update);
}

function camera_setup() {
	const canvasWidth = canvas_get().width;
	const canvasHeight = canvas_get().height;
	camera.size = new Vector2(canvasWidth, canvasHeight);
}


function particle_draw(particleEmitter) {
	if (particleEmitter.isEmitting) {
		for (let p of particleEmitter.particles) {
			if (p.isAlive) {
				particle_update(p);
				util.draw_rect(p.colRect.pos, p.colRect.size, p.colRect.fillTint);
			}
		}			
	}	
}


export function particle_emitter_set(
	peIdx, pePos, lifeTime, amount, col, minVel, maxVel, particleSize) {
	const pe = currScene.cParticleEmitters[peIdx];
	pe.pos = pePos;
	pe.amount = amount;
	pe.col = col;
	pe.minVel = minVel;
	pe.maxVel = maxVel;

	//TODO: random direction

	for (let i = 0; i < amount; i += 1) {
		const p = new Particle();
		const randX = Math.random() * (pe.maxVel.x - pe.minVel.x) + pe.minVel.x;
		const randY = Math.random() * (pe.maxVel.y - pe.minVel.y) + pe.minVel.y;
		const randVel = new Vector2(randX, randY);
		p.pos = pe.pos;
		p.vel = randVel;
		p.colRect.pos = p.pos.clone();
		p.colRect.size = particleSize;
		p.colRect.fillTint = pe.col.clone();
		p.size = particleSize;
		p.lifeTime = Math.random() * lifeTime + 1;

		// console.log(p.startTime)
		pe.particles.push(p);
	}

	console.log(pe);
}


function particle_update(particle) {
	// const rad = degrees_to_radians(particle.angle);
	// const v = new Vector2(particle.radius*Math.cos(rad), particle.radius*Math.sin(rad));

	// p.pos.add(v);
	// console.log(util.secondPassed)
	if (particle.startTime > 0.1) {
		particle.startTime -= util.secondsPassed;
		return;
	} 

	particle.colRect.pos.add(particle.vel)
	particle.colRect.pos.scale(util.secondPassed);
	particle.colRect.fillTint.a -= 0.01;

	particle.time += util.secondsPassed;
	if (particle.time >= particle.lifeTime) {
		// particle.isAlive = false;
		particle.colRect.pos = particle.pos.clone();
		particle.time = 0;
		particle.colRect.fillTint.a = 1;

	}
	//TODO: fade out 
}

function draw() {
	// entities_y_sorted();

	if (settings.isDrawCollisionShape) {
		for (let bb of currScene.cBoundingBoxes) {
			if (bb.is_active) {
				collision_rect_debug(bb);
			}
		}
	}

	if (currScene.cSprites.length !== 0) {		
		for (let s of currScene.cSprites) {
			if (s.usedByAnimation) {
				continue;
			}
			if (s.is_active()) {
				util.draw_image(s);
			}
		}
	} 

	if (currScene.cAnimations.length !== 0) {		
		for (let a of currScene.cAnimations) {
			if (a.is_active()) {
				animation_update(a);
			}
		}
	}

	if (currScene.cParticleEmitters.length !== 0) {
		for (let pe of currScene.cParticleEmitters) {
			if (pe.is_active()) {
				particle_draw(pe);
			}
		}
	}

	for (let i = 0; i < 3; i += 1) {
		const card = entity_get(`card${i}`);
		const card_size = new Vector2(64, 64);
		const cardT = component_get(
			card.get_id(), COMPONENT_TYPE.TRANSFORM
		);
		util.draw_rect(cardT.pos, card_size, COLOR.WHITE);
	}

	{
		const rb = entity_get("RestartButton");
		const rbSize = new Vector2(100, 50);
		const rT = component_get(
			rb.get_id(), COMPONENT_TYPE.TRANSFORM
		);
		util.draw_rect(rT.pos, rbSize, COLOR.WHITE);
	}

	if (currScene.cTexts.length !== 0) {		
		for (let t of currScene.cTexts) {
			if (t.is_active()) {
				util.draw_text(t);
			}
		}
	}

}

function collision() {
	const currSceneBB = currScene.cBoundingBoxes;
	if (currSceneBB.size <= 1) {
		return
	}

	const entities = currScene.entityMap.values(); 

	for (let bbK of currSceneBB) {
		if (bbK.collisionType === COLLISION_TYPE.KINEMATIC) {
			const entBBK = entity_get_by_id(bbK.userId);

			// const isMouseInsideBox = (

			// 	);
			// for (let bbS of currSceneBB) {
			// 	if (bbS.collisionType === COLLISION_TYPE.STATIC) {
			// 		const entBBS = entity_get_by_id(bbS.userId);
			// 		var overlap = collision_rect_check(
			// 				entBBK.transformIdx,
			// 				entBBS.transformIdx,
			// 				entBBK.boundingBoxIdx,
			// 				entBBS.boundingBoxIdx,
			// 			);

			// 		// console.log(overlap);
			// 		if (overlap) {
			// 			console.log("COLLIDING");
			// 		}
			// 	}
			// } 
		}
	} 
}

let dt = 0;
let oldTimeStamp = 0;

function update(timeStamp) {
	dt = (timeStamp - oldTimeStamp) / 1000;
	oldTimeStamp = timeStamp;

	if (!is_paused()) {
		currScene.input();
		currScene.update(dt);
		// collision();
	}
	
	if (is_draw_image()) {
		util.clear_background(COLOR.LIGHT_BLACK);
		draw();
		// util.context_get().restore(); // related to camera/canvas movement/translate implementation this
	}
	
	if (is_show_fps()) {
		util.calculate_FPS(dt);
	}


	window.requestAnimationFrame(update);
}

// document.addEventListener("mousemove", (event) => {
	// setting.mouse_position.set(event.clientX, event.clientY);
// 	mouse_detect_in_bounding_boxes(event);
// })

//WARNING: might had weird behaviour if there is same name
document.addEventListener("keydown", (event) => {
	for (let inp of settings.inputMap.values()) {
		if (inp.key === event.key) {
			inp.state = INPUT_STATE.PRESSED;
		} 
	}
});

document.addEventListener("keyup", (event) => {
	for (let inp of settings.inputMap.values()) {
		if (inp.key === event.key) {
			inp.state = INPUT_STATE.RELEASED;
		}		
	}
});

/* 
	NOTE: 
	using sorted entitis despite of the component array for the y_pos sort
	because there's sprites and animations that need to be sorted along side
	by its y position, so its more efficient if sort the entity rather than
	component's array.
*/
function entities_y_sorted() {
	if (currScene.entityMap.size === 0) {
		return
	}
	const sortedEntities = new Map([...currScene.entityMap]
		.sort((e1, e2) => 
			(currScene.cTransforms[e1[1].transformIdx].pos.y + currScene.cSprites[e1[1].spriteIdx].halfSize) - 
			(currScene.cTransforms[e2[1].transformIdx].pos.y + currScene.cSprites[e2[1].spriteIdx].halfSize))
		);
	return sortedEntities;
}
