let t = d3.transition().duration(2000);

let fadeOut = function(selector) {
    d3.select(selector)
      .transition()
      .duration(500)
      .style("opacity", 0)
      .transition()
      .style("display", "none");
}

let fadeIn = function(selector) {
    d3.select(selector)
      .transition()
      .style("display", "block")
      .transition()
      .duration(500)
      .style("opacity", 1)
}

let removeDisabled = function(selector) {
    d3.select(selector).classed('disabled', false);
}

let addDisabled = function(selector) {
  d3.select(selector).classed('disabled', true);
}

var hide_lists = function() {
    fadeOut('#about');
    fadeOut('#posts');
    fadeOut('#projects');

    removeDisabled('#projects-btn');
    removeDisabled('#about-btn');
    removeDisabled('#posts-btn');
};


var show_posts = function() {
    removeDisabled('#projects-btn');
    removeDisabled('#about-btn');

    fadeOut('#projects');
    fadeOut('#about');

    fadeIn('#posts')

    addDisabled('#posts-btn')
};

var show_projects = function() {
    removeDisabled('#posts-btn');
    removeDisabled('#about-btn');

    fadeOut('#posts');
    fadeOut('#about');

    fadeIn('#projects')

    addDisabled('#projects-btn')
};

var show_about = function() {
    removeDisabled('#posts-btn');
    removeDisabled('#projects-btn');

    fadeOut('#posts');
    fadeOut('#projects');

    fadeIn('#about')

    addDisabled('#about-btn')
};
