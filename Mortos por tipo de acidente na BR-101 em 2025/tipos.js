// ---- Configuração do waffle ----
var LINHAS = 20, // quadradinhos por coluna
  CELULA = 15, // tamanho do quadradinho
  GAP = 2, // espaço entre eles
  PASSO = CELULA + GAP,
  LEGENDA_X = 40, // distância entre o waffle e a legenda
  LEG_LINHA = 24; // altura de cada linha da legenda

d3.csv("tipos_acidentes.csv", function (error, data) {
  if (error) {
    console.error("Erro ao carregar o CSV:", error);
    return;
  }

  data = data
    .map(function (d) {
      return {
        tipo: d.tipo_acidente,
        mortos: +d["SUM de mortos"],
        cor: (d.cor || "#e74c3c").trim(),
      };
    })
    .sort(function (a, b) {
      return b.mortos - a.mortos;
    });

  var total = d3.sum(data, function (d) {
    return d.mortos;
  });

  // Cada morte vira uma célula; preenche coluna por coluna, tipo por tipo
  var celulas = [];
  data.forEach(function (d, i) {
    d.idx = i;
    for (var k = 0; k < d.mortos; k++) {
      celulas.push({ idx: i, tipo: d.tipo, cor: d.cor });
    }
  });

  var colunas = Math.ceil(total / LINHAS);
  var wafWidth = colunas * PASSO;
  var wafHeight = LINHAS * PASSO;
  var margem = 10;
  var legX = wafWidth + LEGENDA_X;
  var svgWidth = margem + legX + 330;
  var svgHeight =
    Math.max(wafHeight, 90 + data.length * LEG_LINHA) + margem * 2;

  var svg = d3
    .select("#my_dataviz")
    .attr("viewBox", "0 0 " + svgWidth + " " + svgHeight);

  var g = svg
    .append("g")
    .attr("transform", "translate(" + margem + "," + margem + ")");

  // ---- Destaque ao passar o mouse (célula ou legenda) ----
  function destacar(idx) {
    g.selectAll(".celula").style("opacity", function (c) {
      return c.idx === idx ? 1 : 0.15;
    });
    g.selectAll(".legenda-item").style("opacity", function (l) {
      return l.idx === idx ? 1 : 0.35;
    });
  }
  function limpar() {
    g.selectAll(".celula").style("opacity", 1);
    g.selectAll(".legenda-item").style("opacity", 1);
  }

  // ---- Waffle ----
  g.append("g")
    .selectAll("rect")
    .data(celulas)
    .enter()
    .append("rect")
    .attr("class", "celula")
    .attr("x", function (d, i) {
      return Math.floor(i / LINHAS) * PASSO;
    })
    .attr("y", function (d, i) {
      return (i % LINHAS) * PASSO;
    })
    .attr("width", CELULA)
    .attr("height", CELULA)
    .attr("rx", 3)
    .attr("fill", function (d) {
      return d.cor;
    })
    .on("mouseover", function (d) {
      destacar(d.idx);
    })
    .on("mouseout", limpar)
    .append("title")
    .text(function (d) {
      return d.tipo;
    });

  // ---- Total + legenda ----
  var leg = g.append("g").attr("transform", "translate(" + legX + ",0)");

  leg.append("text").attr("class", "total-num").attr("y", 30).text(total);
  leg
    .append("text")
    .attr("class", "total-txt")
    .attr("y", 48)
    .text("mortos no total");
  leg
    .append("text")
    .attr("class", "nota")
    .attr("y", 66)
    .text("1 quadrado = 1 morte");

  var itens = leg
    .selectAll(".legenda-item")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "legenda-item")
    .attr("transform", function (d, i) {
      return "translate(0," + (90 + i * LEG_LINHA) + ")";
    })
    .on("mouseover", function (d) {
      destacar(d.idx);
    })
    .on("mouseout", limpar);

  itens
    .append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("y", -10)
    .attr("rx", 2)
    .attr("fill", function (d) {
      return d.cor;
    });

  itens
    .append("text")
    .attr("class", "legenda-nome")
    .attr("x", 20)
    .text(function (d) {
      return d.tipo;
    });

  itens
    .append("text")
    .attr("class", "legenda-valor")
    .attr("x", 330)
    .attr("text-anchor", "end")
    .text(function (d) {
      var pct = ((d.mortos / total) * 100).toFixed(1).replace(".", ",");
      return d.mortos + " (" + pct + "%)";
    });
});
