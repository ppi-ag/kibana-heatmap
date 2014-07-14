// Author: Lukas Havemann
// PPI AG 2014

// Add dependencies to require.js
require.config({
  paths : {
    'three'               : '../app/panels/heatmap/vendor/three.min',
    'typeface'            : '../app/panels/heatmap/vendor/typeface',
    'TrackballControls'   : '../app/panels/heatmap/vendor/TrackballControls',
    'helvetiker_regular'  : '../app/panels/heatmap/vendor/helvetiker_regular.typeface',
    
    // Self coded
    'jquery.flot.heatmap' : '../app/panels/heatmap/jquery.flot.heatmap',
    'webgl.heatmap' :       '../app/panels/heatmap/webgl.heatmap'
  },

  shim : {
    'webgl.heatmap'      : ['jquery.flot.heatmap', 'TrackballControls', 'helvetiker_regular', 'typeface'],
    'jquery.flot.heatmap': ['jquery', 'jquery.flot'],
    
    'helvetiker_regular' : ['typeface', 'three'],
    'TrackballControls'  : ['three']
  }
});

define([
  'angular',
  'app',
  'lodash',
  'jquery',
  'kbn', 
  'jquery.flot.heatmap'
],
function (angular, app, _, $, kbn) {
  "use strict";

  var $tooltip = $('<div>');
  var module = angular.module('kibana.panels.heatmap', []);
  app.useModule(module);

  module.controller('heatmap', function($scope, querySrv, dashboard, filterSrv, fields) {
    $scope.panelMeta = {
      modals : [
        {
          description: "Inspect",
          icon: "icon-info-sign",
          partial: "app/partials/inspector.html",
          show: $scope.panel.spyable
        }
      ],
      
      editorTabs : [
        {title:'Queries', src:'app/partials/querySelect.html'}
      ], 
      status  : "Stable",
      description : "Displays the results of an elasticsearch facet as a heatmap"
    };

    // Set and populate defaults
    var _d = {
      /** @scratch /panels/heatmap/5
       * === Parameters
       *
       * field:: The field on which to computer the facet
       * default field is time-slice; fields must contain time data in specifiec format
       */
      field : 'time-slice',

      /** @scratch /panels/heatmap/5
       * size:: Request 168 because 24h * 7d are 168 time slices / tiles
       */
      size : 168,

      /** @scratch /panels/heatmap/5
       * spyable:: Set spyable to false to disable the inspect button
       */
      spyable : true,
      
      /** @scratch /panels/heatmap/5
       *
       * ==== Queries
       * queries object:: This object describes the queries to use on this panel.
       * queries.mode::: Of the queries available, which to use. Options: +all, pinned, unpinned, selected+
       * queries.ids::: In +selected+ mode, which query ids are selected.
       */
      queries     : {
        mode        : 'all',
        ids         : []
      },
    };

    $scope.init = function () {
      $scope.$on('refresh', function(){
        $scope.get_data();
      });

      $scope.$watch("diagramm3d", function(){ 
        $tooltip.remove();
        $scope.$emit("refresh");
      });

      $scope.$watch("selectedColoring", function(){ 
        $tooltip.remove();
        $scope.$emit("refresh");
      });

      $scope.coloringFuncs    = _.keys($.plot.heatmap.coloring);
      $scope.selectedColoring = $scope.coloringFuncs[0];
    };

    $scope.get_data = function() {
      // Make sure we have everything for the request to complete
      
      if(dashboard.indices.length === 0) {
        return;
      }

      $scope.panelMeta.loading = true;
      var request,
        results,
        boolQuery,
        queries;

      $scope.field = _.contains(fields.list, $scope.panel.field + '.raw') ?
        $scope.panel.field + '.raw' : $scope.panel.field;

      request = $scope.ejs.Request().indices(dashboard.indices);

      $scope.panel.queries.ids = querySrv.idsByMode($scope.panel.queries);
      queries = querySrv.getQueryObjs($scope.panel.queries.ids);

      // This could probably be changed to a BoolFilter
      boolQuery = $scope.ejs.BoolQuery();
      _.each(queries,function(q) {
        boolQuery = boolQuery.should(querySrv.toEjsObj(q));
      });

      request = request
        .facet($scope.ejs.TermsFacet('terms')
        .field($scope.field)
        .size($scope.panel.size)
        .facetFilter($scope.ejs.QueryFilter(
          $scope.ejs.FilteredQuery(
            boolQuery,
            filterSrv.getBoolFilter(filterSrv.ids())
          )))).size(0);
      

      // Populate the inspector panel
      $scope.inspector = angular.toJson(JSON.parse(request.toString()), true);

      results = request.doSearch();

      // Populate scope when we have results
      results.then(function(results) {
        $scope.panelMeta.loading = false;
        $scope.results = results;

        $scope.$emit('render');
      });
    };

    $scope.set_refresh = function (state) {
      $scope.refresh = state;
    };

    $scope.close_edit = function() {
      if($scope.refresh) {
        $scope.get_data();
      }
      $scope.refresh =  false;
      $scope.$emit('render');
    };
  });
  
  module.directive('togglebutton', function(){
    return {
      restrict: 'E',
      replace: 'true',
      scope: {
        model: '='
      },
      template: '<div class="btn-group btn-toggle"> \
          <button ng-click="model = !model" class="btn btn-xs" \
                  ng-class="{true: \'btn-primary active\', false: \'btn-default\'}[!model]">2D</button> \
          <button ng-click="model = !model" class="btn btn-xs" \
                  ng-class="{true: \'btn-primary active\', false: \'btn-default\'}[model]">3D</button> \
        </div>',
    };
  });

  module.directive('heatmap', function(querySrv) {
    return {
      restrict: 'A',
      link: function(scope, elem) {
        var plot;

        //TODO do it in the angular way
        elem = $("#heatmap-canvas");

        // Receive render events
        scope.$on('render',function(){
          render_panel();
        });

        function build_results() {
          var k = 0;
          scope.data = [];

          _.each(scope.results.facets.terms.terms, function(v) {
            var slice = { label : v.term, data : [[k,v.count]], actions: true};
            
            scope.data.push(slice);
            k = k + 1;
          });
        }

        // Function for rendering panel
        function render_panel() {
          var chartData;

          build_results();

          // IE doesn't work without this
          elem.css({height:scope.row.height});

          // Make a clone we can operate on.
          chartData = _.clone(scope.data);
          chartData = _.without(chartData, _.findWhere(chartData,{meta:'missing'})); 
          chartData = _.without(chartData, _.findWhere(chartData,{meta:'other'}));
          
          if(!scope.diagramm3d) {
            plot = $.plot(elem, chartData, {
              legend: { show: false },
              series: {
                heatmap: {
                  show : true,
                  coloring : scope.selectedColoring,
                  tooltip : true
                }
              },
              grid: false,
              colors: querySrv.colors
            });
          }
          else {
            require(['webgl.heatmap'], function(webglHeatmap) {
              // TODO build own directive for WebGL Heatmap
              webglHeatmap.display(chartData, $("#container3d").get(0), scope.selectedColoring);
            });
          }
          
          elem.bind("plothover", function (event, pos, tile) {
            if (tile) {
              $tooltip
                .html(
                  kbn.query_color_dot(tile.color, 20) + ' ' +
                  tile.label + " (" + tile.value +")"
                )
              .place_tt(pos.pageX, pos.pageY);
            } else {
              $tooltip.remove();
            }
          });

        }
      }
    };
  });
});