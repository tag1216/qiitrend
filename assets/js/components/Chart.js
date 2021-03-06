import React, { Component } from 'react';
import {  } from 'material-ui';
import {ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts';

import {COLORS} from '../colors';


export default class Chart extends Component {

  render() {
    const {queries, itemCounts, mode} = this.props;
    const totalMap = new Map(
      itemCounts
        .filter(c => c.query_raw === "")
        .map(c => [c.date, c.count])
    );
    const dateMap = new Map(
      itemCounts.map(d => [d.date, {date: d.date}])
    );
    itemCounts.forEach(c => {
      queries
        .filter(q => q.value === c.query_raw)
        .forEach(q => {
          dateMap.get(c.date)[q.label] =
            mode === "count"
              ? c.count
              : c.count / totalMap.get(c.date) * 100;
        });
    });
    const data =
      Array
        .from(dateMap.values())
        .sort((a, b) => a.date < b.date ? -1: 1);

    const formatter = d => mode === 'count' ? d : d.toFixed(2) + '%';

    return (
      <ResponsiveContainer>
        <LineChart data={data}
                   margin={{top: 10, right: 5, left: 5, bottom: 5}}>
          <XAxis dataKey="date"
                 tick={{fontSize: 12}}/>
          <YAxis tickFormatter={formatter}
                 tick={{fontSize: 12}}/>
          <CartesianGrid strokeDasharray="3 3"/>
          <Tooltip formatter={formatter}
                   labelStyle={{fontSize: 12}}
                   itemStyle={{fontSize: 12, padding: 0}}/>
          {this.props.queries.map((q, i) => (
            <Line key={q.label} type="monotone" dataKey={q.label} stroke={COLORS(i)} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  }
}




