# Interactive-Heatmap
**Version 1:**

A interactive heatmap with mouseover ability and a zoom into a selected area functionality. Heatmap_run displays the heatmap, but a csv file has to be filled into the mainFile line before the script will run. No dendrogram.

The metadata is made up

**Version 2:**

Extension of Version 1 with dendrograms.  Has zooming capability on the dendrograms along with the heatmap grid. However, zoom function only works once! =[

**Clustering.R**

This file in Version 2 folder does all the clustering of the data.  Make sure to input your desired CSV file and made up metadata into the clustering.R file.  This will allow R to give out 4 files that are needed in running the heatmap.

**References**

http://bl.ocks.org/PBrockmann/635179ff33f17d2d75c2

http://www.totallab.com/products/samespots/support/faq/dendrogram.aspx

https://gist.github.com/jasondavies/3689931

https://github.com/jcheng5/d3-heatmap/blob/master/R/heatmap.R

http://stackoverflow.com/questions/12925266/drawing-heatmap-with-d3

Dendrogram

http://stackoverflow.com/questions/17837973/how-to-turn-a-hclust-object-into-json-for-d3

https://github.com/jcheng5/d3-heatmap/blob/master/hclust.R

https://stat.ethz.ch/R-manual/R-patched/library/stats/html/hclust.html

http://www.r-tutor.com/gpu-computing/clustering/hierarchical-cluster-analysis

