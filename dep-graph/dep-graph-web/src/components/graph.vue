<template>
  <div id="graph" class="graph"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { getDependencies } from '../api'
import { GraphNode, GraphEdge } from '../utils/type'
import * as echarts from 'echarts/core';
import { TitleComponent } from 'echarts/components';
import { GraphChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';


echarts.use(
  [TitleComponent, GraphChart, CanvasRenderer]
);

let chartDom: HTMLElement;
onMounted(async () => {
  chartDom = document.getElementById('graph')!;
  const res = await getDependencies({
    // filePath: '../../package-lock.json'
    filePath: '../../pnpm-lock.yaml'
    // filePath: '../../yarn.lock'
  })
  const { graphOption } = res
  console.log(graphOption)
  const myChart = echarts.init(chartDom);
  const option = {
    title: {
      text: 'NPM Dependencies',
      textStyle: {
        color: '#EEF1FA',
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    backgroundColor: '#0F1A2F',
    series: [
      {
        type: 'graph',
        layout: 'none',
        progressiveThreshold: 700,
        data: graphOption.nodes.map((node: GraphNode) => {
          return {
            x: node.x,
            y: node.y,
            id: node.id,
            name: node.label,
            symbolSize: 20,
            itemStyle: {
              color: node.color
            },
          };
        }),
        edges: graphOption.edges.map((edge: GraphEdge) => {
          return {
            source: edge.sourceID,
            target: edge.targetID
          };
        }),
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'right',
            show: true,
            color: '#EEF1FA',
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        roam: true,
        lineStyle: {
          width: 1,
          curveness: 0.3,
          opacity: 0.7
        }
      }
    ]
  }
  option && myChart.setOption(option)
})


</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Graph',
});
</script>

<style scoped>
.read-the-docs {
  color: #888;
}
.graph {
  width: 1280px;
  height: calc(100vh - 4rem);
}
</style>
