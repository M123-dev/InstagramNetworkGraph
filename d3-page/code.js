(async () => {
	// eslint-disable-next-line no-undef
	const params = new Proxy(new URLSearchParams(window.location.search), {
		get: (searchParams, prop) => searchParams.get(prop),
	});
	// Get the value of "some_key" in eg "https://example.com/?some_key=some_value"
	const mock_version = params.mock_version === "true";
	let config_obj;

	let graph;
	let hover = false;
	let dragging = false;

	if (mock_version) {
		console.log("Generating mock data");
		config_obj = {
			username: "Root",
			attraceForce: -400,
			link_strength: 0.5,
			colorful: true,
			max_size: 100,
		};

		let obj = {
			nodes: [],
			links: [],
		};

		const alphabet = [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F",
			"G",
			"H",
			"I",
			"J",
			"K",
			"L",
			"M",
			"N",
			"O",
			"P",
			"Q",
			"R",
			"S",
			"T",
			"U",
			"V",
			"W",
			"X",
			"Y",
			"Z",
		];

		obj.nodes.push({
			id: "Root",
			size: alphabet.length,
		});

		for (let i = 0; i < alphabet.length; i++) {
			let random = Math.floor(Math.random() * (alphabet.length - 1)) / 3;

			obj.nodes.push({
				id: alphabet[i],
				size: (random + 1) * 3,
			});

			obj.links.push({
				target: alphabet[i],
				source: "Root",
				length: Math.floor(Math.random() * 10) + 600,
			});

			for (let j = 0; j < random; j++) {
				obj.links.push({
					source: alphabet[i],
					target: alphabet[j],
					length: Math.floor(Math.random() * 10) + 600,
				});
			}
		}
		graph = obj;
	}

	let svg = d3.select("svg"),
		width = +svg.node().getBoundingClientRect().width,
		height = +svg.node().getBoundingClientRect().height;

	var g = svg.append("g");

	var color = d3.scaleSequential(d3.interpolateSinebow);

	if (config_obj === undefined) {
		config_obj = await (await fetch("config.json")).json();
	}
	let root_username = config_obj["username"];
	let attraceForce = config_obj["attraceForce"];
	let link_strength = config_obj["link_strength"];
	let colorful = config_obj["colorful"] === true;
	let max_size = config_obj["max_node"];

	var simulation = d3
		.forceSimulation()
		.force("charge", d3.forceManyBody())
		.force("center", d3.forceCenter(width / 2, height / 2))
		.force("attraceForce", d3.forceManyBody().strength(attraceForce))
		.force(
			"collision",
			d3.forceCollide().radius(function (d) {
				return d.size;
			})
		)
		.force(
			"link",
			d3
				.forceLink()
				.id(function (d) {
					return d.id;
				})
				.distance(function (d) {
					return d.length;
				})
				.strength(link_strength)
		);

	console.log(`Root user is: ${root_username}`);

	if (graph === undefined) {
		console.log("Loading json...");
		const d3_response = await fetch("data.json");
		graph = await d3_response.json();

		console.log("Loaded data.json");
	}

	console.log(
		`Loaded ${graph.nodes.length} nodes and ${graph.links.length} links`
	);

	var link = g
		.selectAll("line")
		.data(graph.links)
		.enter()
		.append("line")
		.style("stroke-width", function (d) {
			return d.value;
		})
		.style("stroke", function (d) {
			if (d.source === root_username) {
				return "#f54242";
			} else {
				return "#999";
			}
		})
		.style("opacity", "1")
		.attr("group", function (d) {
			return d.group;
		});

	var node = g
		.attr("class", "nodes")
		.selectAll("g")
		.data(graph.nodes)
		.enter()
		.append("g")
		.call(
			d3
				.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended)
		);

	var circle = node
		.append("circle")
		.attr("r", function (d) {
			return d.size;
		})
		.attr("fill", "#fff")
		.style("stroke-width", function (d) {
			return d.size / (max_size / 8) + 2;
		})
		.style("stroke", "#1f77b4")
		.on("mouseenter", (evt, d) => {
			if (dragging) {
				return;
			}

			console.log("Mouseenter");
			hover = true;
			let map = new Map();
			link
			//.attr("display", "none")
				.style("opacity", "0.2")
				.filter((l) => {
					if (l.source.index === d) {
						map.set(l.target.id, null);
						return true;
					} else if (l.target.index === d) {
						map.set(l.source.id, null);
						return true;
					}
					return false;
				})
				.style("opacity", "1");

			node
				.style("opacity", "0.4")
				.filter((n) => {
					return n.index === d || map.has(n.id);
				})
				.style("opacity", "1");

			if (colorful) {
				circle
					.filter((n) => {
						return n.index !== d && !map.has(n.id);
					})
					.style("stroke", function () {
						return "#a8bfe3";
					});
			}
		})
		.on("mouseleave", () => {
			if (dragging) {
				return;
			}
			hover = false;
			if (colorful) {
				circle.style("stroke", function (d) {
					var value = d.x / 2000 - d.y / 2000;
					return color(value);
				});
			}
			link.style("opacity", "1");
			node.style("opacity", "1");
		});

	// Adding the label for each node
	node
		.append("text")
		.attr("dy", ".35")
		.attr("dx", 12)
		.attr("class", "unselectable")
		.text(function (d) {
			return d.id;
		})
		.attr("text-anchor", "middle");

	node.append("title").text(function (d) {
		return d.id;
	});

	simulation.nodes(graph.nodes).on("tick", ticked);

	simulation.force("link").links(graph.links);

	function ticked() {
		link
			.attr("x1", function (d) {
				return d.source.x;
			})
			.attr("y1", function (d) {
				return d.source.y;
			})
			.attr("x2", function (d) {
				return d.target.x;
			})
			.attr("y2", function (d) {
				return d.target.y;
			});

		node.attr("transform", (d) => {
			return "translate(" + d.x + "," + d.y + ")";
		});

		if (colorful && !hover) {
			circle.style("stroke", function (d) {
				var value = d.x / 2000 - d.y / 2000;
				return color(value);
			});
		}
	}

	// Used to drag nodes round the screen
	function dragstarted(d) {
		dragging = true;
		if (!d3.event.active) simulation.alphaTarget(0.3).restart();
		d.fx = d.x;
		d.fy = d.y;
	}

	function dragged(d) {
		d.fx = d3.event.x;
		d.fy = d3.event.y;
	}

	function dragended(d) {
		dragging = false;
		if (!d3.event.active) simulation.alphaTarget(0);
		d.fx = null;
		d.fy = null;
	}

	// This is the zoom handler
	var zoom_handler = d3.zoom().on("zoom", zoom_actions);

	//specify what to do when zoom event listener is triggered
	function zoom_actions() {
		g.attr("transform", d3.event.transform);
	}

	// initial scaling on the svg container - this means everything in it is scaled as well
	svg
		.call(zoom_handler)
		.call(zoom_handler.transform, d3.zoomIdentity.scale(1, 1));

	zoom_handler(svg);
})();
