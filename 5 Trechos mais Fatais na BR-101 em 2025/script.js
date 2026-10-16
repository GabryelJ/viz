// Definir as dimensões e margens do gráfico
var margin = {top: 20, right: 30, bottom: 150, left: 50},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var container = d3.select("#my_dataviz");
container.selectAll("*").remove();

var svg = container
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Carrega os dados do CSV das rodovias
d3.csv("pontos_socorro_movel.csv", function(error, data) {
  if (error) throw error;

  // Converter 'mortos' para número e ordenar do maior para o menor
  data.forEach(function(d) {
    d.mortos = +d.mortos;
  });
  data.sort(function(a, b) {
    return b.mortos - a.mortos;
  });

  // Eixo X (Trechos das rodovias)
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.Trecho; }))
    .padding(1);

  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  // Eixo Y (Número de mortos)
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.mortos; }) + 1])
    .range([ height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  // Palito do pirulito
  svg.selectAll("myline")
    .data(data)
    .enter()
    .append("line")
      .attr("x1", function(d) { return x(d.Trecho); })
      .attr("x2", function(d) { return x(d.Trecho); })
      .attr("y1", function(d) { return y(d.mortos); })
      .attr("y2", y(0))
      .attr("stroke", "grey");

  // Pirulito
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function(d) { return x(d.Trecho); })
      .attr("cy", function(d) { return y(d.mortos); })
      .attr("r", "5")
      .style("fill", "#e74c3c")
      .attr("stroke", "black")
    .append("title")
      .text(function(d) {
        return d.Trecho + "\nMortos: " + d.mortos;
      });
});