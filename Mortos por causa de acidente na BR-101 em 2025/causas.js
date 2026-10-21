// Dimensões
var margin = { top: 10, right: 150, bottom: 10, left: 10 },
  barHeight = 28, // altura da "pista"
  labelHeight = 16, // espaço do nome da causa acima da barra
  rowGap = 12, // espaço entre as pistas
  rowHeight = barHeight + labelHeight + rowGap,
  width = 720;

var svg = d3.select("#my_dataviz");

d3.csv("causas_acidentes.csv", function (error, data) {
  if (error) {
    console.error("Erro ao carregar o CSV:", error);
    return;
  }

  data.forEach(function (d) {
    d.mortos = +d["SUM de mortos"];
  });
  data.sort(function (a, b) {
    return b.mortos - a.mortos;
  });

  var total = d3.sum(data, function (d) {
    return d.mortos;
  });
  var innerWidth = width - margin.left - margin.right;
  var height = margin.top + margin.bottom + data.length * rowHeight;

  svg.attr("viewBox", "0 0 " + width + " " + height);

  // Escala: comprimento da pista proporcional ao número de mortos
  var x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d.mortos;
      }),
    ])
    .range([0, innerWidth]);

  var defs = svg.append("defs");

  // Degradê do asfalto: cinza -> preto -> vermelho escuro (compartilhado)
  var asfalto = defs
    .append("linearGradient")
    .attr("id", "asfalto")
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "0%");
  [
    { o: "0%", c: "#6b6b6b" },
    { o: "35%", c: "#2b2b2b" },
    { o: "75%", c: "#000000" },
    { o: "100%", c: "#8b0000" },
  ].forEach(function (s) {
    asfalto.append("stop").attr("offset", s.o).attr("stop-color", s.c);
  });

  // Um degradê da faixa amarela por barra (some perto do final da pista)
  data.forEach(function (d, i) {
    var w = x(d.mortos);
    var g = defs
      .append("linearGradient")
      .attr("id", "faixa" + i)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("x2", w)
      .attr("y1", 0)
      .attr("y2", 0);
    g.append("stop").attr("offset", "0%").attr("stop-color", "#ffe600");
    g.append("stop").attr("offset", "70%").attr("stop-color", "#ffe600");
    g.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ffe600")
      .attr("stop-opacity", 0);
  });

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var rows = g
    .selectAll("g.linha")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "linha")
    .attr("transform", function (d, i) {
      return "translate(0," + i * rowHeight + ")";
    });

  // Nome da causa, acima da pista
  rows
    .append("text")
    .attr("class", "causa")
    .attr("x", 0)
    .attr("y", 11)
    .text(function (d) {
      return d.causa_acidente;
    });

  // Pista (asfalto) + faixa central
  var estrada = rows
    .append("g")
    .attr("class", "estrada")
    .attr("transform", "translate(0," + labelHeight + ")");

  estrada
    .append("rect")
    .attr("width", function (d) {
      return x(d.mortos);
    })
    .attr("height", barHeight)
    .attr("fill", "url(#asfalto)")
    .attr("stroke", "#444")
    .attr("stroke-width", 1);

  estrada
    .append("line")
    .attr("x1", 0)
    .attr("x2", function (d) {
      return x(d.mortos);
    })
    .attr("y1", barHeight / 2)
    .attr("y2", barHeight / 2)
    .attr("stroke", function (d, i) {
      return "url(#faixa" + i + ")";
    })
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", "20 14");

  estrada.append("title").text(function (d) {
    return d.causa_acidente + "\nMortos: " + d.mortos;
  });

  // Valor e percentual à direita da pista
  rows
    .append("text")
    .attr("class", "valor")
    .attr("x", function (d) {
      return x(d.mortos) + 12;
    })
    .attr("y", labelHeight + barHeight / 2)
    .attr("alignment-baseline", "middle")
    .text(function (d) {
      var pct = ((d.mortos / total) * 100).toFixed(1).replace(".", ",");
      return d.mortos + " (" + pct + "%)";
    });
});
