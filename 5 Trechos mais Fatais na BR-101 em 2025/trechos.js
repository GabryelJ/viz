d3.csv("trechos.csv", function (error, dados) {
  if (error) {
    console.error("Erro ao carregar o CSV:", error);
    return;
  }
  dados.forEach(function (d) {
    d.mortos = +d.mortos;
    d.trecho = d.Trecho;
  });
  dados.sort(function (a, b) {
    return b.mortos - a.mortos;
  });

  var W = 900,
    m = { top: 10, right: 40, bottom: 34, left: 240 },
    rowH = 70,
    innerH = rowH * dados.length,
    innerW = W - m.left - m.right;

  var svg = d3
    .select("#my_dataviz")
    .attr("viewBox", "0 0 " + W + " " + (innerH + m.top + m.bottom))
    .append("g")
    .attr("transform", "translate(" + m.left + "," + m.top + ")");

  var x = d3.scaleLinear().domain([0, 12]).range([0, innerW]);

  var grade = svg
    .append("g")
    .attr("class", "grade")
    .selectAll("g")
    .data(x.ticks(6))
    .enter()
    .append("g")
    .attr("transform", function (t) {
      return "translate(" + x(t) + ",0)";
    });
  grade.append("line").attr("y2", innerH);
  grade
    .append("text")
    .attr("y", innerH + 22)
    .text(function (t) {
      return t;
    });

  var linhas = svg
    .selectAll(".linha")
    .data(dados)
    .enter()
    .append("g")
    .attr("transform", function (d, i) {
      return "translate(0," + (i * rowH + rowH / 2) + ")";
    });

  linhas
    .append("text")
    .attr("class", "rotulo")
    .attr("x", -18)
    .attr("dy", "0.35em")
    .text(function (d) {
      return d.trecho;
    });

  // "haste" tracejada como a faixa da pista
  linhas
    .append("line")
    .attr("x1", 0)
    .attr("x2", function (d) {
      return x(d.mortos);
    })
    .attr("stroke", "#ffd400")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "12 7");

  linhas
    .append("circle")
    .attr("cx", function (d) {
      return x(d.mortos);
    })
    .attr("r", 17)
    .attr("fill", "#e74c3c")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .append("title")
    .text(function (d) {
      return d.trecho + "\nMortos: " + d.mortos;
    });

  linhas
    .append("text")
    .attr("class", "pino-num")
    .attr("dy", "0.35em")
    .attr("x", function (d) {
      return x(d.mortos);
    })
    .attr("pointer-events", "none")
    .text(function (d) {
      return d.mortos;
    });
});
