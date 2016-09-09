class Node {
	constructor(x, y, type = 'line'){
		this.type = type;//type: line, curve, smooth, offcurve
		this.x = x;// ( x, y )
		this.y = y;
	}

	toString(){
		return `${this.x} ${this.y} ${this.type}`;
	}
}

class Path{
	constructor(nodes, closed = true){
		this.nodes = nodes;
		this.closed = closed;

		this.head = 0;
		this.tail = nodes.length-1;
	}

	toString(){
		let state = 'start',buffer=[];
		let error_flag = false;
		let d = '';
		let index = this.head;
		let error_code = 0;
		for(let i=0;i<this.nodes.length;i++){
						console.log('index'+index);

			let n = this.nodes[index];
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
				if(n.type === 'line'){
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
				if (n.type === 'offcurve') {
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
			index = this.next(index);
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
		let new_node = new Node(x,y,'line');
		this.nodes.splice(this.tail+1, 0, new_node);
		this.tail = this.next(this.tail);

		console.log('tail'+this.tail);
		console.log(this.nodes);
	}

	cut(p1, p2){
		if (this.closed) {
			this.head = this.nodes.indexOf(p2);
			this.tail = this.nodes.indexOf(p1);

			while(this.nodes[this.head].type === 'offcurve')
				this.head = this.next(this.head);
			while(this.nodes[this.tail].type === 'offcurve')
				this.tail = this.prev(this.tail);

			let node_h = this.nodes[this.head],
				node_t = this.nodes[this.tail];

			let cut_size = this.head-this.tail-1;
			this.nodes.splice(this.tail+1, cut_size);
			this.closed = false;
			this.head = this.nodes.indexOf(node_h);
			console.log('head' + this.head);

			this.tail = this.nodes.indexOf(node_t) + this.head;
			return [this];
		}
		else {
			this.h1 = this.head;
			this.t1 = this.nodes.indexOf(p1);
			this.h2 = this.nodes.indexOf(p2);
			this.t2 = this.tail;

			while(this.nodes[this.t1].type === 'offcurve') {
				this.t1 = this.prev(this.t1);
			}

			while(this.nodes[this.h2].type === 'offcurve') {
				this.h2 = this.next(this.h2);
			}

			let nodes1 = this.nodes.slice(this.h1, this.t1+1),
				nodes2 = this.nodes.slice(this.h2, this.t2+1);

			return [new Path(nodes1, false), new Path(nodes2, false)];
		}
	}

	next(index) {
		index = (index + 1)%this.nodes.length;
		return index;
	}
	prev(index) {
		index = (index - 1 + this.nodes.length)%this.nodes.length;
		return index;
	}
}

export {Node, Path};

// let n0 = new Node(100, 100, 'curve'),
// 	n1 = new Node(50, 150, 'offcurve'),
// 	n2 = new Node(200, 150, 'offcurve'),
// 	n3 = new Node(250, 100, 'smooth'),
// 	n4 = new Node(300, 70, 'offcurve'),
// 	n5 = new Node(350, 150, 'offcurve'),
// 	n6 = new Node(400, 100, 'curve'),
// 	n7 = new Node(380, 50, 'line'),
// 	n8 = new Node(250, 50, 'line'),
// 	path = new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], true);

// // path.addPoint(10,10);
// 	// console.log(path.toString());
// let cuted = path.cut(n5, n6);
// console.log(`head ${cuted[0].head}`);
// console.log(`tail ${cuted[0].tail}`);
// console.log(cuted[0].toString());
// console.log(cuted[0].nodes);


