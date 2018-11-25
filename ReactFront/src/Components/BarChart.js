import React from 'react';
import * as d3 from 'd3';
import axios from 'axios';

/**
 * This component collect the data and build the chart using D3.js
 */
class BarChart extends React.Component {

    constructor(props) {
        super(props)
        this.createBarChart = this.createBarChart.bind(this);
        this.width = window.innerWidth;
        this.padding = 100;
        this.height = window.innerHeight - 200;
        this.margin = { top: 20, right: 20, bottom: 100, left: 40 };
        this.state = {
            urls: this.props.urls,
            before: this.props.before,
            after: this.props.after,
            interval: this.props.interval,
        }
    }

    componentDidMount() {
        this.createBarChart()
    }

    componentDidUpdate() {
        d3.select(this.node).selectAll("*").remove(); //removing the previous chart
        this.createBarChart();
    }

    /**
     * Method to update the state when new props are received
     * @param {*} nextProps 
     */
    componentWillReceiveProps(nextProps) {
        if (this.state.urls !== nextProps.urls) {
            this.setState({
                urls: nextProps.urls
            })
        }
        this.setState({
            before: nextProps.before,
            after: nextProps.after,
            interval: nextProps.interval
        })
    }

    async createBarChart() {
        const result = await request(this.state.urls, this.state.after, this.state.before, this.state.interval)
        let data = DataSetUp(result);

        let data2 = [];

        // build data2, the good representation of the data to build a stacked chart
        data.forEach(element => {
            let stri = "{";
            stri = stri.concat("\"", "time", "\"", ":", "\"", element.time.slice(0, 16).replace("T", " "), "\",");
            stri = stri.concat("\"", "total", "\"", ":", element.total, ",");
            element.doc_table.forEach(d => {
                stri = stri.concat("\"", d.url, "\"", ":", d.doc_count, ",")
            })
            data2.push(JSON.parse(stri.slice(0, stri.length - 1) + "}"))
        });

        ////////////////////////////////////////////////////////////
        //////////////////////// Set-up ////////////////////////////
        ////////////////////////////////////////////////////////////
        const node = this.node;

        d3.select(node).append("svg")
            .attr("width", this.width - this.margin.left - this.margin.right)
            .attr("height", this.height - this.margin.top - this.margin.bottom)

        var g = d3.select(node).append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        // Set X scale
        var x = d3.scaleBand()
            .rangeRound([0, this.width - this.margin.right - this.margin.left])
            .paddingInner(0.05)
            .align(0.1);

        // set y scale
        var y = d3.scaleLinear()
            .rangeRound([this.height - this.margin.top - this.margin.bottom, 0]);

        // Set the colors
        var z = d3.scaleOrdinal()
            .range(["#2EC0F9", "#67AAF9", "#9BBDF9", "#C4E0F9", "#B95F89", "#503D3F", "#615756", "#539987", "#52FFB8", "#4DFFF3"]);

        var keys = data.map(d => (d.doc_table.map(res => res.url)))[0];

        x.domain(data.map((d) => d.time.slice(0, 16).replace("T", " ")));
        y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();
        z.domain(keys);

        g.append("g")
            .selectAll("g")
            .data(d3.stack().keys(keys)(data2))
            .enter().append("g")
            .attr("fill", function (d) { return z(d.key); })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.time); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .on("mouseover", function () { tooltip.style("display", null); })
            .on("mouseout", function () { tooltip.style("display", "none"); })
            .on("mousemove", function (d) {
                var xPosition = d3.mouse(this)[0] - 5;
                var yPosition = d3.mouse(this)[1] - 5;
                tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                tooltip.select("text").text(d[1] - d[0]);
            });

        let translate = this.height - this.margin.top - this.margin.bottom

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + translate + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .attr("text-anchor", "start")

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y(y.ticks().pop()) + 0.5)
            .attr("dy", "0.32em")
            .attr("fill", "#000")
            .attr("font-weight", "bold")
            .attr("text-anchor", "start");

        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice().reverse())
            .enter().append("g")
            .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

        legend.append("rect")
            .attr("x", this.width - 70)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", z);

        legend.append("text")
            .attr("x", this.width - 83)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(function (d) { return d; });

        // Prep the tooltip bits, initial display is hidden
        var tooltip = d3.select(node).append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 30)
            .attr("height", 20)
            .attr("fill", "white")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 15)
            .attr("dy", "1.2em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");

    }
    render() {
        return (
            < svg ref={node => this.node = node} width={this.width} height={this.height} ></svg >
        );
    }
}

export default BarChart;


/**
 * Format the receiving data as [{time:"cndckbs", total:1234, doc_table: [{url : "http://...", doc_count: 123}, ...]}, ...]
 * @param {*} data 
 */
function DataSetUp(data) {

    let result = data.first_agg.buckets.map(function (d) {
        return ({ time: d.key_as_string, total: d.doc_count, doc_table: d.counts.buckets.map(v => ({ url: v.key, doc_count: v.doc_count })) });
    })
    return result;
}
/**
 * Async function using axios to make the request to the ruby api
 * @param {*} urls a table of urls
 * @param {*} before the end date of the chart
 * @param {*} after start date of the chart
 * @param {*} interval 
 */
async function request(urls, before, after, interval) {
    const params = {
        "urls": urls,
        "before": before,
        "after": after,
        "interval": interval
    };
    let result;
    await axios.get('http://localhost:3000/api/v1/articles', { params: params })
        .then(function (response) {
            result = response;
        })
        .catch(function (error) {
            console.log(error);
        });
    return result.data.data.aggregations;
}