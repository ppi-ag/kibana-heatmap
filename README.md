# Kibana Heatmap

Disclaimer: This project is from students of PPI AG and does not represent overall code quality at PPI AG.

The Heatmap Panel displays all events in time slices in a 2D and 3D View.

How it looks:
![alt text](../../raw/master/img/heatmap-overview.png "heatmap in 2D view")


![alt text](../../raw/master/img/heatmap-3D.png "heatmap in 3D view")


The panel support diffrent colorings:


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
This attribut should like this:


In our project we use Apache Flume instead of Logstash. Here is or Code which computes the time-slice attribut.

```java

```


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
