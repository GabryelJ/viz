// Definir dimensões e margens do gráfico
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 460 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom,
    innerRadius = 80,
    outerRadius = Math.min(width, height) / 2;

// Seleciona o SVG que já está no HTML e define largura/altura
var svg = d3.select("#my_dataviz")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 50) + ")");

// Carregar o CSV correto
d3.csv("causas_acidentes.csv", function(error, data) {
  if (error) {
    console.error("Erro ao carregar o CSV:", error);
    return;
  }

  // Converter os valores de mortos para número
  data.forEach(function(d) {
    d.mortos = +d["SUM de mortos"];
  });

  // Escala X baseada nas causas dos acidentes
  var x = d3.scaleBand()
      .range([0, 2 * Math.PI])    
      .align(0)                  
      .domain(data.map(function(d) { return d.causa_acidente; }));

  // Escala Radial Y dinâmica baseada no valor máximo do CSV
  var maxVal = d3.max(data, function(d) { return d.mortos; });
  var y = d3.scaleRadial()
      .range([innerRadius, outerRadius])   
      .domain([0, maxVal > 0 ? maxVal : 100]); 

  // Adicionar as barras (arcos do gráfico radial)
  svg.append("g")
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
      .attr("fill", "#69b3a2")
      .attr("d", d3.arc()     
          .innerRadius(innerRadius)
          .outerRadius(function(d) { return y(d.mortos); })
          .startAngle(function(d) { return x(d.causa_acidente); })
          .endAngle(function(d) { return x(d.causa_acidente) + x.bandwidth(); })
          .padAngle(0.01)
          .padRadius(innerRadius))
    .append("title") // Tooltip para identificar cada causa ao passar o rato
      .text(function(d) {
        return d.causa_acidente + "\nMortos: " + d.mortos;
      });

      // Add the labels
  svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
        .attr("text-anchor", function(d) { return (x(d.causa_acidente) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        .attr("transform", function(d) { return "rotate(" + ((x(d.causa_acidente) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.mortos)+10) + ",0)"; })
      .append("text")
        .text(function(d){return(d.causa_acidente)})
        .attr("transform", function(d) { return (x(d.causa_acidente) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")
      
});