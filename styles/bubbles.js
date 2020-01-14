let svg = d3.select('svg');
let width = Math.min(document.body.clientWidth, 700); // get width in pixels
let mobile = false;

// reduce number of circles on mobile screen due to slow computation
if ('matchMedia' in window && window.matchMedia('(max-device-width: 767px)').matches) {
  mobile = true;
}

svg.attr('height', width);

let height = +svg.attr('height');
let centerX = width * 0.5;
let centerY = height * 0.5;
let strength = 0.05;
let focusedNode;

let format = d3.format(',d');

let scaleColor = d3.scaleOrdinal(d3.schemeCategory20);

// use pack to calculate radius of the circle
let pack = d3.pack()
  .size([width , height ])
  .padding(1.5);

let forceCollide = d3.forceCollide(d => d.r + 1);

// use the force
let simulation = d3.forceSimulation()
  // .force('link', d3.forceLink().id(d => d.id))
  .force('charge', d3.forceManyBody())
  .force('collide', forceCollide)
  // .force('center', d3.forceCenter(centerX, centerY))
  .force('x', d3.forceX(centerX ).strength(strength))
  .force('y', d3.forceY(centerY ).strength(strength));

let data = [];
for (i in data_two) {
  let catName = data_two[i].cat;
  for(j in data_two[i].values) {
    data.push({
      cat: catName,
      name: data_two[i].values[j].name,
      value: data_two[i].values[j].value
    })
  }
}

// reduce number of circles on mobile screen due to slow computation
if (mobile) {
  data = data.filter(el => {
    return el.value >= 50;
  });
}

let root = d3.hierarchy({ children: data })
  .sum(d => d.value);

// we use pack() to automatically calculate radius conveniently only
// and get only the leaves
let nodes = pack(root).leaves().map(node => {
  // console.log('node:', node.x, (node.x - centerX) * 2);
  const data = node.data;
  return {
    x: centerX + (node.x - centerX) * 3, // magnify start position to have transition to center movement
    y: centerY + (node.y - centerY) * 3,
    r: 0, // for tweening
    radius: node.r, //original radius
    id: data.cat + '.' + (data.name.replace(/\s/g, '-')),
    cat: data.cat,
    name: data.name,
    value: data.value,
    // icon: data.icon,
    // desc: data.desc,
  }
});
simulation.nodes(nodes).on('tick', ticked);

svg.style('background-color', '#fff');

let node = svg.selectAll('.node')
  .data(nodes)
  .enter().append('g')
  .attr('class', 'node')
  .call(d3.drag()
    .on('start', (d) => {
      if (!d3.event.active) simulation.alphaTarget(0.2).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    })
    .on('end', (d) => {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }));

node.append('circle')
  .attr('id', d => d.id)
  .attr('r', 0)
  .style('fill', d => scaleColor(d.cat))
  .transition().duration(2000).ease(d3.easeElasticOut)
    .tween('circleIn', (d) => {
      let i = d3.interpolateNumber(0, d.radius);
      return (t) => {
        d.r = i(t);
        simulation.force('collide', forceCollide);
      }
    })

node.append('clipPath')
  .attr('id', d => `clip-${d.id}`)
  .append('use')
  .attr('xlink:href', d => `#${d.id}`);

node
  .append('text')
  .classed('node-icon', true)
  .attr('clip-path', d => `url(#clip-${d.id})`)
  .selectAll('tspan')
  .data(d => d.name.split(';'))
  .enter()
    .append('tspan')
    .attr('x', 0)
    .attr('y', (d, i, nodes) => (13 + (i - nodes.length / 2 - 0.5) * 10))
    .text(name => name);

node.append('title')
  .text(d => (d.cat + '::' + d.name + '\n' + format(d.value)));


let overlayReduction = mobile ? 0.4 : 0.8;

let infoBox = node.append('foreignObject')
  .classed('circle-overlay hidden', true)
  .attr('x', -350 * 0.5 * overlayReduction)
  .attr('y', -350 * 0.5 * overlayReduction)
  .attr('height', 350 * overlayReduction)
  .attr('width', 350 * overlayReduction)
    .append('xhtml:div')
    .classed('circle-overlay__inner', true);


let titleElm = mobile ? 'h4' : 'h2';

infoBox.append(titleElm)
  .classed('circle-overlay__title', true)
  .text(d => d.name);

// infoBox.append('p')
//   .classed('circle-overlay__body', true)
//   .html(d => d.desc);


node.on('click', (currentNode) => {
  d3.event.stopPropagation();

  let currentTarget = d3.event.currentTarget; // the <g> el

  if (currentNode === focusedNode) {
    // no focusedNode or same focused node is clicked
    return;
  }
  let lastNode = focusedNode;
  focusedNode = currentNode;

  simulation.alphaTarget(0.2).restart();
  // hide all circle-overlay
  d3.selectAll('.circle-overlay').classed('hidden', true);
  d3.selectAll('.node-icon').classed('node-icon--faded', false);

  // don't fix last node to center anymore
  if (lastNode) {
    lastNode.fx = null;
    lastNode.fy = null;
    node.filter((d, i) => i === lastNode.index)
      .transition().duration(2000).ease(d3.easePolyOut)
      .tween('circleOut', () => {
        let irl = d3.interpolateNumber(lastNode.r, lastNode.radius);
        return (t) => {
          lastNode.r = irl(t);
        }
      })
      .on('interrupt', () => {
        lastNode.r = lastNode.radius;
      });
  }

  // if (!d3.event.active) simulation.alphaTarget(0.5).restart();

  d3.transition().duration(2000).ease(d3.easePolyOut)
    .tween('moveIn', () => {

      let ix = d3.interpolateNumber(currentNode.x, centerX);
      let iy = d3.interpolateNumber(currentNode.y, centerY);
      let ir = d3.interpolateNumber(currentNode.r, centerY * 0.4);
      return function (t) {
        // console.log('i', ix(t), iy(t));
        currentNode.fx = ix(t);
        currentNode.fy = iy(t);
        currentNode.r = ir(t);
        simulation.force('collide', forceCollide);
      };
    })
    .on('end', () => {
      simulation.alphaTarget(0);
      let $currentGroup = d3.select(currentTarget);
      $currentGroup.select('.circle-overlay')
        .classed('hidden', false);
      $currentGroup.select('.node-icon')
        .classed('node-icon--faded', true);

    })
    .on('interrupt', () => {

      currentNode.fx = null;
      currentNode.fy = null;
      simulation.alphaTarget(0);
    });

});

// blur
d3.select(document).on('click', () => {
  let target = d3.event.target;
  // check if click on document but not on the circle overlay
  if (!target.closest('#circle-overlay') && focusedNode) {
    focusedNode.fx = null;
    focusedNode.fy = null;
    simulation.alphaTarget(0.2).restart();
    d3.transition().duration(2000).ease(d3.easePolyOut)
      .tween('moveOut', function () {
        let ir = d3.interpolateNumber(focusedNode.r, focusedNode.radius);
        return function (t) {
          focusedNode.r = ir(t);
          simulation.force('collide', forceCollide);
        };
      })
      .on('end', () => {
        focusedNode = null;
        simulation.alphaTarget(0);
      })
      .on('interrupt', () => {
        simulation.alphaTarget(0);
      });

    // hide all circle-overlay
    d3.selectAll('.circle-overlay').classed('hidden', true);
    d3.selectAll('.node-icon').classed('node-icon--faded', false);
  }
});

function ticked() {
  node
    .attr('transform', d => `translate(${d.x},${d.y})`)
    .select('circle')
      .attr('r', d => d.r/1.1); // /1.1 to provide a slight amount of padding
}
