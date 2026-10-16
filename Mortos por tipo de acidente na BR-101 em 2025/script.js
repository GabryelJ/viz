var margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

var width = 760 - margin.left - margin.right;
var height = 560 - margin.top - margin.bottom;

// Seleciona o SVG existente e define o grupo interno
var svg = d3.select("#my_dataviz")
  .attr("width", 800)
  .attr("height", 600)
  .append("g")
  .attr(
    "transform",
    "translate(" + margin.left + "," + margin.top + ")"
  );

// Carrega os dados do CSV
d3.csv("tipos_acidentes.csv", function(error, data) {

  if (error) {
    console.error("Erro ao carregar o CSV:", error);
    return;
  }

  if (!data || data.length === 0) {
    console.error("O arquivo CSV está vazio.");
    return;
  }

  // Filtrar linha de total caso exista
  data = data.filter(function(d) {
    return d.tipo_acidente !== "Total geral";
  });

  // Transforma os dados tabulares em uma hierarquia para o treemap
  var dadosHierarquicos = [
    {
      name: "Mortos",
      parent: "",
      value: 0
    },
    ...data.map(function(d) {
      return {
        name: d.tipo_acidente,
        parent: "Mortos",
        value: +d["SUM de mortos"],
        cor: d.cor
      };
    })
  ];

  // Constrói a hierarquia
  var root = d3.stratify()
    .id(function(d) {
      return d.name;
    })
    .parentId(function(d) {
      return d.parent || null;
    })
    (dadosHierarquicos);

  root.sum(function(d) {
    return d.value || 0;
  });

  // Calcula a posição e o tamanho de cada retângulo
  d3.treemap()
    .size([width, height])
    .padding(4)
    (root);

  var folhas = root.leaves();

  // Criar grupos para cada nó (retângulo + texto)
  var node = svg.selectAll("g")
    .data(folhas)
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

  // Desenha os retângulos
  node.append("rect")
    .attr("width", function(d) {
      return Math.max(0, d.x1 - d.x0);
    })
    .attr("height", function(d) {
      return Math.max(0, d.y1 - d.y0);
    })
    .style("stroke", "#ffffff")
    .style("stroke-width", "1.5px")
    .style("fill", function(d) { 
      return d.data.cor || "#e74c3c"; 
    })
    .style("opacity", 0.85);

  // Adiciona o tooltip para hover
  node.append("title")
    .text(function(d) {
      return d.data.name + "\nMortos: " + d.value;
    });

  // Adiciona os rótulos de texto com quebra de linha (tspan)
  node.append("text")
    .attr("x", 6)
    .attr("y", 16)
    .style("font-size", "11px")
    .style("font-family", "sans-serif")
    .style("fill", "white")
    .style("pointer-events", "none")
    .each(function(d) {
      var boxWidth = d.x1 - d.x0;
      var boxHeight = d.y1 - d.y0;

      // Só exibe o texto se o retângulo tiver tamanho suficiente
      if (boxWidth > 70 && boxHeight > 40) {
        var el = d3.select(this);
        
        // Linha 1: Tipo de acidente
        el.append("tspan")
          .attr("x", 6)
          .attr("dy", 0)
          .style("font-weight", "bold")
          .text(function() {
            // Trunca nomes muito longos se necessário
            var txt = d.data.name;
            return txt.length > 22 ? txt.substring(0, 20) + "..." : txt;
          });

        // Linha 2: Número de mortos
        el.append("tspan")
          .attr("x", 6)
          .attr("dy", 15)
          .style("font-size", "10px")
          .style("fill", "#f1c40f")
          .text("Mortos: " + d.value);
      }
    });
});