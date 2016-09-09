import test from 'ava';
import {Node, Path} from '../src/Entity/Path';

test('make a Node', t=>{
	let test_node = new Node(10,10,'curve'),
		checkString = '10 10 curve';

	t.true(test_node.toString() === checkString);
});
function make_test_path(close = true){
	let n1 = new Node(100, 100, 'curve'),
		n2 = new Node(50, 150, 'offcurve'),
		n3 = new Node(200, 150, 'offcurve'),
		n4 = new Node(250, 100, 'smooth'),
		n5 = new Node(300, 70, 'offcurve'),
		n6 = new Node(350, 150, 'offcurve'),
		n7 = new Node(400, 100, 'curve'),
		n8 = new Node(380, 50, 'line'),
		n9 = new Node(250, 50, 'line');

	return new Path([n1,n2,n3,n4,n5,n6,n7,n8,n9], close);
}
test('make a close Path with nodes', t=>{

	let path_close = true,
		path = make_test_path(path_close),
		d = 'M100,100 C50,150 200,150 250,100 C300,70 350,150 400,100 L380,50 L250,50Z';

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

test('cut the close path', t =>{
	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		n6 = new Node(400, 100, 'curve'),
		n7 = new Node(380, 50, 'line'),
		n8 = new Node(250, 50, 'line'),
		path = new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], true);
	
	path.cut(n5, n6);

	let new_path = new Path([n6,n7,n8,n0,n1,n2,n3], false);
	t.true(path.toString() == new_path.toString());
});

test('cut the open path 5 6', t =>{
	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		n6 = new Node(400, 100, 'curve'),
		n7 = new Node(380, 50, 'line'),
		n8 = new Node(250, 50, 'line'),
		path = new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], false);
	
	let cuted = path.cut(n5, n6);

	let p1 = new Path([n0,n1,n2,n3], false),
		p2 = new Path([n6,n7,n8], false);
	t.true(cuted[0].toString() == p1.toString());
	t.true(cuted[1].toString() == p2.toString());
});

test('cut the open path 4 5', t =>{
	let n0 = new Node(100, 100, 'curve'),
		n1 = new Node(50, 150, 'offcurve'),
		n2 = new Node(200, 150, 'offcurve'),
		n3 = new Node(250, 100, 'smooth'),
		n4 = new Node(300, 70, 'offcurve'),
		n5 = new Node(350, 150, 'offcurve'),
		n6 = new Node(400, 100, 'curve'),
		n7 = new Node(380, 50, 'line'),
		n8 = new Node(250, 50, 'line'),
		path = new Path([n0,n1,n2,n3,n4,n5,n6,n7,n8], false);
	
	let cuted = path.cut(n4, n5);

	let p1 = new Path([n0,n1,n2,n3], false),
		p2 = new Path([n6,n7,n8], false);
	t.true(cuted[0].toString() == p1.toString());
	t.true(cuted[1].toString() == p2.toString());
});