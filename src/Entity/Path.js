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
		let leftKey = this.nodeMap.get(key).prev,
			rightKey = this.nodeMap.get(key).next,
			L,R;

		if(key === this.head){
			/** head => (rightKey) => (right2Key) => R
				 *
				 *  			head == R
			*/
			if (rightKey){
				if(this.isOff(rightKey)){
					let right2Key = this.nodeMap.get(rightKey).next;
					R = this.nodeMap.get(right2Key).next;
					this.nodeMap.delete(rightKey);
					this.nodeMap.delete(right2Key);	
				}
				else {
					R = rightKey;
				}		
				this.nodeMap.delete(this.head);
				this.head = R;
				this.nodeMap.get(this.head).prev = undefined;
			}
		}else if(key === this.tail){
			/** L => (left2Key) => (leftKey) => tail
			 *
			 *  			tail == L
			*/
			console.log(this.nodeMap.get(leftKey).toString());
			if(leftKey){
				if (this.isOff(leftKey)) {
					let left2Key = this.nodeMap.get(leftKey).prev;
					L = this.nodeMap.get(left2Key).prev;
					this.nodeMap.delete(leftKey);
					this.nodeMap.delete(left2Key);
				}
				else{
					L = leftKey;
				}

				this.nodeMap.delete(this.tail);
				this.tail = L;
				this.nodeMap.get(this.tail).next = undefined;
			}

		}
		else if(!this.isOff(leftKey) && !this.isOff(rightKey)){
			L = this.nodeMap.get(key).prev,
			R = this.nodeMap.get(key).next;
			if(L) this.nodeMap.get(L).next = R;
			if(R) this.nodeMap.get(R).prev = L;

			this.nodeMap.delete(key);
		}
		else if(this.isOff(leftKey) && this.isOff(rightKey)) {
			/** L => leftKey => key => rightKey => R
			 *
			 *  			L => R
			*/
			L = this.nodeMap.get(leftKey).prev,
			R = this.nodeMap.get(rightKey).next;
			this.nodeMap.get(L).next = R;
			this.nodeMap.get(R).prev = L;

			this.nodeMap.delete(key);
			this.nodeMap.delete(leftKey);
			this.nodeMap.delete(rightKey);
		}
		else if(this.isOff(leftKey) && !this.isOff(rightKey)) {
			/** L => (left2Key) =>leftKey => key => R
			 *
			 *  			L => R
			*/
			let left2Key = this.nodeMap.get(leftKey).prev;
			if (this.isOff(left2Key)) {
				L = this.nodeMap.get(left2Key).prev;
				this.nodeMap.delete(left2Key);
			}
			else{
				L = left2Key;
			}
			R = rightKey;

			this.nodeMap.get(L).next = R;
			this.nodeMap.get(R).prev = L;

			this.nodeMap.delete(key);
			this.nodeMap.delete(leftKey);
		}
		else if(!this.isOff(leftKey) && this.isOff(rightKey)){
			/** L => key => rightKey => (right2Key) => R
				 *
				 *  			L => R
			*/
			let right2Key = this.nodeMap.get(rightKey).next;
			if (this.isOff(right2Key)) {
				R = this.nodeMap.get(right2Key).next;
				this.nodeMap.delete(right2Key);
			}
			else {
				R = right2Key;
			}
			L = leftKey;

			if(L) this.nodeMap.get(L).next = R;
			if(R) this.nodeMap.get(R).prev = L;
			this.nodeMap.delete(key);
			this.nodeMap.delete(rightKey);
		}
	}
	isOff(k) {
		if(k === undefined) return false;

		return (this.nodeMap.get(k).type == 'offcurve');
	}

}

export {Node, Path};