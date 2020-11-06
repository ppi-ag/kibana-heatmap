# Kibana Heatmap for Kibana 3

This plugin was developed for Kibana 3. It is not compatible with newer version of Kibana. Shelby Sturgis provides a [Heatmap Plugin for Kibana 4](https://github.com/stormpython/heatmap). Newer versions of Kibana provide a [native Heatmap visualization](https://www.elastic.co/guide/en/kibana/current/heat-map.html). Therefore, this plugin is not actively maintained anymore. 

This plugin provides an additional panel type for the [Kibana](http://www.elasticsearch.org/overview/kibana/) web application 
that visualizes time-stamped log events stored in the Elasticsearch database. 

The heatmap panel shows a 2D/3D overview of the total number of events 
per weekday and hour for your selected time span with 168 time slots 
(24 hours x 7 weekdays). The first time slot is Monday from midnight to 1 am 
and the last is Sunday 11 pm to midnight. 

Both 2D and 3D view use different colors to visualize the number of events 
per time slot and show how the typical system activity changes
during the day and during the week. You can easily spot both the hot spots with 
very high usage as well as periods with very low usage. 

### 2D view example of the heatmap panel
![alt text](../../raw/master/img/heatmap-overview.png "heatmap in 2D view")




### 3D view example of the heatmap  panel
![alt text](../../raw/master/img/heatmap-3D.png "heatmap in 3D view")


The current version of the heatmap panel supports three diffrent colorings:
![alt text](../../raw/master/img/heatmap-coloring.png "three diffrent heatmap colorings")


## Features in current version:
 - legend & tooltips in 2D view
 - panable and zoomable 3D View
 - three different color schemas

## ToDos 
- support of aggregate functions like (min, max, mean etc. )
- improve 3D view (tooltips, legend, etc.)
- support for the different Kibana themes
- adjustable time slots
- support for time zones


## Installation 

To install the heatmap you just need to put the heatmap folder in the ```app/panels/``` directory of your Kibana installation.
After that you just need to add ```heatmap``` to the panel_names list in your kibana ```config.js```.

```js

/* [...] */

    panel_names: [
      
      'heatmap', /* add this entry */
      
      'histogram',
      'map',
      'goal',
      
      /* [...] */
    ]

/* [...] */

```
The panel was tested with Kibana 3.0.1 and 3.1.0.
Please use a modern web browser like Chrome or Firefox. 


## Requirements

The heatmap panel expects that your documents have a field which identifies the time slot the document belongs to.
This time slot field should contain a value like this: ```1-Mon:23-24``` 

So the general format is: ```[weekdayAsNumber]-[weekdayAsString]:[hourstart]-[hourend]```

Detailed explanation: 

 * ```weekdayAsNumber``` should be a value between 1 and 7. 1 -> Monday, 2 -> Tuesday, ..., 7 -> Sunday
 * ```weekdayAsString``` At moment it could be any String. In a later version this String could be used for the legend, because there is no Javascript API to get the local weekday as String from the Javascript Date object.
 * ```hourstart``` and ```hourend``` Specify in which period the log event belongs. So 00-01 means that the event was produced between midnight and 1 o'clock. Examples: ```00-01```, ```01-02```, ```02-03```, ```...``` , ```22-23```, ```23-24```

The format was designed to be human readable and does not follow any ISO standard. The format may change in later versions or this attribute will be removed, because it is possible to determine the correct time slot from a timestamp using the elasticsearch script functionality on the fly during query execution.

### Apache Flume

If you use Apache Flume with Morphlines to import your log data you can use this [morphline configuration](morphline.conf) to generate the time-slot attribute.


### Logstash

We think the right way to generate the time-slot attribut with logstah would be a additional logstash filter class. So if you are familier with ruby and logstash your help is appreciated.

Or you may want to use the inline [filter code provided by yogi183](https://github.com/ppi-ag/kibana-heatmap/issues/1#issuecomment-49777657) to generate the time-slot attribute.


* * * 


## Development

Kibana uses jQuery flot to plot the diagrams. So first we implemented a flot heatmap plugin which is used to render the 2D view of the heatmap. 
Currently our heatmap flot plugin renders the legend in the canvas itself and not as html as the other flot plugins. 
Because of this we currently do not support Kibana themes switches. The color of the legend texts are defined in ```options.series.heatmap.fontColor``` in ```jquery.flot.heatmap.js```

For the rendering of the 3D view we use [THREE.js](http://threejs.org/).

We would like to improve this initial version by adding new features and improving the code quality.

Your help is very appreciated!


**Disclaimer: This module was created during a student project of PPI AG and 
does not represent typical code quality at PPI AG.**


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
