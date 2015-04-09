install.packages('gplots')
library(gplots)
install.packages('RJSONIO')
library(RJSONIO)

HCtoJSON<-function(hc){
  
  labels<-hc$labels
  merge<-data.frame(hc$merge)
  
  for (i in (1:nrow(merge))) {
    
    if (merge[i,1]<0 & merge[i,2]<0) {
      eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", children=list(list(name=labels[-merge[i,1]]),list(name=labels[-merge[i,2]])))")))}
    else if (merge[i,1]>0 & merge[i,2]<0) {
      eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", children=list(node", merge[i,1], ", list(name=labels[-merge[i,2]])))")))}
    else if (merge[i,1]<0 & merge[i,2]>0) {
      eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", children=list(list(name=labels[-merge[i,1]]), node", merge[i,2],"))")))}
    else if (merge[i,1]>0 & merge[i,2]>0) {
      eval(parse(text=paste0("node", i, "<-list(name=\"node", i, "\", children=list(node",merge[i,1] , ", node" , merge[i,2]," ))")))}
  }
  
  eval(parse(text=paste0("JSON<-toJSON(node",nrow(merge), ")")))
  
  return(JSON)
}


genes <- read.csv(file="/Users/thomasyu/Desktop/Sage Bionetworks/Heatmap_FINAL_Alljson/PCBC_geneExpr_data.csv",head=TRUE,row.names=1)
gene <- as.matrix(genes)
metadatas <- read.csv(file="/Users/thomasyu/Desktop/Sage Bionetworks/Heatmap_FINAL_Alljson/metadata.csv",head=TRUE,row.names=1)
metadata <- as.matrix(metadatas)

rowClust <- hclust(dist(gene))
gene <- gene[rowClust$order,]

colClust <- hclust(dist(t(gene)))
gene <- gene[,colClust$order]
metadata <- metadata[colClust$order,]

rows <- row.names(gene)
scale <- range(gene)
cols <- colnames(gene)
domain <- seq.int(ceiling(scale[2]),floor(scale[1]), length.out = 100)
colors <- heat.colors(100)

rowDend <- HCtoJSON(rowClust)
colDend <- HCtoJSON(colClust)
writeLines(rowDend, "rowDendro.json")
writeLines(colDend, "colDendro.json")
writeLines(toJSON(metadata), "metadata.json")
total <- toJSON(list(gene,
                     rows,
                     cols,
                     domain,
                     sub('FF$', '', colors)))

writeLines(total,"total.json")


