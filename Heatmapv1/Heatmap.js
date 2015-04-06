function heatmap_display(mainUrl,metaUrl) {

    //SVG
    var svg = d3.select("body")
        .append("svg")
        .attr("class","heatmap")

    //Label for mouseover ability
    var label = d3.select('body')
        .append('div')
        .style('position','absolute')
        .style('display','none')
        .style('font-size','10px');          

    var width = 1300;
        height = 550;

    //Pulldown menu
    var menu = d3.select('#menuselect').on("change", function() {
        var newTrait = d3.select('#menuselect').property('value')
        change(newTrait)
    });


    d3.text(mainUrl, function(unparsedData) {

        //dataset, ID - (rows) are genes, columns are patient/samples
        var dataset = d3.csv.parseRows(unparsedData);
        rowlength = dataset.length;
        var collength = dataset[0].length;
        var collabel = dataset[0];
        var rowlabel = [];
        var onlyVal = new Array;
        var rowVal = new Array;
        //svg variables

        svg
            .attr("width", width)
            .attr("height", height);
                   
        //-for loop 
        var alldat = [];
        var count = 0;

        //variable for text y
        var ytext = 0;
        //Annotations
        rawmeta();
        var max = -Infinity;
        var min = +Infinity;
        //For the rgb scale, every number in the dataset and store just the values of the dataset into onlyVal!
        for (i=0; i<dataset.length;i++) {
            for (j=0; j<dataset[i].length; j++) {
                if (!isNaN(dataset[i][j])) {
                    alldat[count] = dataset[i][j];
                    //When there is a lot of data, Math.max.apply breaks (Need to hardcode max/min)
                    max = Math.max(alldat[count],max)
                    min = Math.min(alldat[count],min)
                    count=count+1;
                    rowVal.push(dataset[i][j])
                } else if (j==0) {
                    rowlabel[i] = dataset[i][j]; 
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
        heatmaprect(rgbScale, onlyVal,rowlabel,collabel);
        });

    //////DRAWING HEATMAP RECTANGLES
    function heatmaprect(rgbScale,dataset,rowlabel,collabel) {
    	//For the genes
        var j=0;
        //When there are more than 70 genes, it doesn't make sense to have the row labels
        var heatmapwidth = width-100;
        if (rowlength>70) {
            heatmapwidth = width-50;
        }

        var xScale = d3.scale.linear()
            .domain([0, dataset[0].length])
            .range([0,heatmapwidth]);
        var yScale = d3.scale.linear()
            .domain([0,dataset.length])
            .range([0,height-80]);

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
                return yScale(j)+20;           
            })

            //fills all the rectangles with colors
            .style('fill',function(d) {
                return rgbScale(d);
            })
            //IDing each rectange for reclustering function in the future
            //.attr('row',function(d,i,j) {
            //    return j;
            //})           
            //.attr('col', function(d,i) {
            //    return i;
            //})           
            //mouseover function
            .on('mouseover', function(d,i,j) {
                d3.select("#rowLab"+j).classed("hover",true);
                d3.select("#colLab"+i).classed("hover",true);
                d3.select(this).classed("hoverover",true)
                    //.attr('stroke-width',1)
                    //.attr('stroke','white')
                     
                //meta data!
                var titles = metaparsed[0];
                var info = metaparsed[i+1];

                var addon = '';
                for (i=0; i<titles.length;i++) {
                    addon = addon + '<br>'+ titles[i]+ ": "+info[i];
                }
                           
                output = 'Gene loci: '+rowlabel[j]+'<br>Level of expression: '+d+addon;
                            
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
                d3.select("#rowLab"+j).classed("hover",false);
                d3.select("#colLab"+i).classed("hover",false);
                d3.select(this).classed("hoverover",false)
                //.attr('stroke-width',0)
                //.attr('stroke','none')
                            
            label
                .style('display','none')
            });
            //Label the heatmap
            rowlabel.shift() //Shift just deletes the first index
            collabel.shift()
            //Labels of genes
            var genelabel=svg.selectAll('.rowLabel')
                .data(rowlabel)
                .enter()
                .append('svg:text')
                .attr('class','rowLabel')
                .attr('x',width-97)
                .attr('y', function(d,i) {
                    return yScale(i)+21+(yScale(i+1)-yScale(i))/2;
                })
                .text(function(d) {
                    return d;
                })
                .attr("id", function(d,i) {
                    return "rowLab" + i;
                });

            //Label of patient
            var samplelabel= svg.selectAll('.colLabel')
                .data(collabel)
                .enter()
                .append('svg:text')
                .attr('class', 'colLabel')
                .attr('x', function(d,i) {
                    return xScale(i)+(xScale(i+1)-xScale(i))/2;
                }) 
                .attr('y',height-57)
                .text(function(d) {
                    return d;
                })
                .attr("id", function(d,i) {
                    return "colLab" + i
                })


            if (rowlabel.length>70) {
                genelabel.style('opacity',0)
            }

            selectArea(heatmap,rgbScale,xScale,yScale,dataset,rowlabel,collabel, samplelabel, genelabel);

    }

    /////ZOOM INTO RECTANGLE/////
    function selectArea(heatmap, rgbScale, xScale, yScale,dataset,rowlabel,collabel,samplelabel,genelabel) {
        var rows= [];
        var zoomDat = [];
        var newCol=[];
        var newRow = [];
        //Makes the selection rectangles 
        heatmap
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
                            var xFinish = Math.max(Math.floor(m[0]/xScale(1)), Math.floor(origin[0]/xScale(1)))
                            var yStart = Math.min(Math.floor((origin[1]-20)/yScale(1)), Math.floor((m[1]-20)/yScale(1)))
                            var yFinish =Math.max(Math.floor((m[1]-20)/yScale(1)), Math.floor((origin[1]-20)/yScale(1)))
                            var newAnnot = [];

                            newCol.push('ID');
                            newRow.push('ID');
                            //Get the data selected and send it back to heatmaprect
                            for (i = xStart; i<xFinish+1; i++) {
                                newCol.push(collabel[i]);
                                newAnnot.push(metaparsed[i+1][position])
                            }
                            for (i=yStart;i<yFinish+1; i++) {
                                newRow.push(rowlabel[i]);
                                for (j=xStart; j<xFinish+1; j++) {
                                    rows.push(dataset[i][j]);
                                }
                                zoomDat.push(rows);
                                rows = [];  
                            }
                            //Clear the sample, gene, and heatmap so the new data can be put on
                            rowlength = newRow.length;
                            samplelabel.remove();
                            genelabel.remove();
                            heatmap.remove();
                            d3.selectAll('.annote').remove();
                            heatmaprect(rgbScale, zoomDat, newRow,newCol);
                            //modifies metadata with respect to selected area
                            modifyMeta(xStart,xFinish);
                            drawAnnotate(position,newAnnot);
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
            // Call change function
            change('State');
        });
    };
    //Changes the annotation bar
    function change(newTrait) {
        //Current selection values
        position = metaparsed[0].indexOf(newTrait);
        var selectedDat = [];
        //Creates an array just with the selected trait
        for (i=0;i<metaparsed.length; i++){
            selectedDat.push(metaparsed[i][position])
        }
        //delete the trait names
        selectedDat.shift()
        drawAnnotate(position,selectedDat);
    }

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
    function drawAnnotate(position,selectedDat) {

        var scaling = annotScale(selectedDat);

        //If there are too many genes, have to expand the annotation bar
        var heatmapwidth = width-100;
        if (rowlength>70) {
            heatmapwidth = width-50;
        }

        //Sets the xScale annotations
        var xScale = d3.scale.linear()
            .domain([0, selectedDat.length])
            .range([0,heatmapwidth]);
            
        //Annotation svg
        var annotation = svg
        	.append("g")
        	.attr('class','annote')
        
        annotation.selectAll('.annote')
            .data(selectedDat)
            .enter()
            .append('svg:rect')
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
            });    
    };  
}
