function heatmap_display(mainUrl,metaUrl,xData,yData) {
    //SVG

    var svg  = d3.select('body')
    var yDend = svg.append("svg").classed("yDend", true);
    var xDend = svg.append("svg").classed("xDend", true);
    var heatmap = svg.append("svg").classed("heatmap", true);
    var annotation = svg.append("svg").classed("annotations",true);

    //Label for mouseover ability
    var label = d3.select('body')
        .append('div')
        .style('position','absolute')
        .style('display','none')
        .style('font-size','10px');          

    var width = 1300;
        height = 550;

    d3.text(mainUrl, function(unparsedData) {

        //dataset, ID - yAxis are genes, xAxis are patient/samples
        var dataset = d3.csv.parseRows(unparsedData);
        yLength = dataset.length;

        var xLabel = dataset[0];
        var yLabel = [];

        //Only the values excluding the labels
        var onlyVal = new Array;
        var rowVal = new Array;
        
        var xScale = d3.scale.linear()
            .range([0,width-100]);
        var yScale = d3.scale.linear()
            .range([0,height-80]);  

        //-for loop 
        var alldat = [];
        var count = 0;
        //Annotations
        rawmeta();
        var max = -Infinity;
        var min = +Infinity;
        //For the rgb scale, every number in the dataset and store just the values of the dataset into onlyVal!
        for (i=0; i<yLength;i++) {
            for (j=0; j<dataset[i].length; j++) {
                if (!isNaN(dataset[i][j]) && dataset[i][j] != "") {
                    alldat[count] = dataset[i][j];
                    //When there is a lot of data, Math.max.apply breaks (Need to hardcode max/min)
                    max = Math.max(alldat[count],max)
                    min = Math.min(alldat[count],min)
                    count=count+1;
                    rowVal.push(dataset[i][j])
                } else if (j==0) {
                    yLabel[i] = dataset[i][j]; 
                }
            }
            if (rowVal.length>0) {
                onlyVal.push(rowVal)
            }
        rowVal = [];
        }
        //SCALE for the color (Reminder, RGB only takes whole numbers)
        min = Math.floor(min)
        max = Math.ceil(max)
        var mean = (max+min)/2;

        var rgbScale = d3.scale.linear()
            .domain([max, mean, min])
            .range(['red','orange','lightyellow']);

        //Makes heatmap
        var heatGrid = heatmaprect(svg.select('svg.heatmap'),rgbScale, xScale,yScale,onlyVal,yLabel,xLabel);
        var dendro = drawDend()


        //Select Area of dendrogram
        var selectXDend = selectArea(xDend,
                svg.select('svg.xDend'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,onlyVal,yLabel,xLabel,1);

        var selectYDend = selectArea(yDend,
                svg.select('svg.yDend'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,onlyVal,yLabel,xLabel,2);

        //Select rectangle on heatmap
        var selectHeat = selectArea(heatmap,
                svg.select('svg.heatmap'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,onlyVal,yLabel,xLabel);


        });

    //////DRAWING HEATMAP RECTANGLES
    function heatmaprect(svg, rgbScale,xScale,yScale,dataset,yLabel,xLabel) {
        //For the genes
        var j=0;
        //When there are more than 70 genes, it doesn't make sense to have the row labels
        var heatmapwidth = width-100;
        if (yLength>70) {
            heatmapwidth = width-50;
        }
        //Defining the domain of the scale
        xScale.domain([0,dataset[0].length]);
        yScale.domain([0,dataset.length]);
        
        svg
            .attr("width",width)
            .attr("height",height)

        var heatmap = svg.selectAll(".heatmap")
            .data(dataset)
            .enter()
            .append("g")

        //Making each heatmap rectangle!
        heatmap.selectAll('.cell')
            .data(function(d,i) {
                j++;
                return d;
            })
            .enter()
            .append('svg:rect')
            //.attr('class', function(d,i,j) {
            //    return 'cell bordered cr' + j + ' cc' + i;
            //})
            .attr('width' , xScale(1))
            .attr('height', yScale(1))
            //width of each rectangle
            .attr('x' , function(d,i) {
                return xScale(i);
            })
            //every time i gets to the passed dataset length, then y+1, start new row.
            .attr('y' , function(d,i,j) {
                return yScale(j);           
            })
            //fills all the rectangles with colors
            .style('fill',function(d) {
                return rgbScale(d);
            })
            .attr("class","grid")  
            //mouseover function
            .on('mouseover', function(d,i,j) {
                d3.select("#yLab"+j).classed("hover",true);
                d3.select("#xLab"+i).classed("hover",true);
                d3.select(this).classed("hoverover",true)
                     
                //meta data!
                var titles = metaparsed[0];
                var info = metaparsed[i+1];

                var addon = '';
                for (i=0; i<titles.length;i++) {
                    addon = addon + '<br>'+ titles[i]+ ": "+info[i];
                }
                           
                output = 'Gene loci: '+ yLabel[j]+'<br>Level of expression: '+d+addon;
                            
                label
                    //event.page gives current cursor location
                    .style('top', (d3.event.pageY-50)+'px')
                    .style('left', (d3.event.pageX-150)+'px')
                    .style('background','white')
                    .style('display','block')
                    .style('opacity',0.6)
                    .html(output)        
            })
            .on('mouseout', function(d,i,j) {
                d3.select("#yLab"+j).classed("hover",false);
                d3.select("#xLab"+i).classed("hover",false);
                d3.select(this).classed("hoverover",false)
                            
            label
                .style('display','none')
            });

            //Label the heatmap
            yLabel.shift() //Shift just deletes the first index
            xLabel.shift()

            //Labels of genes
            var yAxis =svg.selectAll('.yLabel')
                .data(yLabel)
                .enter()
                .append('svg:text')
                .attr('class','yLabel')
                .attr('x',width-97)
                .attr('y', function(d,i) {
                    return yScale(i)+2+(yScale(i+1)-yScale(i))/2;
                })
                .text(function(d) {
                    return d;
                })
                .attr("id", function(d,i) {
                    return "yLab" + i;
                });

            //Label of patient
            var xAxis = svg.selectAll('.xLabel')
                .data(xLabel)
                .enter()
                .append('svg:text')
                .attr('class', 'xLabel')
                .attr('x', function(d,i) {
                    return xScale(i)+(xScale(i+1)-xScale(i))/2;
                }) 
                .attr('y',height-77)
                .text(function(d) {
                    return d;
                })
                .attr("id", function(d,i) {
                    return "xLab" + i
                })


            if (yLabel.length>70) {
                genelabel.style('opacity',0)
            }


    }

    /////ZOOM INTO RECTANGLE/////
    function selectArea(area, svg, annotesvg, heatmap, rgbScale, xScale, yScale,dataset,yLabel,xLabel,num) {
        
        svg
            .attr("width",width)
            .attr("height",height)

        var rows= [];
        var zoomDat = [];
        var newxLab=[];
        var newyLab = [];
        //Makes the selection rectangles 
        area
            .on("mousedown", function() {
                var e = this,
                origin = d3.mouse(e),
                rect = svg
                    .append("rect")
                    .attr("class", "zoom");

                origin[0] = Math.max(0, Math.min(width, origin[0]));
                origin[1] = Math.max(0, Math.min(height, origin[1]));
                d3.select('body')
                    .on("mousemove.zoomRect", function() {
                        var m = d3.mouse(e);
                        m[0] = Math.max(0, Math.min(width, m[0]));
                        m[1] = Math.max(0, Math.min(height, m[1]));
                        rect.attr("x", Math.min(origin[0], m[0]))
                            .attr("y", Math.min(origin[1], m[1]))
                            .attr("width", Math.abs(m[0] - origin[0]))
                            .attr("height", Math.abs(m[1] - origin[1]));
                    })
                    .on("mouseup.zoomRect", function() {
                            var m = d3.mouse(e);
                            m[0] = Math.max(0, Math.min(width, m[0]));
                            m[1] = Math.max(0, Math.min(height, m[1]));
                            //x,y Start/Finish for the selection of data => Can draw box the other way, and still work.
                            var xStart = Math.min(Math.floor(origin[0]/xScale(1)), Math.floor(m[0]/xScale(1)))
                            var xFinish = Math.max(Math.floor(m[0]/xScale(1)), Math.floor(origin[0]/xScale(1)))+1
                            var yStart = Math.min(Math.floor(origin[1]/yScale(1)), Math.floor(m[1]/yScale(1)))
                            var yFinish =Math.max(Math.floor(m[1]/yScale(1)), Math.floor(origin[1]/yScale(1)))+1

                            var newAnnot = [];
                            var newyDend = [];
                            var newxDend = [];
                            
                            //If the Y dendrogram is selected, make the Y dendrogram undefined 
                            //because I dont want the y dendrogram to change
                            if (num==1) {
                                xStart = 0;
                                xFinish = dataset[0].length
                                newyDend = undefined;
                            //If the X dendrogram is selected, make the X dendrogram undefined 
                            //because I dont want the x dendrogram to change
                            } else if (num==2) {
                                yStart = 0;
                                yFinish = dataset.length
                                newxDend = undefined;
                            }

                            newxLab.push('ID');
                            newyLab.push('ID');


                            //Get the data selected and send it back to heatmaprect
                            for (i = xStart; i<xFinish; i++) {
                                newxLab.push(xLabel[i]);
                                newAnnot.push(metaparsed[i+1][1])
                                if (newyDend != undefined) {
                                    newyDend.push(d3.select(".ends_Y"+i).attr("id"))
                                }
                            }
                            //Get selected Data
                            for (i=yStart;i<yFinish; i++) {
                                newyLab.push(yLabel[i]);
                                if (newxDend != undefined) {
                                    newxDend.push(d3.select(".ends_X"+i).attr("id"))
                                }
                                for (j=xStart; j<xFinish; j++) {
                                    rows.push(dataset[i][j]);
                                }
                                zoomDat.push(rows);
                                rows = [];  
                            }

                            //Clear the sample, gene, and heatmap so the new data can be put on
                            yLength = newyLab.length;
                            var x = xScale(1);
                            var y = yScale(1);
                            
                            //Delete all the labels and heatmap and annotations so that the zoomed ones can be updated

                            d3.selectAll('.xLabel').remove();
                            d3.selectAll('.yLabel').remove();
                            d3.selectAll('.annote').remove();
                            d3.selectAll('.grid').remove();
                            d3.selectAll('.rootDend').remove();
                            //New heatmap
                            heatmaprect(heatmap, rgbScale, xScale, yScale, zoomDat, newyLab,newxLab);
                            //modifies metadata with respect to selected area
                            modifyMeta(xStart,xFinish);
                            //New dendrogram
                            drawDend(newxDend,newyDend,xStart,yStart,x,y); 
                            //New annotation bar
                            drawAnnotate(annotesvg, newAnnot);
                            zoomDat = [];
                            //remove blue select rectangle
                            rect.remove();
                    });

            });

    }

    //METADATA ANNOTATION!
    function rawmeta() {
        d3.text(metaUrl,function(metaunparsed) {
            //For the mouseover
            metaparsed = d3.csv.parseRows(metaunparsed);
            metaparsed[0][0] = "ID"
            // Call change function
            var selectedDat = [];
            //Creates an array just with the selected trait
            for (i=0;i<metaparsed.length; i++){
                selectedDat.push(metaparsed[i][1])
            }
        selectedDat.shift()
        drawAnnotate(svg.select("svg.annotations"),selectedDat);

        });
    };


    function annotScale(selectedDat) { 
        var scaling;
        //Changes the color scale for annotation bar
        if (!isNaN(selectedDat[0])) {
            var max = Math.max.apply(Math,selectedDat);
            var min = Math.min.apply(Math,selectedDat);

            scaling = d3.scale.linear()
                .domain([min, max])
                .range(['powderblue', 'darkblue']);
        } else {
            scaling = d3.scale.category10()
                .domain(selectedDat)
        }
        return scaling;
    }

    //Changes the metadata to the selected metaData
    function modifyMeta(xStart,xFinish) {

        var selectedDat = [];
        selectedDat.push(metaparsed[0])
        //Creates an array just with the selected trait
        for (i=xStart;i<xFinish+1; i++){
            selectedDat.push(metaparsed[i+1])
        }
        metaparsed = selectedDat;

    }
    
    //Draws the annotate bar
    function drawAnnotate(svg,selectedDat) {
        svg
            .attr("width",width)
            .attr("height",10)

        var scaling = annotScale(selectedDat);

        //If there are too many genes, have to expand the annotation bar
        var heatmapwidth = width-100;
        if (yLength>70) {
            heatmapwidth = width-50;
        }

        //Sets the xScale annotations
        var xScale = d3.scale.linear()
            .domain([0, selectedDat.length])
            .range([0,heatmapwidth]);
            
        //Annotation svg
        var annotation = svg.selectAll('.annotate')
            .data(selectedDat)
            .enter()
            .append('svg:rect')
            .attr("class","annote")
            //.attr('col',function(d,i) {
            //    return i;
            //})
            .attr('width' , xScale(1))
            .attr('height', 5)
            .attr('x' , function(d,i) {
                return i*xScale(1);
            })
            .attr('y', 5)
            .style('fill',function(d,i) {
                return scaling(d);
            })         
    };

    //Function to draw the dendrograms newyDend, newxDend is undefined if there is no zoom
    function drawDend(newxDend,newyDend,xStart,yStart,x,y) {
        d3.json(xData, function(json) {
            data = json;
            var xDend = dendrogram(svg.select('svg.xDend'), data, false, 250, height-80,newxDend,yStart,y);
        });

        d3.json(yData, function(json) {
            data = json;
            var yDend = dendrogram(svg.select('svg.yDend'), data, true, width-100, 250,newyDend,xStart,x);
        });  

    }

    function dendrogram(svg, data, rotated, width, height,dend,shift,range) {

        var x = d3.scale.linear();
        var y = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);
        //Clustering d3
        var cluster = d3.layout.cluster()
            .separation(function(a, b) { return 1; })
            .size([rotated ? width : height, (rotated ? height : width) - 160]);
              
        var nodes = cluster.nodes(data),
            links = cluster.links(nodes);
        //Transform the heatmap
        var transform = "translate(40,0)";
            if (rotated) {
            // Flip dendrogram vertically
                x.range([1, 0]);
                // Rotate
                transform = "rotate(-90," + height/2 + "," + height/2 + ") translate(140, 0)";
            }
        var newLinks = [];  

        //If zoom, then dend will not be undefined, Then the data put into draw will be different
        if (dend != undefined) {

            var start=  parseInt(dend[0]);
            var finish = parseInt(dend[dend.length-1])+1;
            //For the transform scale of the transform:  It is (data/selected region) ratio -0.5 because 
            //without it, the strech isn't long enough
            var stretch = links.length/(2*dend.length-0.5);
            //Shift*range is just the transform to move the dendrogram up after the scaling
            transform += "scale(1," + stretch+") translate(0,"+(-shift*range) + ")";
            for (j=start; j<finish; j++) { 
                newLinks.push(links[j]);    
            }
        } else {
            newLinks = links;
        }

        svg = svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", transform)
            .attr("class","rootDend")

        function draw() {
            // Constrain translation to extent
            function elbow(d, i) {
                return x(d.source.y) + "," + y(d.source.x) + " " +
                    x(d.source.y) + "," + y(d.target.x) + " " +
                    x(d.target.y) + "," + y(d.target.x);
            }

        var link = svg.selectAll(".link")
            .data(newLinks)
            .attr("points", elbow)
            .enter().append("polyline")
            .attr("class", "link")
            .attr("points", elbow)
            .attr("id",function(d,i){
                return i;
            })

        var node = svg.selectAll(".node")
            .data(nodes)
            .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
            .enter().append("g")
            //.attr("class", "node")
            .attr("transform", function(d) { return "translate(" + x(d.y) + "," + y(d.x) + ")"; })
            .attr("id",function(d,i) {
                return i;
            })

        //var anchor = rotated ? "end" : "start";
        //var dx = rotated ? -3 : 3;
        //accesses all the leafnodes
        var leafNode = node.filter(function(d, i){ return !d.children; })
        //.append("text")
        //.attr("dx", dx)
        //.attr("dy", 3)
        //.style("text-anchor", anchor)
        //.text(function(d) { return d.name; })
        //.attr("font-size","4px")

        //All the ends of the leafs (This is for the zoom function)
        var leafLink = link.filter(function(d,i) {
            if (d.target.name.length>7) {
                return d.target;
            }
        }).attr("class",function(d,i) {
            return "ends_"+(rotated ? "Y" : "X")+i;
        })

        return leafNode;
        
        }
        var leaves = draw();
        return {
            draw: draw,
            leaves: leaves[0]
        };
    }  
}
