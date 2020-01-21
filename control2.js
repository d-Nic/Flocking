let body = document.getElementById('body');
body.style.backgroundColor = '#000721';

// Constants
let moveSpeed = 5 // Speed at which nodes move
let angleThresh = 40 // Max angle at which nodes will turn
let turnRate = 1000 // How often a node turns
let distThresh = 100 // How close nodes are to notice eachother
let tooClose = 10
let NUM_NODES = 100

let nodes = [];

const average = arr => arr.reduce( (x, y) => parseInt(x.getAttribute('direction')) + parseInt(y.getAttribute('direction')), 0 ) / arr.length

function randomInt() {
	let num = (Math.random()) + 1 ;
	if ((Math.round(Math.random())) == 1) {
		num = num*-1;
	}
	return num;
}

function getNear(node) {
	nearNodes = [];
	for (let i = 0; i < nodes.length; i++) {
		if (nodes[i] != node) {
			let distY = (parseInt(node.style.top)-parseInt(nodes[i].style.top))*(parseInt(node.style.top)-parseInt(nodes[i].style.top));
			let distX = (parseInt(node.style.left)-parseInt(nodes[i].style.left))*(parseInt(node.style.left)-parseInt(nodes[i].style.left));
			let dist = Math.sqrt(distY+distX);
			//console.log('DISTANCE', dist);
			if (dist < distThresh) {
				nearNodes.push(nodes[i])
			}
		}
	}	
	//console.log(nearNodes)
	return nearNodes;
}

for (let i = 0; i < NUM_NODES; i++) {
	let childNode = document.createElement('div');
	childNode.style.backgroundColor = '#dfe8f7';
	childNode.style.position = 'absolute';
	childNode.style.height = '5px';
	childNode.style.width = '5px';
	
	childNode.style.left = (Math.floor((Math.random() * window.innerWidth) + 1)).toString().concat('px');
	childNode.style.top = (Math.floor((Math.random() *  window.innerHeight) + 1)).toString().concat('px');
	childNode.setAttribute('phase', turnRate)
	childNode.setAttribute('xdir',randomInt() )
	childNode.setAttribute('ydir',randomInt() )
	childNode.setAttribute('direction',Math.floor((Math.random() * 360) + 1))
	childNode.setAttribute('speed',Math.floor((Math.random() * 3) + 1))
	nodes.push(childNode);
	body.appendChild(childNode);
}

function align (node) {
	// Move in average direction of nodes within distThresh
	let nearNodes = getNear(node);
	if (nearNodes.length == 0) {
		return false;
	}
	let total = 0;
	for (let i = 0; i < nearNodes.length; i++) {
		total += parseInt(nearNodes[i].getAttribute('direction'));
	}
	let averageDirection = total/nearNodes.length;
	//console.log('Aligning with average', parseInt(averageDirection))

	//TODO : Make the turning average between current direction and new, rather than instant
	turnNode(node, (parseInt(averageDirection) + parseInt(node.getAttribute('direction')))/2);
	//turnNode(node, parseInt(averageDirection));
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// Keep nodes inside the window size
function keepInside(node) {
	var wPos = parseInt(node.style.left.match(/[0-9]*/)[0])+ parseInt(node.getAttribute('xdir'))
	if ((wPos+10) > window.innerWidth) {
		node.style.left = '20px';
	} else {
		node.style.left = wPos.toString().concat('px');
	}
	var tPos = parseInt(node.style.top.match(/[0-9]*/)[0]) + parseInt(node.getAttribute('ydir')) 

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
			align(nodes[i])
		}
		await sleep(moveSpeed);
	}
}

moveHeadNode();

/**
function findScreenCoords(mouseEvent)
{
  var xpos;
  var ypos;
  if (mouseEvent)
  {
    //FireFox
    xpos = mouseEvent.screenX;
    ypos = mouseEvent.screenY;
  }
  else
  {
    //IE
    xpos = window.event.screenX;
    ypos = window.event.screenY;
  }
  document.getElementById("screenCoords").innerHTML = xpos + ", " + ypos;
}
document.getElementById("body").onmousemove = findScreenCoords;
**/