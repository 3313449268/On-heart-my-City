import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface RadarDataItem {
  name: string;
  value: number;
}

interface RadarSeries {
  name: string;
  data: RadarDataItem[];
  color?: string;
}

interface RadarChartProps {
  data: RadarSeries[];
  title?: string;
  height?: number | string;
  indicators?: { name: string; max?: number }[];
}

const defaultColors = [
  'rgba(16, 185, 129, 0.8)',
  'rgba(59, 130, 246, 0.8)',
  'rgba(249, 115, 22, 0.8)',
  'rgba(139, 92, 246, 0.8)',
  'rgba(236, 72, 153, 0.8)',
];

const defaultAreaColors = [
  'rgba(16, 185, 129, 0.2)',
  'rgba(59, 130, 246, 0.2)',
  'rgba(249, 115, 22, 0.2)',
  'rgba(139, 92, 246, 0.2)',
  'rgba(236, 72, 153, 0.2)',
];

export default function RadarChart({
  data,
  title,
  height = 400,
  indicators,
}: RadarChartProps) {
  const option = useMemo<EChartsOption>(() => {
    const indicatorsData = indicators || (data[0]?.data.map((item) => ({
      name: item.name,
      max: 10,
    })) ?? []);

    const seriesData = data.map((series, index) => {
      const color = series.color || defaultColors[index % defaultColors.length];
      const areaColor = defaultAreaColors[index % defaultAreaColors.length];
      const values = indicatorsData.map((ind) => {
        const item = series.data.find((d) => d.name === ind.name);
        return item?.value ?? 0;
      });

      return {
        value: values,
        name: series.name,
        itemStyle: {
          color: color,
        },
        lineStyle: {
          width: 2,
          color: color,
        },
        areaStyle: {
          color: areaColor,
        },
      };
    });

    return {
      title: title
        ? {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
              fontSize: 16,
              fontWeight: 600,
              color: '#334155',
              fontFamily: "'Noto Serif SC', serif",
            },
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155',
        },
        padding: [10, 14],
        borderRadius: 8,
      },
      legend: {
        data: data.map((d) => d.name),
        bottom: 10,
        textStyle: {
          color: '#64748b',
          fontSize: 12,
        },
      },
      radar: {
        indicator: indicatorsData,
        shape: 'polygon',
        splitNumber: 5,
        axisName: {
          color: '#64748b',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['#f8fafc', '#f1f5f9', '#f8fafc', '#f1f5f9', '#f8fafc'],
          },
        },
        axisLine: {
          lineStyle: {
            color: '#cbd5e1',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: seriesData,
          symbol: 'circle',
          symbolSize: 6,
        },
      ],
    };
  }, [data, title, indicators]);

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
    />
  );
}
