(function (d3$1,topojson) {
  'use strict';

  const query = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX edm: <http://www.europeana.eu/schemas/edm/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX hdlh: <https://hdl.handle.net/20.500.11840/termmaster>
PREFIX wgs84: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX gn: <http://www.geonames.org/ontology#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
# een foto per lat long (met type, img, lat en long van de plaats
SELECT  (SAMPLE(?cho) AS ?cho)
        (SAMPLE(?title) AS ?title)
        (SAMPLE(?typeLabel) AS ?type)
        (SAMPLE(?img) AS ?img)
		(SAMPLE(?placeName) AS ?placeName)
        (SAMPLE(?landLabel) AS ?landLabel)
        ?lat
        ?long

WHERE {
 # vind alleen foto's
 <https://hdl.handle.net/20.500.11840/termmaster1397> skos:narrower* ?type .
 ?type skos:prefLabel ?typeLabel .
 ?cho edm:object ?type .
  
 ?cho edm:isShownBy ?img .
 ?cho dc:title ?title .
  
 # vind bij de plaats van de foto de lat/long
 ?cho dct:spatial ?place .
 ?place skos:exactMatch/wgs84:lat ?lat .
 ?place skos:exactMatch/wgs84:long ?long .
  
 # vind bij de plaats van de het land
 ?place skos:exactMatch/gn:parentCountry ?land .
 ?place skos:prefLabel ?placeName .
 ?land gn:name ?landLabel .
  
} GROUP BY ?lat ?long
LIMIT 10`;

  const endpoint = "https://api.data.netwerkdigitaalerfgoed.nl/datasets/ivo/NMVW/services/NMVW-06/sparql";

  const svg = d3$1.select('svg');
  const detailsDiv = d3$1.select('.detailsDiv');
  const width = 200;
  const height = 200;
  const projection = d3$1.geoNaturalEarth1();
  const pathGenerator = d3$1.geoPath().projection(projection);

  //functies setupMap() en drawMap() van Laurens
  //https://beta.vizhub.com/Razpudding/6b3c5d10edba4c86babf4b6bc204c5f0
  setupMap();
  drawMap();
  zoomToMap();
  data();

  //Alle data functies aanroepen
  //Code van Laurens
  //https://beta.vizhub.com/Razpudding/2e039bf6e39a421180741285a8f735a3
  async function data() {
    let data = await loadJSONData(endpoint, query);
    //pas werken met data wanneer data is omgezet in json
    data = data.map(cleanData);
    data = changeImageURL(data);
    //code van Laurens, aangepast naar type
    // data = transformData(data)
    console.log(data);
    data = plotImages(data);
  }

  //Code van Laurens
  //Load the data and return a promise which resolves with said data
  function loadJSONData(url, query){
    return d3$1.json(endpoint +"?query="+ encodeURIComponent(query) + "&format=json")
      .then(data => data.results.bindings)
  }

  //Code van Laurens
  //This function gets the nested value out of the object in each property in our data
  function cleanData(data){
     let result = {};
      Object.entries(data)
      	.map(([key, propValue]) => { 		
  				result[key] = propValue.value;
    	});
     return result
  }

  //Vervang 'http' door 'https'
  function changeImageURL(results){
    results.map(result => {
      result.img = result.img.replace('http', 'https');
    });    
    return results
  }

  // //Nest the data per type
  // function transformData(source){
  //   let transformed =  d3.nest()
  // 		.key(function(d) { return d.type; })
  // 		.entries(source);
  //   transformed.forEach(type => {
  //     type.amount = type.values.length
  //   })
  //   return transformed
  // }

  function setupMap(){
    svg
      .append('path')
        .attr('class', 'sphere')
        .attr('d', pathGenerator({ type: 'Sphere' }));
  }

  function drawMap() {
    d3$1.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json').then(data => {
      const countries = topojson.feature(data, data.objects.countries);
      svg  
        .selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
          .attr('class', 'country')
          .attr('d', pathGenerator);
    });
  }

  function zoomToMap(){
    svg
      .call(d3.zoom()
        	.extent([[0, 0], [width, height]])
        	.scaleExtent([1, 2])
        	.on("zoom", zoomed));
  }

  function zoomed() {
      svg.attr("transform", d3.event.transform);
    }

  function plotImages(dataImg) {
      svg
        .selectAll('imageDiv')
        .data(dataImg)
        .enter()
    		//dankzij hulp van Laurens
        .append('image')
          .attr("xlink:href", d => d.img)
          .attr('class', 'images')
          .attr('x', function(d) {
            return projection([d.long, d.lat])[0]
          })
          .attr('y', function(d) {
            return projection([d.long, d.lat])[1]
          })
    			.on("mouseover", d => showDetails(d))
          .on("mouseout", hideDetails);
    	return dataImg
  }

  function showDetails(d) {
      detailsDiv
        .append("p")
          //.text('test')
          .attr('class', 'DetailsTekst')
          .text(d.title);
                  
          console.log('test:', d.title);
    
    detailsDiv
    	.append("img")
    	.attr('src', d.img)
    	.attr('class', 'DetailsImg');
  }

  function hideDetails() {  
      detailsDiv
        .selectAll('p, img')
          .remove();
  }

}(d3,topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHNlbGVjdCwganNvbiwgZ2VvUGF0aCwgZ2VvTmF0dXJhbEVhcnRoMSwgem9vbSB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGZlYXR1cmUgfSBmcm9tICd0b3BvanNvbic7XG5cbmNvbnN0IHF1ZXJ5ID0gYFBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIGRjOiA8aHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8+XG5QUkVGSVggZGN0OiA8aHR0cDovL3B1cmwub3JnL2RjL3Rlcm1zLz5cblBSRUZJWCBza29zOiA8aHR0cDovL3d3dy53My5vcmcvMjAwNC8wMi9za29zL2NvcmUjPlxuUFJFRklYIGVkbTogPGh0dHA6Ly93d3cuZXVyb3BlYW5hLmV1L3NjaGVtYXMvZWRtLz5cblBSRUZJWCBmb2FmOiA8aHR0cDovL3htbG5zLmNvbS9mb2FmLzAuMS8+XG5QUkVGSVggaGRsaDogPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXI+XG5QUkVGSVggd2dzODQ6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAzLzAxL2dlby93Z3M4NF9wb3MjPlxuUFJFRklYIGdlbzogPGh0dHA6Ly93d3cub3Blbmdpcy5uZXQvb250L2dlb3NwYXJxbCM+XG5QUkVGSVggc2tvczogPGh0dHA6Ly93d3cudzMub3JnLzIwMDQvMDIvc2tvcy9jb3JlIz5cblBSRUZJWCBnbjogPGh0dHA6Ly93d3cuZ2VvbmFtZXMub3JnL29udG9sb2d5Iz5cblBSRUZJWCByZGY6IDxodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjPlxuUFJFRklYIHJkZnM6IDxodHRwOi8vd3d3LnczLm9yZy8yMDAwLzAxL3JkZi1zY2hlbWEjPlxuIyBlZW4gZm90byBwZXIgbGF0IGxvbmcgKG1ldCB0eXBlLCBpbWcsIGxhdCBlbiBsb25nIHZhbiBkZSBwbGFhdHNcblNFTEVDVCAgKFNBTVBMRSg/Y2hvKSBBUyA/Y2hvKVxuICAgICAgICAoU0FNUExFKD90aXRsZSkgQVMgP3RpdGxlKVxuICAgICAgICAoU0FNUExFKD90eXBlTGFiZWwpIEFTID90eXBlKVxuICAgICAgICAoU0FNUExFKD9pbWcpIEFTID9pbWcpXG5cdFx0KFNBTVBMRSg/cGxhY2VOYW1lKSBBUyA/cGxhY2VOYW1lKVxuICAgICAgICAoU0FNUExFKD9sYW5kTGFiZWwpIEFTID9sYW5kTGFiZWwpXG4gICAgICAgID9sYXRcbiAgICAgICAgP2xvbmdcblxuV0hFUkUge1xuICMgdmluZCBhbGxlZW4gZm90bydzXG4gPGh0dHBzOi8vaGRsLmhhbmRsZS5uZXQvMjAuNTAwLjExODQwL3Rlcm1tYXN0ZXIxMzk3PiBza29zOm5hcnJvd2VyKiA/dHlwZSAuXG4gP3R5cGUgc2tvczpwcmVmTGFiZWwgP3R5cGVMYWJlbCAuXG4gP2NobyBlZG06b2JqZWN0ID90eXBlIC5cbiAgXG4gP2NobyBlZG06aXNTaG93bkJ5ID9pbWcgLlxuID9jaG8gZGM6dGl0bGUgP3RpdGxlIC5cbiAgXG4gIyB2aW5kIGJpaiBkZSBwbGFhdHMgdmFuIGRlIGZvdG8gZGUgbGF0L2xvbmdcbiA/Y2hvIGRjdDpzcGF0aWFsID9wbGFjZSAuXG4gP3BsYWNlIHNrb3M6ZXhhY3RNYXRjaC93Z3M4NDpsYXQgP2xhdCAuXG4gP3BsYWNlIHNrb3M6ZXhhY3RNYXRjaC93Z3M4NDpsb25nID9sb25nIC5cbiAgXG4gIyB2aW5kIGJpaiBkZSBwbGFhdHMgdmFuIGRlIGhldCBsYW5kXG4gP3BsYWNlIHNrb3M6ZXhhY3RNYXRjaC9nbjpwYXJlbnRDb3VudHJ5ID9sYW5kIC5cbiA/cGxhY2Ugc2tvczpwcmVmTGFiZWwgP3BsYWNlTmFtZSAuXG4gP2xhbmQgZ246bmFtZSA/bGFuZExhYmVsIC5cbiAgXG59IEdST1VQIEJZID9sYXQgP2xvbmdcbkxJTUlUIDEwYFxuXG5jb25zdCBlbmRwb2ludCA9IFwiaHR0cHM6Ly9hcGkuZGF0YS5uZXR3ZXJrZGlnaXRhYWxlcmZnb2VkLm5sL2RhdGFzZXRzL2l2by9OTVZXL3NlcnZpY2VzL05NVlctMDYvc3BhcnFsXCJcblxuY29uc3Qgc3ZnID0gc2VsZWN0KCdzdmcnKVxuY29uc3QgZGV0YWlsc0RpdiA9IHNlbGVjdCgnLmRldGFpbHNEaXYnKVxuY29uc3Qgd2lkdGggPSAyMDBcbmNvbnN0IGhlaWdodCA9IDIwMFxuY29uc3QgcHJvamVjdGlvbiA9IGdlb05hdHVyYWxFYXJ0aDEoKVxuY29uc3QgcGF0aEdlbmVyYXRvciA9IGdlb1BhdGgoKS5wcm9qZWN0aW9uKHByb2plY3Rpb24pXG5cbi8vZnVuY3RpZXMgc2V0dXBNYXAoKSBlbiBkcmF3TWFwKCkgdmFuIExhdXJlbnNcbi8vaHR0cHM6Ly9iZXRhLnZpemh1Yi5jb20vUmF6cHVkZGluZy82YjNjNWQxMGVkYmE0Yzg2YmFiZjRiNmJjMjA0YzVmMFxuc2V0dXBNYXAoKVxuZHJhd01hcCgpXG56b29tVG9NYXAoKVxuZGF0YSgpXG5cbi8vQWxsZSBkYXRhIGZ1bmN0aWVzIGFhbnJvZXBlblxuLy9Db2RlIHZhbiBMYXVyZW5zXG4vL2h0dHBzOi8vYmV0YS52aXpodWIuY29tL1JhenB1ZGRpbmcvMmUwMzliZjZlMzlhNDIxMTgwNzQxMjg1YThmNzM1YTNcbmFzeW5jIGZ1bmN0aW9uIGRhdGEoKSB7XG4gIGxldCBkYXRhID0gYXdhaXQgbG9hZEpTT05EYXRhKGVuZHBvaW50LCBxdWVyeSlcbiAgLy9wYXMgd2Vya2VuIG1ldCBkYXRhIHdhbm5lZXIgZGF0YSBpcyBvbWdlemV0IGluIGpzb25cbiAgZGF0YSA9IGRhdGEubWFwKGNsZWFuRGF0YSlcbiAgZGF0YSA9IGNoYW5nZUltYWdlVVJMKGRhdGEpXG4gIC8vY29kZSB2YW4gTGF1cmVucywgYWFuZ2VwYXN0IG5hYXIgdHlwZVxuICAvLyBkYXRhID0gdHJhbnNmb3JtRGF0YShkYXRhKVxuICBjb25zb2xlLmxvZyhkYXRhKVxuICBkYXRhID0gcGxvdEltYWdlcyhkYXRhKVxufVxuXG4vL0NvZGUgdmFuIExhdXJlbnNcbi8vTG9hZCB0aGUgZGF0YSBhbmQgcmV0dXJuIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHNhaWQgZGF0YVxuZnVuY3Rpb24gbG9hZEpTT05EYXRhKHVybCwgcXVlcnkpe1xuICByZXR1cm4ganNvbihlbmRwb2ludCArXCI/cXVlcnk9XCIrIGVuY29kZVVSSUNvbXBvbmVudChxdWVyeSkgKyBcIiZmb3JtYXQ9anNvblwiKVxuICAgIC50aGVuKGRhdGEgPT4gZGF0YS5yZXN1bHRzLmJpbmRpbmdzKVxufVxuXG4vL0NvZGUgdmFuIExhdXJlbnNcbi8vVGhpcyBmdW5jdGlvbiBnZXRzIHRoZSBuZXN0ZWQgdmFsdWUgb3V0IG9mIHRoZSBvYmplY3QgaW4gZWFjaCBwcm9wZXJ0eSBpbiBvdXIgZGF0YVxuZnVuY3Rpb24gY2xlYW5EYXRhKGRhdGEpe1xuICAgbGV0IHJlc3VsdCA9IHt9XG4gICAgT2JqZWN0LmVudHJpZXMoZGF0YSlcbiAgICBcdC5tYXAoKFtrZXksIHByb3BWYWx1ZV0pID0+IHsgXHRcdFxuXHRcdFx0XHRyZXN1bHRba2V5XSA9IHByb3BWYWx1ZS52YWx1ZVxuICBcdH0pXG4gICByZXR1cm4gcmVzdWx0XG59XG5cbi8vVmVydmFuZyAnaHR0cCcgZG9vciAnaHR0cHMnXG5mdW5jdGlvbiBjaGFuZ2VJbWFnZVVSTChyZXN1bHRzKXtcbiAgcmVzdWx0cy5tYXAocmVzdWx0ID0+IHtcbiAgICByZXN1bHQuaW1nID0gcmVzdWx0LmltZy5yZXBsYWNlKCdodHRwJywgJ2h0dHBzJylcbiAgfSkgICAgXG4gIHJldHVybiByZXN1bHRzXG59XG5cbi8vIC8vTmVzdCB0aGUgZGF0YSBwZXIgdHlwZVxuLy8gZnVuY3Rpb24gdHJhbnNmb3JtRGF0YShzb3VyY2Upe1xuLy8gICBsZXQgdHJhbnNmb3JtZWQgPSAgZDMubmVzdCgpXG4vLyBcdFx0LmtleShmdW5jdGlvbihkKSB7IHJldHVybiBkLnR5cGU7IH0pXG4vLyBcdFx0LmVudHJpZXMoc291cmNlKTtcbi8vICAgdHJhbnNmb3JtZWQuZm9yRWFjaCh0eXBlID0+IHtcbi8vICAgICB0eXBlLmFtb3VudCA9IHR5cGUudmFsdWVzLmxlbmd0aFxuLy8gICB9KVxuLy8gICByZXR1cm4gdHJhbnNmb3JtZWRcbi8vIH1cblxuZnVuY3Rpb24gc2V0dXBNYXAoKXtcbiAgc3ZnXG4gICAgLmFwcGVuZCgncGF0aCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAnc3BoZXJlJylcbiAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcih7IHR5cGU6ICdTcGhlcmUnIH0pKVxufVxuXG5mdW5jdGlvbiBkcmF3TWFwKCkge1xuICBqc29uKCdodHRwczovL3VucGtnLmNvbS93b3JsZC1hdGxhc0AxLjEuNC93b3JsZC8xMTBtLmpzb24nKS50aGVuKGRhdGEgPT4ge1xuICAgIGNvbnN0IGNvdW50cmllcyA9IGZlYXR1cmUoZGF0YSwgZGF0YS5vYmplY3RzLmNvdW50cmllcyk7XG4gICAgc3ZnICBcbiAgICAgIC5zZWxlY3RBbGwoJ3BhdGgnKVxuICAgICAgLmRhdGEoY291bnRyaWVzLmZlYXR1cmVzKVxuICAgICAgLmVudGVyKClcbiAgICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAgICAuYXR0cignY2xhc3MnLCAnY291bnRyeScpXG4gICAgICAgIC5hdHRyKCdkJywgcGF0aEdlbmVyYXRvcilcbiAgfSlcbn1cblxuZnVuY3Rpb24gem9vbVRvTWFwKCl7XG4gIHN2Z1xuICAgIC5jYWxsKGQzLnpvb20oKVxuICAgICAgXHQuZXh0ZW50KFtbMCwgMF0sIFt3aWR0aCwgaGVpZ2h0XV0pXG4gICAgICBcdC5zY2FsZUV4dGVudChbMSwgMl0pXG4gICAgICBcdC5vbihcInpvb21cIiwgem9vbWVkKSk7XG59XG5cbmZ1bmN0aW9uIHpvb21lZCgpIHtcbiAgICBzdmcuYXR0cihcInRyYW5zZm9ybVwiLCBkMy5ldmVudC50cmFuc2Zvcm0pO1xuICB9XG5cbmZ1bmN0aW9uIHBsb3RJbWFnZXMoZGF0YUltZykge1xuICAgIHN2Z1xuICAgICAgLnNlbGVjdEFsbCgnaW1hZ2VEaXYnKVxuICAgICAgLmRhdGEoZGF0YUltZylcbiAgICAgIC5lbnRlcigpXG4gIFx0XHQvL2Rhbmt6aWogaHVscCB2YW4gTGF1cmVuc1xuICAgICAgLmFwcGVuZCgnaW1hZ2UnKVxuICAgICAgICAuYXR0cihcInhsaW5rOmhyZWZcIiwgZCA9PiBkLmltZylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2ltYWdlcycpXG4gICAgICAgIC5hdHRyKCd4JywgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBwcm9qZWN0aW9uKFtkLmxvbmcsIGQubGF0XSlbMF1cbiAgICAgICAgfSlcbiAgICAgICAgLmF0dHIoJ3knLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIHByb2plY3Rpb24oW2QubG9uZywgZC5sYXRdKVsxXVxuICAgICAgICB9KVxuICBcdFx0XHQub24oXCJtb3VzZW92ZXJcIiwgZCA9PiBzaG93RGV0YWlscyhkKSlcbiAgICAgICAgLm9uKFwibW91c2VvdXRcIiwgaGlkZURldGFpbHMpO1xuICBcdHJldHVybiBkYXRhSW1nXG59XG5cbmZ1bmN0aW9uIHNob3dEZXRhaWxzKGQpIHtcbiAgICBkZXRhaWxzRGl2XG4gICAgICAuYXBwZW5kKFwicFwiKVxuICAgICAgICAvLy50ZXh0KCd0ZXN0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ0RldGFpbHNUZWtzdCcpXG4gICAgICAgIC50ZXh0KGQudGl0bGUpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICBjb25zb2xlLmxvZygndGVzdDonLCBkLnRpdGxlKVxuICBcbiAgZGV0YWlsc0RpdlxuICBcdC5hcHBlbmQoXCJpbWdcIilcbiAgXHQuYXR0cignc3JjJywgZC5pbWcpXG4gIFx0LmF0dHIoJ2NsYXNzJywgJ0RldGFpbHNJbWcnKVxufVxuXG5mdW5jdGlvbiBoaWRlRGV0YWlscygpIHsgIFxuICAgIGRldGFpbHNEaXZcbiAgICAgIC5zZWxlY3RBbGwoJ3AsIGltZycpXG4gICAgICAgIC5yZW1vdmUoKVxufVxuXG4iXSwibmFtZXMiOlsic2VsZWN0IiwiZ2VvTmF0dXJhbEVhcnRoMSIsImdlb1BhdGgiLCJqc29uIiwiZmVhdHVyZSJdLCJtYXBwaW5ncyI6Ijs7O0VBR0EsTUFBTSxLQUFLLEdBQUcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztRQTJDUCxFQUFDOztFQUVULE1BQU0sUUFBUSxHQUFHLHVGQUFzRjs7RUFFdkcsTUFBTSxHQUFHLEdBQUdBLFdBQU0sQ0FBQyxLQUFLLEVBQUM7RUFDekIsTUFBTSxVQUFVLEdBQUdBLFdBQU0sQ0FBQyxhQUFhLEVBQUM7RUFDeEMsTUFBTSxLQUFLLEdBQUcsSUFBRztFQUNqQixNQUFNLE1BQU0sR0FBRyxJQUFHO0VBQ2xCLE1BQU0sVUFBVSxHQUFHQyxxQkFBZ0IsR0FBRTtFQUNyQyxNQUFNLGFBQWEsR0FBR0MsWUFBTyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBQzs7OztFQUl0RCxRQUFRLEdBQUU7RUFDVixPQUFPLEdBQUU7RUFDVCxTQUFTLEdBQUU7RUFDWCxJQUFJLEdBQUU7Ozs7O0VBS04sZUFBZSxJQUFJLEdBQUc7SUFDcEIsSUFBSSxJQUFJLEdBQUcsTUFBTSxZQUFZLENBQUMsUUFBUSxFQUFFLEtBQUssRUFBQzs7SUFFOUMsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFDO0lBQzFCLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFDOzs7SUFHM0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUM7SUFDakIsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLEVBQUM7R0FDeEI7Ozs7RUFJRCxTQUFTLFlBQVksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDO0lBQy9CLE9BQU9DLFNBQUksQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxHQUFHLGNBQWMsQ0FBQztPQUN6RSxJQUFJLENBQUMsSUFBSSxJQUFJ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