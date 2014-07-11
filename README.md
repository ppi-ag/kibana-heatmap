# Kibana Heatmap

**Disclaimer: This is a students project of the PPI AG and does not represent overall code quality at PPI AG.**

Instead of displaying all Log-Events in a continues timeline as the histogramm panel the heatmap panel displays all events in time slices in a 2D and 3D View. So you can easly analyse the activity over time in your system.

![alt text](../../raw/master/img/heatmap-overview.png "heatmap in 2D view")
**The 2D view of the heatmap panel**


![alt text](../../raw/master/img/heatmap-3D.png "heatmap in 3D view")
**The 3D view of the heatmap  panel**


The current heatmap supports three diffrent colorings:
![alt text](../../raw/master/img/heatmap-coloring.png "three diffrent heatmap colorings")



### Installation 

To install the heatmap you just need to put the heatmap folder in the ```app/panels/```-Folder of your Kibana installation.
After that you just need to add ```heatmap``` to the panel_names list in your kibana ```config.js```.

```js

/* [...] */

    panel_names: [
      
      'heatmap', /* diesen Eintrag hinzufügen */
      
      'histogram',
      'map',
      'goal',
      
      /* [...] */
    ]

/* [...] */

```

The heatmap pabel expects that your documents have a attribut which identifies in which time-slice the the document belongs.
This time-slice attribut should like this:

1-Mo:23-24 
So the format ist: [weekdayAsNumber]-[weekdayAsString]:[hourstart]-[hourend]



## Development

Kibana uses jQuery flot for the plotting of the diagramms. So we implemented a flot heatmap plugin first. This Plugin is used to render the 2D view of the heatmap. 
The flot plugin renders the legend in the canvas and not as html as the other flot plugins. Because of this we currently support only the light theme or you switch one constant in the jquery.heatmap.js file. 
We are looking forward to further develop the Heatmap and implement the legend as HTML. But your help is appreciated!

### Features in v1.0:
 - 2D & 3D view
 - legend & tooltips in 2D view
 - dreh und zoombare 3D Ansicht     
 - Color Interpolation Algorithmus zum erzeugen des klassichen Heatmap Farbschemas  
 - default Color Schema + 2 weitere  

### TODOs 
- support of aggregate functions like (min, max, mean etc. ) 
- improve 3D view (tooltips, legend, etc.)
- support for the different themes