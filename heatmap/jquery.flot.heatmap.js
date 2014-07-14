"use strict";

// Author: Lukas Havemannn
// PPI AG 2014

 /*global jQuery:false */

(function($) {
  var model, target; 

  function init(plot) {
    plot.hooks.draw.push( function(plot, newCtx) {
      var options   = plot.getOptions(), 
          coloring  = 'default';
      
      if (options.series.heatmap.show) {
        if(options.series.heatmap.coloring) {
          coloring = options.series.heatmap.coloring;
        }

        draw(plot, newCtx, $.plot.heatmap.coloring[coloring]);
      }
    });

    plot.hooks.bindEvents.push(function(plot, eventHolder) {
      var options = plot.getOptions();
      if (options.series.heatmap.show) {
        if (options.series.heatmap.tooltip) {
          eventHolder.unbind("mousemove").mousemove(onMouseMove);
        }
      }
    });

    plot.hooks.processDatapoints.push(function(plot, series, data, datapoints) {
      target = $(plot.getCanvas()).parent();
    }); 

    function draw(plot, newCtx, coloring) {
      var options = plot.getOptions();
      var opts    = options.series.heatmap;

      var canvasWidth  = plot.getPlaceholder().width(),
          canvasHeight = plot.getPlaceholder().height();
      
      var tileSize  = calculateMaxTileSize(canvasWidth, canvasHeight);
      var ctx = newCtx;

      model = buildHeatmapModel(plot.getData(), tileSize);
      renderValueLegend();
      renderAxisLegend();
      renderTiles(model, coloring);

      // render functions
      function renderTiles(model, coloring){
        $.each(model.tiles, function(idx, tile){
          var x = opts.legend.leftOffset + tile.x;
          var y = tile.y;

          ctx.fillStyle = tile['color'] = coloring(tile.heat);
          ctx.fillRect(x, y, model.tile.size - opts.tile.padding, 
                             model.tile.size - opts.tile.padding);
        });
      }

      function renderValueLegend() {
        var legendTileHeight = canvasHeight / (opts.legend.steps + 1) - opts.tile.padding ,
            legendTileWidth  = opts.legend.tileWidth;

        // Set Font here, for Text width measurement
        ctx.font = '12px Arial';

        var maxValueWidth = ctx.measureText(Math.round(model.range.max)).width;

        for(var i = 0; i <= opts.legend.steps; i++) {
          var value = (model.range.diff / opts.legend.steps) * i;
          var color = coloring(value / model.range.diff);

          var y = i * (legendTileHeight + opts.tile.padding);
          var x = calculateLegendPosition(canvasWidth, tileSize, maxValueWidth);

          // render colored tile
          ctx.fillStyle = color;
          ctx.fillRect (x, y, legendTileWidth, legendTileHeight);

          // render value
          ctx.fillStyle = opts.fontColor;
          ctx.fillText(Math.round(value), x + legendTileWidth + opts.tile.padding * 2, y + (legendTileHeight / 3) * 2);
        }
      }

      function renderAxisLegend() {
        $.each(opts.weekdays, function(idx, value){
          var x = opts.legend.leftOffset  - opts.legend.padding ;
          var y = idx * (tileSize +  opts.tile.padding) + tileSize * 1.5 + opts.legend.padding / 2;

          value = value.substring(0, 2) + ".";

          renderText(value, x, y, "right");
        });

        for(var i= 1; i <= opts.tile.count.x; i++) {
          var value = i + "h";

          var x = opts.legend.leftOffset  + tileSize * i - (tileSize / 2);
          var y = tileSize * 0.75;

          renderText(value, x, y, "center");
        }
      }

      function renderText(text, x, y, align) {
        ctx.textAlign = (align) ? align : "left";

        ctx.fillStyle = opts.fontColor;
        ctx.font = '12px Helvetica';
        ctx.fillText(text, x, y);
      } 

      function calculateMaxTileSize(canvasWidth, canvasHeight) {
        var maxTileWidth  = (canvasWidth - opts.legend.leftOffset - opts.legend.rightOffset ) / opts.tile.count.x;
        var maxTileHeight = canvasHeight / (opts.tile.count.y + 1); 

        return Math.min(maxTileHeight, maxTileWidth);
      }

      function calculateLegendPosition(canvasWidth, tileSize, maxValueWidth) {
        // calculate position og the legend
        var rightX = opts.legend.leftOffset + opts.tile.count.x * tileSize + opts.legend.padding; 
        var legendOffset = Math.min(opts.legend.rightOffset, maxValueWidth);

        // Prevent gap between legend and heatmap 
        var x = canvasWidth - legendOffset + opts.legend.padding;
        if(x > rightX) x = rightX;

        return x;
      }
    } // END draw

    function buildHeatmapModel(data, tileSize) {
      var model = { 
        tile : {
          size : tileSize
        },
        tiles : [],
        range : getValueRange(data),
      };

      $.each(data, function(idx, val){
        var timeSlice = parseTimeSliceLabel(val.label);
        
        var tile = {
          value     : val.data[0][1],
          label     : val.label, 
          timeSlice : timeSlice,
        };

        tile['heat'] = tile.value / model.range.diff;

        tile.y = timeSlice.day * tileSize;
        tile.x = timeSlice.hour.start * tileSize;

        model.tiles.push(tile);
      });

      function collided(x, y){
        for(var idx in model.tiles) {
          var tile = model.tiles[idx];

          if(x > tile.x && x < tile.x + tileSize) {
            if(y > tile.y && y < tile.y + tileSize) {
              return tile;
            }
          }
        }
        return false;
      }

      model.collided = collided;
      return model;
    }

    function onMouseMove(event) {
      var options = plot.getOptions();
      var opts    = options.series.heatmap;

      var offset  = plot.offset();
      var canvasX = parseInt(event.pageX - offset.left, 10);
      var canvasY = parseInt(event.pageY - offset.top, 10);

      var tile = model.collided(canvasX - opts.legend.leftOffset, canvasY , 0);

      var pos = { pageX: event.pageX, pageY: event.pageY };
      target.trigger("plothover", [pos, tile]);
    }
  } // END init

  function parseTimeSliceLabel(label) {
    // Label Example: 1-Mo:23-24 
    // Format:       [weekdayAsNumber]-[weekdayAsString]:[hourstart]-[hourend]

    var day, 
        weekday, 
        hourStart, 
        hourEnd;

    try {
      var parts      = label.split(":");
      var firstPart  = parts[0].split("-");
      var secondPart = parts[1].split("-");

      weekday   = firstPart[1];
      day       = parseInt(firstPart[0], 10);
      hourStart = parseInt(secondPart[0], 10); 
      hourEnd   = parseInt(secondPart[1], 10); 
    } 
    catch(ex) {
      console.error("Time Slice Label parsing Error Expected Format: [weekdayAsNumber]-[weekdayAsString]:[hourstart]-[hourend]" 
        + "Got: " + label + "\n" + ex);
    }

    return { 
      "day" : day,  
      "weekday" : weekday,
      "hour" : {
        "start" : hourStart,
        "end" : hourEnd
      }
    };
  }
  
  function getValueRange(data) {
    var min = 0, 
        max = 0;

    $.each(data, function(idx, value) {
      var val = value.data[0][1];
      
      if(val < min){
        min = val;
      } else if(val > max) {
        max = val;
      }
    });

    return {
      "min" : min,
      "max" : max,
      "diff" : max - min
    };
  }

  function interpolateColor(colors, percentage) {
    // Color Interpolation Algorithm by luha
    // Using Chromath lib for interpolating between two colors

    var border      = 1 / colors.length,
        lowerBound  = Math.floor(percentage * (colors.length - 1)),
        upperBound  = Math.ceil(percentage * (colors.length - 1)),

        // normalize Percentage
        percent = (percentage - (border * lowerBound)) / (border * ((lowerBound === 0) ? 1 : lowerBound));

    return Chromath.towards(colors[lowerBound], colors[upperBound], percent);
  }

  function getColoringFuncs() {
    function getStandardColor(heat){
      return interpolateColor(["blue", "lime", "yellow", "red"], heat).toString();
    }

    function getEmbersColor(heat) {
      return "rgb(" + parseInt(255 * heat, 10) + ", 0, 0)"; 
    }

    function getFireColor(heat){
      return Chromath.towards('yellow', 'red', heat).toString();
    }

    return {
      'default'   : getStandardColor,
      'embers'    : getEmbersColor,
      'fire'      : getFireColor
    };
  }
  
  // make some functions public - is this the right way TODO?
  !$.plot.heatmap && ($.plot.heatmap = {});

  $.plot.heatmap.coloring             = getColoringFuncs();
  $.plot.heatmap.getValueRange        = getValueRange;
  $.plot.heatmap.parseTimeSliceLabel  = parseTimeSliceLabel;

  var options = {
    series: {
      heatmap: {
        show: false,
        fontColor: "#333333",
        weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], //TODO remove! use lib instead

        tile : {
          count: {
            x: 24, //24 hours
            y: 7 // and 7 days in week
          },
          padding : 1
        },

        legend : {
          steps : 15,
          tileWidth: 30,
          padding: 10,
          leftOffset: 30,
          rightOffset: 120
        }
      }
    }
  };

  $.plot.plugins.push({
    init: init,
    options: options,
    name: "heatmap",
    version: "1.0"
  });

})(jQuery);