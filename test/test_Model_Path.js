import test from 'ava';
import {Node, Path} from '../src/Entity/Path';

test('make a Node', t=>{
	let test_node = new Node(10,10,'curve'),
		checkString = '10 10 curve';

	t.true(test_node.toString() === checkString);
});
function make_test_path(close = true){
	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		n6 = new Node(400, 100, 'curve'),
		n7 = new Node(380, 50, 'line'),
		n8 = new Node(250, 50, 'line');

	return new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], close);
}
test('make a close Path with nodes', t=>{

	let path_close = true,
		path = make_test_path(path_close),
		handle = path.head;
	t.true(path.nodeMap.get(handle).toString() === '100 100 curve');
	handle = path.nodeMap.get(handle).next;
	t.true(path.nodeMap.get(handle).toString() === '50 150 offcurve');

	handle = path.tail;
	t.true(path.nodeMap.get(handle).toString() === '100 100 curve');

	handle = path.nodeMap.get(handle).prev;
	t.true(path.nodeMap.get(handle).toString() === '250 50 line');
});

test('make a close Path with nodes 2', t=>{


	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		n6 = new Node(400, 100, 'curve'),
		n7 = new Node(380, 50, 'curve'),
		n8 = new Node(250, 50, 'curve'),
		path = new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], true),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 400,100 L380,50 L250,50 L100,100';

	t.true(path.toString() === d);

});

test('curve between tail and head', t=>{


	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		path = new Path([n0,n1,n2,n3,n4,n5], true),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 100,100';
	t.true(path.toString() === d);

});

test('make a open Path with nodes', t=>{

	let path_close = false,
		path = make_test_path(path_close),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 400,100 L380,50 L250,50';

	t.true(path.toString() === d);
});

test('add node to open path', t=>{
	let path = make_test_path(false),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 400,100 L380,50 L250,50 L10,10';

	path.addPoint(10,10);

	t.true(path.toString() === d);
});

test('delete head node in open path', t=>{
	const path = make_test_path(false),
		d = 'M250,100 C300,70 350,150 400,100 L380,50 L250,50';
	
	path.deleteNode(path.head);
	t.true(path.toString() === d);
});

test('delete tail node in open path', t=>{
	const path = make_test_path(false),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 400,100 L380,50';
	
	path.deleteNode(path.tail);
	t.true(path.toString() === d);
});

test('delete curve node open path', t=>{
	const path = make_test_path(false),
		d = 'M100,100 C50,150 350,150 400,100 L380,50 L250,50';

	let iter = path.nodeMap.keys();
	iter.next();
	iter.next();
	iter.next();
	const k3 = iter.next().value;
	path.deleteNode(k3);
	t.true(path.toString() === d);
});