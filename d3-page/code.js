(async () => {
  let svg = d3.select("svg"),
    width = +svg.node().getBoundingClientRect().width,
    height = +svg.node().getBoundingClientRect().height;

  var g = svg.append("g");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("attraceForce", d3.forceManyBody().strength(-400))
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
    );

  let response = await fetch("root.json"); 
  let json = await response.json(); 
  let root_username = json["username"];


  console.log(root_username);

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
      .style("stroke-width", 2)
      .style("stroke", function (d) {
        return color(d.color);
      })
      .on("mouseenter", (evt, d) => {
        let list = [];
        link
          //.attr("display", "none")
          .style("opacity", "0.2")
          .filter((l) => {
            if (l.source.index === d) {
              list.push(l.target.id);
              return true;
            } else if (l.target.index === d) {
              list.push(l.source.id);
              return true;
            }
            return false;
          })
          .style("opacity", "1");

        node
          .style("opacity", "0.4")
          .filter((n) => {
            return n.index === d || list.includes(n.id);
          })
          .style("opacity", "1");
      })
      .on("mouseleave", (evt) => {
        //link.attr("display", "block");
        link.style("opacity", "1");
        node.style("opacity", "1");
      });

    // Adding the label for each node
    var text = node
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

      node.attr("transform", (d) => { return "translate(" + d.x + "," + d.y + ")"});
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
})();
