define(function (require) {
  return function ColumnHandler(d3, Private) {
    var $ = require('jquery');

    var injectZeros = Private(require('components/vislib/components/zero_injection/inject_zeros'));
    var Handler = Private(require('components/vislib/lib/handler/handler'));
    var Data = Private(require('components/vislib/lib/data'));
    var Legend = Private(require('components/vislib/lib/legend'));
    var XAxis = Private(require('components/vislib/lib/x_axis'));
    var YAxis = Private(require('components/vislib/lib/y_axis'));
    var AxisTitle = Private(require('components/vislib/lib/axis_title'));
    var ChartTitle = Private(require('components/vislib/lib/chart_title'));
    var Alerts = Private(require('components/vislib/lib/alerts'));

    /*
     * Create handlers for Area, Column, and Line charts which
     * are all nearly the same minus a few details
     */
    function create(opts) {
      opts = opts || {};

      return function (vis) {
        var data;
        if (opts.zeroFill) {
          data = new Data(injectZeros(vis.data), vis._attr);
        } else {
          data = new Data(vis.data, vis._attr);
        }

        return new Handler(vis, {
          data: data,
          legend: new Legend(vis, vis.el, data.labels, data.color, vis._attr),
          axisTitle: new AxisTitle(vis.el, data.get('xAxisLabel'), data.get('yAxisLabel')),
          chartTitle: new ChartTitle(vis.el),
          xAxis: new XAxis({
            el                : vis.el,
            xValues           : data.xValues(),
            ordered           : data.get('ordered'),
            xAxisFormatter    : data.get('xAxisFormatter'),
            expandLastBucket  : opts.expandLastBucket,
            _attr             : vis._attr
          }),
          alerts: new Alerts(vis, data, opts.alerts),
          yAxis: new YAxis({
            el   : vis.el,
            yMin : data.gitYMin(),
            yMax : data.gitYMax(),
            _attr: vis._attr
          })
        });
      };
    }

    return {
      line: create(),

      column: create({
        zeroFill: true,
        expandLastBucket: true
      }),

      area: create({
        zeroFill: true,
        alerts: [
          {
            type: 'warning',
            msg: 'Positive and negative values are not accurately represented by stacked ' +
                 'area charts. The line chart is better suited for this type of data.',
            test: function (vis, data) {
              return vis._attr.mode === 'stacked' && data.gitYMax() > 0 && data.gitYMin() < 0;
            }
          }
        ]
      })
    };
  };
});

