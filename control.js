let body = document.getElementById('body');
body.style.backgroundColor = '#000721';

// Constants
let moveSpeed = 1 // Speed at which nodes move
let angleThresh = 40 // Max angle at which nodes will turn
let turnRate = 1000 // How often a node turns
let distThresh = 35 // How close nodes are to notice eachother
let tooClose = 10
let NUM_NODES = 50
let ACTIVE = true

let nodes = [];

// Creates nodes all at random positions and directions
function startup() {

	// If page is to be reset
	if (nodes.length > 0) { 
		location.reload()
	}

	nodes = []

	for (let i = 0; i < NUM_NODES; i++) {

		// Aesthetics
		let childNode = document.createElement('div');
		childNode.style.backgroundColor = '#dfe8f7';
		childNode.style.position = 'absolute';
		childNode.style.height = '8px';
		childNode.style.width = '8px';
		
		// Position
		childNode.style.left = (Math.floor((Math.random() * window.innerWidth) + 1)).toString().concat('px');
		childNode.style.top = (Math.floor((Math.random() *  window.innerHeight) + 1)).toString().concat('px');
		childNode.setAttribute('phase', turnRate)
		childNode.setAttribute('xdir',0)
		childNode.setAttribute('ydir',0)
		childNode.setAttribute('id','main')
		childNode.setAttribute('direction',Math.floor((Math.random() * 360) + 1))
		childNode.setAttribute('speed',Math.floor((Math.random() * 2) + 1))
		nodes.push(childNode);
		body.appendChild(childNode);
	}

}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Returns nodes within a distThresh radius
function getNear(node) {
	nearNodes = [];
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i] != node) {
			let distY = (parseInt(node.style.top)-parseInt(nodes[i].style.top))*(parseInt(node.style.top)-parseInt(nodes[i].style.top));
			let distX = (parseInt(node.style.left)-parseInt(nodes[i].style.left))*(parseInt(node.style.left)-parseInt(nodes[i].style.left));
			let dist = Math.sqrt(distY+distX);
			if (dist < distThresh) {
				nearNodes.push(nodes[i])
			}
		}
	}	
	return nearNodes;
}

// Returns closest nodes within a nearby radius
function closest(node, nearby) {
	nearNodes = [];
    let closest = window.innerWidth
    let toSend = false
	for (let i = 0; i < nearby.length; i++) {
		if (nearby[i] != node) {
			let distY = (parseInt(node.style.top)-parseInt(nearby[i].style.top))*(parseInt(node.style.top)-parseInt(nearby[i].style.top));
			let distX = (parseInt(node.style.left)-parseInt(nearby[i].style.left))*(parseInt(node.style.left)-parseInt(nearby[i].style.left));
			let dist = Math.sqrt(distY+distX);
			if (dist < closest) {
                closest = dist
				toSend = nearby[i]
			}
		}
	}	
    return toSend;
}


// Turn set node turn values based on given direction
function turnNode(node, direction) {
	if (direction) {
		node.setAttribute('direction', direction)
		xDir = Math.sin((direction%360) * Math.PI/180)*10;
		yDir = Math.cos((direction%360) * Math.PI/180)*10;
		node.setAttribute('phase',0)
		node.setAttribute('xdir',xDir)
		node.setAttribute('ydir',yDir)

		return
	} else {
		// If no direction is given, find a random direction that isn't vastly different to current one
		// this difference is defined by angleThresh
		while (true) {
			let newDirection = Math.floor((Math.random() * 360) + 1);
			// Right to left
			if (newDirection > 270 && parseInt(node.getAttribute('direction')) < 90) { 
				if ((Math.abs(newDirection%90) - parseInt(node.getAttribute('direction'))) < angleThresh) {
					node.setAttribute('direction', newDirection)
					xDir = Math.sin(newDirection * Math.PI/180)*10;
					yDir = Math.cos(newDirection * Math.PI/180)*10;
					node.setAttribute('phase',0)
					node.setAttribute('xdir',xDir)
					node.setAttribute('ydir',yDir)
					break
				}
			} 
			if (Math.abs(newDirection - parseInt(node.getAttribute('direction'))) < angleThresh) {
				node.setAttribute('direction', newDirection)
				xDir = Math.sin(newDirection * Math.PI/180)*10;
				yDir = Math.cos(newDirection * Math.PI/180)*10;
				node.setAttribute('phase',0)
				node.setAttribute('xdir',xDir)
				node.setAttribute('ydir',yDir)
				break
			}
		}
	}
}

// Move in average direction of nodes within distThresh
function align (node) {
	
	let nearNodes = getNear(node);
	if (nearNodes.length == 0) {
		return false;
	}
	let total = 0;
	for (let i = 0; i < nearNodes.length; i++) {
		total += parseInt(nearNodes[i].getAttribute('direction'));
	}
	let averageDirection = total/nearNodes.length;

	// TODO : Make the turning average between current direction and new, rather than instant
	turnNode(node, (parseInt(averageDirection) + parseInt(node.getAttribute('direction')))/2);

}

// Move away from nearby nodes within distThresh if too close 
function separation (node) {
	
	let nearNodes = getNear(node);
	if (nearNodes.length == 0) {
		return false;
	}
	let closeNodes = closest (node, 200)
	if (closeNodes == false ) {
		return false
	}

	let total = 0;
	let newX = 0;
	let newY = 0;
	let newDir = 0;
    console.log(parseInt(closeNodes.getAttribute('direction')) + 180);
	let avDir = parseInt(closeNodes.getAttribute('direction')) + 180;

    node.setAttribute('direction', avDir);
}

// Move towards nodes within distThresh
function cohesion (node) {
	let nearNodes = getNear(node);
	if (nearNodes.length == 0) {
		return false;
	}
	let total = 0;
	let newX = 0;
	let newY = 0;
	let newDir = 0;
	for (let i = 0; i < nearNodes.length; i++) {
		newX += parseInt(nearNodes[i].getAttribute('xdir'));
		newY += parseInt(nearNodes[i].getAttribute('ydir'));
		newDir += parseInt(nearNodes[i].getAttribute('direction'))
	}
	let averageX = newX/nearNodes.length;
	let averageY = newY/nearNodes.length;
	let avDir = newDir/nearNodes.length;
	node.setAttribute('xdir', newX);
	node.setAttribute('ydir', newY);
	node.setAttribute('direction', avDir);

}

// Keep nodes inside the window size
function keepInside(node) {
	var wPos = parseInt(node.style.left.match(/[0-9]*/)[0])+ parseInt(node.getAttribute('xdir')) +  parseInt(node.getAttribute('speed'));
	if ((wPos+10) > window.innerWidth) {
		node.style.left = '20px';
	} else {
		node.style.left = wPos.toString().concat('px');
	}
	var tPos = parseInt(node.style.top.match(/[0-9]*/)[0]) + parseInt(node.getAttribute('ydir')) + parseInt(node.getAttribute('speed'));

	if ((tPos+10) > window.innerHeight) {
		node.style.top = '20px';
	} else {
		node.style.top = tPos.toString().concat('px');
	}

	if ((tPos-10) <= 0) {
		let newH = window.innerHeight - 10;
		node.style.top = newH.toString().concat('px');
	}

	if ((wPos-10) <= 0) {
		let newH = window.innerWidth - 10;
		node.style.left = newH.toString().concat('px');
	}

}

async function moveHeadNode() {
	while (true) {
		for (let i = 0; i < nodes.length; i++) {
           
			keepInside(nodes[i])

			// Apply the 3 rules
			align(nodes[i])
			cohesion(nodes[i])
			separation(nodes[i]) // TODO: Needs to be improved

			// Moves node in current direction
			turnNode (nodes[i], parseInt(nodes[i].getAttribute('direction'))) 

			var phase = parseInt(nodes[i].getAttribute('phase'))
			if (phase == turnRate) {
				// If the node is to be turned (used to add some random movement)
				phase = 0
				nodes[i].setAttribute('speed',Math.floor((Math.random() * 3) + 1))
				turnNode(nodes[i],false)
			}
			nodes[i].setAttribute('phase', phase+1)
		}
		phase++;
		await sleep(moveSpeed);
	}
}
startup();
moveHeadNode();


