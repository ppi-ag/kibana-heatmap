# Kibana Heatmap

**Disclaimer: This is a students project of the PPI AG and does not represent overall code quality at PPI AG.**

Instead of displaying all Log-Events in a continuous timeline the heatmap panel displays all events in one-hour time slices. 
So you can easly analyse the activity over time in your system.



### The 2D view of the heatmap panel
![alt text](../../raw/master/img/heatmap-overview.png "heatmap in 2D view")




### The 3D view of the heatmap  panel
![alt text](../../raw/master/img/heatmap-3D.png "heatmap in 3D view")


In the current version the heatmap supports three diffrent colorings:
![alt text](../../raw/master/img/heatmap-coloring.png "three diffrent heatmap colorings")


## Features in current version:
 - legend & tooltips in 2D view
 - panable and zoomable 3D View     
 - three diffrent color schemas 

## ToDos 
- support of aggregate functions like (min, max, mean etc. ) 
- improve 3D view (tooltips, legend, etc.)
- support for the different Kibana themes
- adjustable time-slicing


## Installation 

To install the heatmap you just need to put the heatmap folder in the ```app/panels/``` direcotry of your Kibana installation.
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


## Requirements

The heatmap panel expects that your documents have a attribut which identifies in which time-slice the document belongs.
This time-slice attribut should like this: ```1-Mo:23-24``` 

So the geberal format is: ```[weekdayAsNumber]-[weekdayAsString]:[hourstart]-[hourend]```


## Development

Kibana uses jQuery flot for the plotting of the diagramms. So we implemented at first a flot heatmap plugin which is used to render the 2D view of the heatmap. 
At moment our heatmap flot plugin renders the legend in the canvas itself and not as html as the other flot plugins. 
Because of this we currently do not support Kibana themes swichtes. The color of the legend texts are defined in ```options.series.heatmap.fontColor``` in the ```jquery.flot.heatmap.js```

For the rendering of the 3D view we use [THREE.js](http://threejs.org/).

We are looking forward to further develop the panel and to improve the code quality. The current version is very rudimentary. 

Your help is very appreciated!


## License

The MIT License (MIT)

Copyright (c) 2014 PPI AG Informationstechnologie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.