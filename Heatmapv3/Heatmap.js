function heatmap_display(metaData,xData,yData,mainData) {
    //SVG

    var
            //data[1] = rows (yLabel)
            //data[2] = cols (xLabel)
                //Heatmap color scale
            //data[3] = domain
            //data[4] = color
        var rgbScale = d3.scale.linear()
            .domain(data[3])
            .range(data[4]);

        var xScale = d3.scale.linear()
            .range([0,width-100]);
        var yScale = d3.scale.linear()
            .range([0,height-80]);  

        var selectedDat = [];
        //Creates an array just with the selected trait
        var heatGrid = heatmaprect(svg.select('svg.heatmap'),rgbScale, xScale,yScale,data[0],data[1],data[2],0,0);
        var dendro = drawDend();
        //Select Area of dendrogram
        
        var selectXDend = selectArea(xDend,
                svg.select('svg.xDend'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,data[0],data[1],data[2],1);

        var selectYDend = selectArea(yDend,
                svg.select('svg.yDend'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,data[0],data[1],data[2],2);

        //Select rectangle on heatmap
        var selectHeat = selectArea(heatmap,
                svg.select('svg.heatmap'),
                svg.select('svg.annotations'),
                svg.select('svg.heatmap'),
                rgbScale,xScale,yScale,data[0],data[1],data[2]);

    });
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


    //////DRAWING HEATMAP RECTANGLES
    function heatmaprect(svg, rgbScale,xScale,yScale,dataset,yLabel,xLabel,xStart,yStart) {
        //For the genes
        var x = xLabel.length;
        var y = yLabel.length;
        //When there are more than 70 genes, it doesn't make sense to have the row labels
        var heatmapwidth = width-100;
        if (yLength>70) {
            heatmapwidth = width-50;
        }
        //Defining the domain of the scale
        xScale.domain([0,x]);
        yScale.domain([0,y]);
        
        svg
            .attr("width",width)
            .attr("height",height)

        var heatmap = svg.selectAll('.heatmap')
            .data(dataset)
            .enter()
            .append('svg:rect')
            //.attr('class', function(d,i,j) {
            //    return 'cell bordered cr' + j + ' cc' + i;
            //})
            .attr('width' , xScale(1))
            .attr('height', yScale(1))
            //width of each rectangle
            .attr('x' , function(d,i) {
                return xScale(i % x);
            })
            //every time i gets to the passed dataset length, then y+1, start new row.
            .attr('y' , function(d,i) {
                return yScale(Math.floor(i/x));           
            })
            //fills all the rectangles with colors
            .style('fill',function(d) {
                return rgbScale(d);
            })
            .attr("class","grid")  
            //mouseover function
            .on('mouseover', function(d,i) {
                d3.select("#yLab"+Math.floor(i/x)).classed("hover",true);
                d3.select("#xLab"+(i%x)).classed("hover",true);
                d3.select(this).classed("hoverover",true)
                //Dendrogram is not recalculated, so xStart and yStart have to be passed in so that 
                //the hoverover works for the dendrogram
                d3.select(".ends_X"+(Math.floor(i/x)+yStart)).classed("hover",true);
                d3.select(".ends_Y"+((i%x)+xStart)).classed("hover",true);
                 
                //meta data!
                var titles = ["State","Weight"];
                var info = metaparsed[i%x];
                var addon = '<br>ID: '+ xLabel[i%x];
                for (k=0; k<titles.length;k++) {
                    addon = addon + '<br>'+ titles[k]+ ": "+info[k];
                }
                output = 'Gene loci: '+ yLabel[Math.floor(i/x)]+'<br>Level of expression: '+d+addon;
                           
                label
                    //event.page gives current cursor location
                    .style('top', (d3.event.pageY-55)+'px')
                    .style('left', (d3.event.pageX-155)+'px')
                    .style('background','white')
                    .style('display','block')
                    .style('opacity',0.6)
                    .html(output)        
            })
            
            .on('mouseout', function(d,i,j) {
                d3.select("#yLab"+Math.floor(i/x)).classed("hover",false);
                d3.select("#xLab"+(i%x)).classed("hover",false);
                d3.select(this).classed("hoverover",false);
                d3.select(".ends_X"+(Math.floor(i/x)+yStart)).classed("hover",false);
                d3.select(".ends_Y"+((i%x)+xStart)).classed("hover",false);
                            
            label
                .style('display','none')
            });

            //Label the heatmap

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
                            var xLength = xLabel.length
                            //If the Y dendrogram is selected, make the Y dendrogram undefined 
                            //because I dont want the y dendrogram to change
                            if (num==1) {
                                xStart = 0;
                                xFinish = xLabel.length
                                newyDend = undefined;
                            //If the X dendrogram is selected, make the X dendrogram undefined 
                            //because I dont want the x dendrogram to change
                            } else if (num==2) {
                                yStart = 0;
                                yFinish = yLabel.length
                                newxDend = undefined;
                            }

                            //Get the data selected and send it back to heatmaprect
                            for (i = xStart; i<xFinish; i++) {
                                newxLab.push(xLabel[i]);
                                newAnnot.push(metaparsed[i][0])
                                if (newyDend != undefined) {
                                    newyDend.push(d3.select(".ends_Y"+i).attr("id"))
                                }
                            }
/*
                            //Get selected Data
                            for (i=yStart;i<yFinish; i++) {
                                newyLab.push(yLabel[i]);
                                if (newxDend != undefined) {
                                    newxDend.push(d3.select(".ends_X"+i).attr("id"))
                                }
                                for (j=xStart; j<xFinish; j++) {
                                    var index = i*xLength+j;
                                    zoomDat.push(dataset[index]);
                                }
                            }
                            */
                            for (i=yStart;i<yFinish; i++) {
                                newyLab.push(yLabel[i]);
                                if (newxDend != undefined) {
                                    newxDend.push(d3.select(".ends_X"+i).attr("id"))
                                }
                            }
                            var xSel = xFinish-xStart;
                            var ySel = yFinish-yStart;
                            var totals = xSel*ySel;
                            for (i=0 ; i< totals; i++) {
                                var index = (i%xSel+xStart)+((yStart+Math.floor(i/xSel))*xLabel.length)
                                zoomDat.push(dataset[index]);
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
                            heatmaprect(heatmap, rgbScale, xScale, yScale, zoomDat, newyLab,newxLab,xStart,yStart);
                            //Modifies metadata with respect to selected area
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
        d3.json(metaData,function(metaunparsed) {
            metaparsed = [];
            selected = [];
            metaunparsed.forEach(function(d) {
                var temp = [d.State,d.Weight];
                selected.push(d.State);
                metaparsed.push(temp)
            })
            drawAnnotate(svg.select("svg.annotations"),selected);

        });
    };


    //Annotation scale
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
        //Creates an array just with the selected trait
        for (i=xStart;i<xFinish; i++){
            selectedDat.push(metaparsed[i])
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
        //if (yLength>70) {
        //    heatmapwidth = width-50;
        //}

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


    //Draws the dendrogram
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
        //stretch is default 1 because y(d.source) has to remain unchanged when not stretched
        var newLinks = [];  
        var stretch = 1;
        //If zoom, then dend will not be undefined, Then the data put into draw will be different
        if (dend != undefined) {
            //For the transform scale of the transform:  It is (data length/selected data length) ratio:
            //and length of data is links.length/2+1
            stretch = (links.length/2+1)/dend.length;
            //Shift*range is just the transform to move the dendrogram up after the scaling
            transform += "translate(0,"+(-shift*range*stretch) + ")";
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
                return x(d.source.y) + "," + stretch*y(d.source.x) + " " +
                    x(d.source.y) + "," + stretch*y(d.target.x) + " " +
                    x(d.target.y) + "," + stretch*y(d.target.x);
            }

        var link = svg.selectAll(".link")
            .data(links)
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
