import {Vectro2} from "./type.js";


function limit(vector, max) {
	const mag = vector.magnitude();
	if (mag > max) {
		return vector.normalize().multiply(max);
	}
	return vector;
}

function seek(velocity, selfPos, targetPos) {
	const desired = selfPos.substract(targetPos);
	const steer = desired.normalize().multiply(targetPos).substract(velocity);
	return limit(steer, )
}
// example -----------------------------------------------------------------------------------------------
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2D(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2D(this.x - v.x, this.y - v.y);
    }

    multiply(n) {
        return new Vector2D(this.x * n, this.y * n);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2D();
        return new Vector2D(this.x / mag, this.y / mag);
    }
}

class Vehicle {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D();
        this.acceleration = new Vector2D();
        this.maxSpeed = 4;
        this.maxForce = 0.1;
        this.mass = 1;
    }

    seek(target) {
        const desired = target.subtract(this.position);
        const steer = desired.normalize().multiply(this.maxSpeed)
            .subtract(this.velocity);
        return this.limit(steer, this.maxForce);
    }

    flee(target) {
        return this.seek(target).multiply(-1);
    }

    arrive(target, slowingRadius = 100) {
        const desired = target.subtract(this.position);
        const distance = desired.magnitude();
        
        let speed = this.maxSpeed;
        if (distance < slowingRadius) {
            speed = this.maxSpeed * (distance / slowingRadius);
        }

        const steer = desired.normalize().multiply(speed)
            .subtract(this.velocity);
        return this.limit(steer, this.maxForce);
    }

    wander(wanderRadius = 50, wanderDistance = 80, wanderAngle = 0.5) {
        const center = this.velocity.normalize().multiply(wanderDistance);
        const offset = new Vector2D(
            Math.cos(wanderAngle) * wanderRadius,
            Math.sin(wanderAngle) * wanderRadius
        );
        return center.add(offset);
    }

    limit(vector, max) {
        const mag = vector.magnitude();
        if (mag > max) {
            return vector.normalize().multiply(max);
        }
        return vector;
    }

    update() {
        this.velocity = this.velocity.add(this.acceleration);
        this.velocity = this.limit(this.velocity, this.maxSpeed);
        this.position = this.position.add(this.velocity);
        this.acceleration = this.acceleration.multiply(0);
    }

    applyForce(force) {
        this.acceleration = this.acceleration.add(force.multiply(1/this.mass));
    }
}

// Usage example
const vehicle = new Vehicle(100, 100);
const targetPos = new Vector2D(200, 200);

function gameLoop() {
    // Seek behavior
    const seekForce = vehicle.seek(targetPos);
    vehicle.applyForce(seekForce);
    
    // Update position
    vehicle.update();
    
    requestAnimationFrame(gameLoop);
}