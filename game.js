import * as be from "./src/beyonddd.js";
import * as util from "./src/utility.js";

class Scheduler {
	constructor() {
		this.coroutines = new Set();
		this.before_start = () => {
			console.log("Tween Start");
		};
		this.finish = () => {
			console.log("Tween Finish");
		};
	}

	start(generator) {
		this.before_start();
		const co = generator();
		this.coroutines.add(co);
		return co;
	}

	tick(dt) {
		const cors = [...this.coroutines];

		const coroutinesTotal = cors.length;
		let count = 0;

		for (const co of cors ) {
			const { done } = co.next(dt);
			if (done) {
				count += 1;
				this.coroutines.delete(co);
			}
		}
		if (coroutinesTotal != 0 && count == coroutinesTotal) {
			this.finish();
		}
	} 
}

const SCENE_WIDTH = 1280;
const SCENE_HEIGHT = 720;

// TODO:
// - support sound

be.canvas_setup("canvas", SCENE_WIDTH, SCENE_HEIGHT); // assigning canvas, context, and its size 
const menuScene = be.scene_create("Menu"); // creating scene (with GUI-only type of components)
const game = be.scene_create("Game"); // creating scene (with GUI-only type of components)
be.scene_change("Game"); // change to the scene as the current scene.

// running before the game start. used for setup entities, components, inputs etc. 
const CARD_AMOUNT = 3
const CARD_SIZE = 64
const CARD_GAP = 10;
const CARD_X_OFFSET = (SCENE_WIDTH / 2) - (CARD_SIZE * CARD_AMOUNT) / 2
const CARD_Y_OFFSET = SCENE_HEIGHT - CARD_SIZE - 30

const BLOCK_POSITION_OFFSET = 10;

const MOVE_TIME = 0.1
const BASE_DISTANCE = 60.0

const PLAYER_Y_POS = SCENE_HEIGHT * 0.25;
const TEXT_Y_POS = SCENE_HEIGHT * 0.4;
const ENEMY_Y_POS = SCENE_HEIGHT * 0.5;

const gameData = {
	field : [
		0, 11, 2, -1, -1,
	 -3, 2, -1, 1, 0
	],
	playerStartPos: new be.Vector2(),
	enemyStartPos: new be.Vector2(),

	playerFieldIdx: 0,
	enemyFieldIdx: 0
}
console.log(gameData);
const START_X_POS = (SCENE_WIDTH / 2.0) - (gameData.field.length * BASE_DISTANCE) / 2;

let multiplier = 0;
let canMove = true

let entityToPlay
let scheduler;
let fieldScheduler;

const turnText = be.component_create(be.COMPONENT_TYPE.TEXT);
turnText.text = "TOP TURN";
turnText.tint = be.COLOR.RED;
turnText.pos.x = 20;
turnText.pos.y = 20;

const finishText = be.component_create(be.COMPONENT_TYPE.TEXT);
finishText.text = "GAME OVER";
finishText.font = "120px 'Segoe UI'";
finishText.tint = be.COLOR.RED;
finishText.pos.x = SCENE_WIDTH / 2 - 325;
finishText.pos.y = SCENE_HEIGHT / 2 - 50;
finishText.set_active(false);	

const sounds = new Map();

sounds.set("button", new Audio("assets/button.ogg"));
sounds.set("change_entity", new Audio("assets/change_entity.ogg"));
sounds.set("walk", new Audio("assets/walk.ogg"));
sounds.set("win", new Audio("assets/win.ogg"));

// const buttonSound = new Audio("assets/button.ogg");
// buttonSound.volume = 0.5;

game.setup = () => {
	be.input_press_create("X", be.KEY.SPACE);


	for (let i = 0; i < gameData.field.length; i += 1) {
		const text = be.component_create(be.COMPONENT_TYPE.TEXT);
		text.font = "16px 'Segoe UI'";
		text.tint = be.COLOR.RED;
		text.pos.x = START_X_POS + (BASE_DISTANCE * i);
		text.pos.y = TEXT_Y_POS;

		const effect = gameData.field[i];
		if (i == 0) {
			text.text = `START`;
		} else if (i == gameData.field.length - 1) {
			text.text = `FINISH`;
		}else {
			if (effect < 0) {
				text.text = `${Math.abs(effect)}\nLEFT`;
			} else {
				text.text = `${effect}\nRIGHT`;
			}
		}
	}

	be.asset_load_image("player_anim_walk", "assets/player_walk.png", 210, 43);
	be.asset_load_image("player_anim_idle", "assets/player_idle.png", 175, 43);
	be.asset_load_image("enemy_anim_walk", "assets/enemy_walk.png",210, 43);
	be.asset_load_image("enemy_anim_idle", "assets/enemy_idle.png", 175, 43);

	for (let i = 0; i < CARD_AMOUNT; i += 1) {
		const card = be.entity_create(`card${i}`);
		card.set_active(false);

		be.component_add(card, be.COMPONENT_TYPE.TRANSFORM);
		const cardT = be.component_get(
			card.get_id(), be.COMPONENT_TYPE.TRANSFORM
		);

		
		cardT.pos.x = CARD_SIZE * i + CARD_X_OFFSET + (CARD_GAP * i);
		cardT.pos.y = CARD_Y_OFFSET;

		be.component_add(card, be.COMPONENT_TYPE.SPRITE);
		// be.sprite_set(card.spriteIdx, "icon");

		be.component_add(card, be.COMPONENT_TYPE.BOUNDING_BOX);
		be.bounding_box_set(
			card.boundingBoxIdx, 
			new be.Vector2(CARD_SIZE, CARD_SIZE), 
			be.COLLISION_TYPE.STATIC
		);

		const cardText = be.component_create(be.COMPONENT_TYPE.TEXT);
		cardText.text = `${i+1}\nRIGHT`;
		cardText.font = "16px 'Segoe UI'";
		cardText.tint = be.COLOR.RED;
		cardText.pos.x = cardT.pos.x + 10;
		cardText.pos.y = cardT.pos.y + 25;

	}


	const player = setup_playable_entity("Player", PLAYER_Y_POS);
	const enemy = setup_playable_entity("Enemy", ENEMY_Y_POS);

	const playerT = be.component_get(player.get_id(), be.COMPONENT_TYPE.TRANSFORM);
	const enemyT = be.component_get(enemy.get_id(), be.COMPONENT_TYPE.TRANSFORM);
	gameData.playerStartPos = playerT.pos.clone();
	gameData.enemyStartPos = enemyT.pos.clone();

	set_entity_animation(player, "player_anim_idle", "PlayerIdle", 5, 10, false);
	set_entity_animation(player, "player_anim_walk", "PlayerWalk", 6, 10, true);

	set_entity_animation(enemy, "enemy_anim_walk", "EnemyWalk", 6, 10, false);
	set_entity_animation(enemy, "enemy_anim_idle", "EnemyIdle", 5, 10, true);

	entityToPlay = be.entity_get("Player");

	scheduler = new Scheduler();
	fieldScheduler = new Scheduler();

	scheduler.finish = () => {
		const transfrom = be.component_get(entityToPlay.get_id(), be.COMPONENT_TYPE.TRANSFORM);
		let fieldEffectPos = transfrom.pos.clone();
		let fieldIndex = 0;

		if (entityToPlay.get_name() === "Player") {
			fieldIndex = gameData.playerFieldIdx;
		} else if (entityToPlay.get_name() === "Enemy") {
			fieldIndex = gameData.enemyFieldIdx;
		}

		
		let fieldMultiplier = gameData.field[fieldIndex];
		if(fieldMultiplier + fieldIndex > gameData.field.length) {
			fieldMultiplier = gameData.field.length - 1 - fieldIndex ;
		}
		manipulate_field_index(fieldMultiplier);
		fieldEffectPos.x += BASE_DISTANCE * fieldMultiplier;
		fieldScheduler.start( () => ( move(transfrom, fieldEffectPos, 1) ) );
	}

	fieldScheduler.finish = () => {
		if (
			gameData.playerFieldIdx == gameData.field.length - 1 ||
			gameData.enemyFieldIdx == gameData.field.length - 1
			) 
		{
			finishText.set_active(true);
			canMove = true;
			sounds.get("win").play();
		} else {
			console.log("[INFO] CHANGE ENTITY TO PLAY")
			sounds.get("change_entity").play();
			be.animation_change(entityToPlay, entityToPlay.get_name() + "Idle");

			if (entityToPlay.get_name() === "Player") {
				entityToPlay = be.entity_get("Enemy");
				turnText.text = "BOT TURN";
			} else if (entityToPlay.get_name() === "Enemy") {
				entityToPlay = be.entity_get("Player");
				turnText.text = "TOP TURN";
			}

			be.animation_change(entityToPlay, entityToPlay.get_name() + "Walk");


			canMove = true;
		}
	}

	for (let j = 0; j < 2; j += 1){
		let yPos = 0;
		if (j === 0) {
			yPos = PLAYER_Y_POS;
		} else {
			yPos = ENEMY_Y_POS;
		}

		for (let i = 0; i < gameData.field.length; i += 1) {
			const block = be.entity_create(`block${i}${j}`);
			be.component_add(block, be.COMPONENT_TYPE.TRANSFORM);
			const blockT = be.component_get(block.get_id(), be.COMPONENT_TYPE.TRANSFORM);
			blockT.pos.x = START_X_POS + (BASE_DISTANCE *  i) - BLOCK_POSITION_OFFSET;
			blockT.pos.y = yPos - BLOCK_POSITION_OFFSET;
			be.component_add(block, be.COMPONENT_TYPE.BOUNDING_BOX);
			be.bounding_box_set(
				block.boundingBoxIdx, 
				new be.Vector2(BASE_DISTANCE, BASE_DISTANCE), 
				be.COLLISION_TYPE.STATIC
			);
		}
	}

	set_restart_button();
	
}

function set_restart_button() {
	const restartButton = be.entity_create("RestartButton");
	restartButton.set_active(false);
	be.component_add(restartButton, be.COMPONENT_TYPE.TRANSFORM);
	const restartT = be.component_get(restartButton.get_id(), be.COMPONENT_TYPE.TRANSFORM);
	restartT.pos.x = SCENE_WIDTH - 110;
	restartT.pos.y = 10;
	be.component_add(restartButton, be.COMPONENT_TYPE.BOUNDING_BOX);
	be.bounding_box_set(
		restartButton.boundingBoxIdx, 
		new be.Vector2(100, 50), 
		be.COLLISION_TYPE.STATIC
	);

	const restartText = be.component_create(be.COMPONENT_TYPE.TEXT);
	restartText.text = "Restart";
	restartText.tint = be.COLOR.RED;
	restartText.pos.x = restartT.pos.x + 10;
	restartText.pos.y = restartT.pos.y + 25;
}

function is_restart_button_pressed() {
	const button = be.entity_get("RestartButton");
	if (button.is_active() === true) {
		button.set_active(false);


		const player = be.entity_get("Player");
		const playerT = be.component_get(player.get_id(), be.COMPONENT_TYPE.TRANSFORM);
		playerT.pos.x = gameData.playerStartPos.x; 
		playerT.pos.y = gameData.playerStartPos.y; 
		be.animation_change(player, "PlayerWalk");

		const enemy = be.entity_get("Enemy");
		const enemyT = be.component_get(enemy.get_id(), be.COMPONENT_TYPE.TRANSFORM);
		enemyT.pos.x = gameData.enemyStartPos.x; 
		enemyT.pos.y = gameData.enemyStartPos.y; 
		be.animation_change(enemy, "EnemyIdle");

		gameData.playerFieldIdx = 0;
		gameData.enemyFieldIdx = 0;
		turnText.text = "TOP TURN";

		finishText.set_active(false);
		entityToPlay = player;

		canMove = true;

		console.log("Game Restarted ");
		// use_card(card.get_id());
	}
}

function setup_playable_entity(entityName, yPos) {
	const entity = be.entity_create(entityName);
	be.component_add(entity, be.COMPONENT_TYPE.TRANSFORM);
	const entityT = be.component_get(entity.get_id(), be.COMPONENT_TYPE.TRANSFORM);
	entityT.pos.x = START_X_POS;
	entityT.pos.y = yPos;
	return entity
}

function set_entity_animation(entity, spriteName, animName, frameCount, speed, isActive) {
	be.component_add(entity, be.COMPONENT_TYPE.SPRITE);
	be.sprite_set(entity.spriteIdx, spriteName);

	be.component_add(entity, be.COMPONENT_TYPE.ANIMATION);
	be.animation_set_sprite(entity.animationIdx, entity.spriteIdx);
	be.animation_setup(entity.animationIdx, animName, frameCount, speed);
	const animation = be.component_get(entity.get_id(), be.COMPONENT_TYPE.ANIMATION);
	animation.set_active(isActive);
	// BUG: should set the animationIdx only if isActive is true
}


// logic for inputs or what will happen if an input happenning
game.input = () => {
	if (be.is_key_pressed("X")) {
		be.scene_change("Menu")
	}
	// if (be.is_key_pressed("X")) {
	// 	if (canMove === true) {
	// 		canMove = false
	// 		console.log("[INFO] Move Pause")
	// 	} else {
	// 		canMove = true
	// 		console.log("[INFO] Move Resume")
	// 	}
	// }
	// console.log("pressed  : ",be.is_key_pressed("X"));
	// console.log("down     : ", be.is_key_down("XX"));
	// console.log("released : ", be.is_key_released("XXX"));
};


// used for game logic such as movement, physics, enemies, etc. 
game.update = (dt) => {
	is_restart_button_pressed();
	if (canMove === true) {
		check_card_pressed();
	}
	scheduler.tick(dt);
	fieldScheduler.tick(dt);
};


function check_card_pressed() {
	for (let i = 0; i < CARD_AMOUNT; i += 1) {
		const card = be.entity_get(`card${i}`)
		if (card.is_active() === true) {
			card.set_active(false);
			canMove = false;

			console.log("Card ID : ",card.get_id());
			use_card(card.get_id());
			break;
		}
	}
}

function use_card(cardId) {
	let multiplier = cardId + 1;
	let playIdx
	if (entityToPlay.get_name() === "Player") {
		playIdx = gameData.playerFieldIdx;
	} else {
		playIdx = gameData.enemyFieldIdx;
	}

	if(multiplier + playIdx > gameData.field.length) {
		multiplier = gameData.field.length - playIdx;
	}
	manipulate_field_index(multiplier);

	const cardTransform = be.component_get(entityToPlay.get_id(), be.COMPONENT_TYPE.TRANSFORM);
	let goal = cardTransform.pos.clone();
	goal.x += BASE_DISTANCE * multiplier;
	scheduler.start( () => ( move(cardTransform, goal, 1) ) );
}


function manipulate_field_index(multiplier) {
	if (entityToPlay.get_name() === "Player") {
		if (gameData.playerFieldIdx + multiplier < gameData.field.length) {
			gameData.playerFieldIdx += multiplier;
		} else if (gameData.playerFieldIdx + multiplier < 0)  {
			gameData.playerFieldIdx = 0;
		} else {
			gameData.playerFieldIdx = gameData.field.length - 1;
		}
		return gameData.player

	} else if (entityToPlay.get_name() === "Enemy") {
		if (gameData.enemyFieldIdx + multiplier < gameData.field.length) {
			gameData.enemyFieldIdx += multiplier;
		} else if (gameData.enemyFieldIdx + multiplier < 0)  {
			gameData.enemyFieldIdx = 0;
		} else {
			gameData.enemyFieldIdx = gameData.field.length - 1;
		}
	}
}

function* move(entityTransform, to, duration) {
  let t = 0;
  while (t < duration) {
    t += yield; // yield dt
    const p = Math.min(t / duration, 1);
    entityTransform.pos.x = be.lerp(entityTransform.pos.x, to.x, t);
    entityTransform.pos.y = be.lerp(entityTransform.pos.y, to.y, t);
  }
  sounds.get("walk").play();
}

function mouse_detect_in_bounding_boxes(event) {
	const currSceneBB = be.scene_get_current().cBoundingBoxes;
	for (let bbS of currSceneBB) {
		if (bbS.is_active() && bbS.collisionType === be.COLLISION_TYPE.STATIC) {
			const entBBS = be.entity_get_by_id(bbS.userId);
			const cT = be.scene_get_current().cTransforms[entBBS.transformIdx];
			const cBB = be.scene_get_current().cBoundingBoxes[entBBS.boundingBoxIdx];

			const leftPos = cT.pos.x;
			const rightPos = cT.pos.x + cBB.size.x;
			const topPos = cT.pos.y;
			const botPos = cT.pos.y + cBB.size.y;

			const rect = be.canvas_get().getBoundingClientRect();
			const mousePosX = event.clientX - rect.left;
			const mousePosY = event.clientY - rect.top;

			const isMouseInside = (
				mousePosX >= leftPos &&
				mousePosX <= rightPos &&
				mousePosY >= topPos &&
				mousePosY <= botPos
			);
			if (event.type == "click" && isMouseInside) {
				entBBS.set_active(true);
				sounds.get("button").play();
			}
			else {
				if (entBBS.is_active() === true)
				{
					entBBS.set_active(false);
				}
			}

		}
	}
}



document.addEventListener("click", (event) => {
	if (canMove === true) {
		mouse_detect_in_bounding_boxes(event);
	}
})



window.onload = be.init; // entry point or game running
