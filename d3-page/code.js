let svg = d3.select("svg"),
  width = +svg.node().getBoundingClientRect().width,
  height = +svg.node().getBoundingClientRect().height;

//add encompassing group for the zoom
var g = svg.append("g");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3
  .forceSimulation()
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("attraceForce", d3.forceManyBody().strength(-100))
  .force(
    "link",
    d3
      .forceLink()
      .id(function (d) {
        return d.id;
      })
      .distance(200)
  );

var opacity = 0.05;
var transitionPeriod = 500;

d3.json("data.json", function (error, graph) {
  if (error) throw error;

  var link = g
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .style("stroke-width", function (d) {
      return d.value;
    })
    .style("stroke", "#999")
    .style("opacity", "1")
    .attr("group", function (d) {
      return d.group;
    });

  var node = g
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter()
    .append("circle")
    .attr("r", 20)
    .attr("fill", "#fff")
    .style("stroke-width", 2)
    .style("stroke", function (d) {
      return color(d.color);
    })
    .attr("group", function (d) {
      return d.group;
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("click", function (d) {});

  // Adding the label for each node
  var text = g
    .selectAll("text")
    .data(graph.nodes)
    .enter()
    .append("text")
    .attr("dy", ".35")
    .attr("dx", 12)
    .attr("class", "unselectable")
    .text(function (d) {
      return d.id;
    })
    .attr("text-anchor", "middle")
    .attr("group", function (d) {
      return d.group;
    });

  node.append("title").text(function (d) {
    return d.id;
  });

  simulation.nodes(graph.nodes).on("tick", ticked);

  simulation.force("link").links(graph.links);

  // Finding connected people, usefull for later adding line highlighting
  function neighboring(a, b) {
    return graph.links.some(function (d) {
      return (
        (d.source.id === a.source.id && d.target.id === b.target.id) ||
        (d.source.id === b.source.id && d.target.id === a.target.id)
      );
    });
  }

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

    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
    text
      .attr("x", function (d) {
        return d.x;
      })
      .attr("y", function (d) {
        return d.y;
      });
  }
});

// Used to drag the graph round the screen
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
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
