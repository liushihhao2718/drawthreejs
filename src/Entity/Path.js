let uuid = require( 'uuid');

class Node {
	constructor(x, y, type = 'line'){
		this.key = uuid.v1();
		this.type = type;//type: line, curve, smooth, offcurve
		this.x = x;
		this.y = y;

		this.next = undefined;
		this.prev = undefined;
	}

	toString(){
		return `${this.x} ${this.y} ${this.type}`;
	}
}

class Path{
	constructor(nodes, closed = true){
		this.nodeMap = new Map();
		this.head = undefined;
		this.tail = undefined;

		this.link(nodes, closed);
	}
	link(nodes, closed){

		let handle = uuid.v1();
		this.head = handle;
		this.nodeMap.set(handle, nodes[0]);

		for (var i = 1; i < nodes.length; i++) {
			let key = uuid.v1();

			this.nodeMap.get(handle).next = key;
			nodes[i].prev = handle;

			this.nodeMap.set(key, nodes[i]);
			handle = key;
		}

		// this.tail = uuid.v1();
		// this.nodeMap.get(handle).next = this.tail;
		// nodes[nodes.length-1].prev = handle;

		// this.nodeMap.set(this.tail, nodes[i]);
			

		if (closed) {
			this.nodeMap.get(this.head).prev = handle;
			this.nodeMap.get(handle).next = this.head;
			this.tail = this.head;
		}else{
			this.tail = handle;
			this.nodeMap.get(this.head).prev = undefined;
			this.nodeMap.get(this.tail).next = undefined;
		}
	}
	toString(){
		let state = 'start',buffer=[];
		let error_flag = false;
		let d = '';
		let index = this.head;

		let error_code = 0;

		let round = this.nodeMap.size;
		if (this.closed) round++;//
		for(let i=0;i<=round;i++){

			if (index === undefined) break;
			let n = this.nodeMap.get(index);

			if (error_flag)  break;
			switch(state){
				case 'start':
					if (n.type != 'offcurve') {
						state = 'curve';
						d+=`M${n.x},${n.y}`;
					}
					else error(1);
					break;
				case 'curve':
					if(n.type === 'line' || n.type === 'curve'){
						state = 'line';
						d+=` L${n.x},${n.y}`;
					}
					else if(n.type === 'offcurve'){
						state = 'offcurve';
						buffer.push(n);
					}else error(2);
					break;
				case 'line':
					if(n.type === 'line'){
						state = 'line';
						d+=` L${n.x},${n.y}`;
					}
					else if(n.type === 'curve' || n.type==='smooth'){
						state = 'curve';
						d+=` L${n.x},${n.y}`;
					}
					else error(3);
					break;
				case 'offcurve':
					if(n.type === 'offcurve') {
						state = 'offcurve2';
						buffer.push(n);
					}
					else error(4);
					break;
				case 'offcurve2':
					if(n.type === 'curve' || n.type==='smooth'){
						state = 'curve';
						let c =` C${buffer[0].x},${buffer[0].y}`
							+` ${buffer[1].x},${buffer[1].y}`
							+` ${n.x},${n.y}`;
						d += c;
						buffer.splice(0, 2);
					}
					else error(5);
					break;
			}
			index = this.nodeMap.get(index).next;
		}

		if (error_flag) return 'error'+error_code;
		if (this.closed) d+='Z';
		return d;

		function error(code){
			error_flag = true;
			error_code = code;
		}
	}

	//新的node必須都是line node，然後透過其他操作來改變
	addPoint(x, y){
		if(this.closed) return;
		let new_node = new Node(x,y,'line'),
			key = uuid.v1();

		new_node.prev = this.tail;
		this.nodeMap.get(this.tail).next = key;

		this.nodeMap.set(key, new_node);
		this.tail = key;
	}

	cut(){}

	deleteNode(key) {
		let next_key = this.nodeMap.get(key).next;
		while(this.nodeMap.get(next_key) !=undefined && this.nodeMap.get(next_key).type === 'offcurve'){
			const temp = this.nodeMap.get(next_key).next;
			this.nodeMap.delete(next_key);
			next_key = temp;
		}
		let prev_key = this.nodeMap.get(key).prev;
		while(this.nodeMap.get(prev_key) != undefined && this.nodeMap.get(prev_key).type === 'offcurve'){
			const temp = this.nodeMap.get(prev_key).prev;
			this.nodeMap.delete(prev_key);
			prev_key = temp;
		}
		if (prev_key != undefined) this.nodeMap.get(prev_key).next = next_key;

		if (next_key != undefined) this.nodeMap.get(next_key).prev = prev_key;
		if (key === this.head) this.head = next_key;
		if (key === this.tail) this.tail = prev_key;

	}
}

export {Node, Path};