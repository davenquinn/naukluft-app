const GeneralizedAxis = function(props){
 const {height, zoom, scale, pixelsPerMeter} = useContext(ColumnContext)
 const ratio = pixelsPerMeter*zoom

 // Keep labels from inhabiting the top few pixels (to make space for section labels)
 const topPadding = 30
 const maxVal = scale.domain()[1]-(topPadding/ratio)

 return h(ColumnAxis, {
   ticks: (height*zoom)/5,
   showLabel(d){ return d < maxVal }
 })
}
