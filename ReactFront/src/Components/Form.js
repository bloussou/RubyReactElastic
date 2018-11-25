import React from 'react';
import BarChart from './BarChart';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import Paper from '@material-ui/core/Paper';
import TagFacesIcon from '@material-ui/icons/TagFaces';

// CSS 
const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        padding: theme.spacing.unit / 2,
    },
    chip: {
        margin: theme.spacing.unit / 2,
    }
});

/**
 * this component give the possibility to set up the parameters and render the chart according to these paramaters
 */
class Form extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            urls: ["http://www.news.com.au/travel/travel-updates/incidents/disruptive-passenger-grounds-flight-after-storming-cockpit/news-story/5949c1e9542df41fb89e6cdcdc16b615", "http://www.smh.com.au/sport/tennis/an-open-letter-from-martina-navratilova-to-margaret-court-arena-20170601-gwhuyx.html", "http://www.smh.com.au/nsw/premier-gladys-berejiklian-announces-housing-affordability-reforms-20170601-gwi0jn.html"],
            before: "2017-06-02 12:00:00",
            after: "2017-06-01 12:00:00",
            interval: "1h",
            chipData: [
                { key: 0, label: "http://www.news.com.au/travel/travel-updates/incidents/disruptive-passenger-grounds-flight-after-storming-cockpit/news-story/5949c1e9542df41fb89e6cdcdc16b615" },
                { key: 1, label: "http://www.smh.com.au/sport/tennis/an-open-letter-from-martina-navratilova-to-margaret-court-arena-20170601-gwhuyx.html" },
            ],
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleChange2 = this.handleChange2.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }
    /**
     * Handle changes for the different time picker
     * @param {*} event 
     */
    handleChange(event) {
        if (event.target.id === "after") {
            this.setState({ after: date2elastic(event.target.value) });
        }
        if (event.target.id === "before") {
            this.setState({ before: date2elastic(event.target.value) });
        }
        if (event.target.id === "interval") {
            this.setState({ interval: hour2elastic(event.target.value) });
        }
    }
    /**
     * Handle the removal of an url
     */
    handleDelete = data => () => {
        this.setState(state => {
            const chipData = [...state.chipData];
            const chipToDelete = chipData.indexOf(data);
            chipData.splice(chipToDelete, 1);
            return { chipData };
        });
    };
    /**
     * handle the submission of an url
     * @param {*} event 
     */
    handleSubmit(event) {
        this.setState(state => {
            const chipData = [...state.chipData];
            chipData.push({ key: this.state.chipData.length, label: this.temp })
            return { chipData }
        })
        event.preventDefault();
    }
    /**
     * handle the changement of the text in the input field
     * @param {*} event 
     */
    handleChange2(event) {
        this.temp = event.target.value;
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <Paper className={classes.root}>
                    {this.state.chipData.map(data => {
                        let icon = null;

                        if (data.label === 'React') {
                            icon = <TagFacesIcon />;
                        }

                        return (
                            <Chip
                                key={data.key}
                                icon={icon}
                                label={data.label}
                                onDelete={this.handleDelete(data)}
                                className={classes.chip}
                            />
                        );
                    })}
                </Paper>
                <form className={classes.container} onChange={this.handleChange} noValidate>
                    <TextField
                        id="after"
                        label="Start Date"
                        type="datetime-local"
                        defaultValue={elastic2date(this.state.after)}
                        className={classes.textField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        id="before"
                        label="End Date"
                        type="datetime-local"
                        defaultValue={elastic2date(this.state.before)}
                        className={classes.textField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                    <TextField
                        id="interval"
                        label="Interval"
                        type="time"
                        defaultValue={elastic2hour(this.state.interval)}
                        className={classes.textField}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        inputProps={{
                            step: 300, // 5 min
                        }}
                    />

                </form>
                <form onSubmit={this.handleSubmit}>
                    <label id="newURL">
                        New Url:
                        <textarea placeholder="Enter a new url here" value={this.state.value} onChange={this.handleChange2} />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
                <BarChart urls={chipData2url(this.state.chipData)} before={this.state.before} after={this.state.after} interval={this.state.interval}></BarChart >
            </div>
        );
    }
}

Form.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Form);

/**
 * transform the chipData to an array of urls
 * @param {*} chipData 
 */
function chipData2url(chipData) {
    return chipData.map(p => p.label);
}
/**
 * format "2017-06-02T12:00" into "2017-06-02 12:00:00"
 * @param {*} date 
 */
function date2elastic(date) {
    const result = date.replace("T", " ");
    return result.concat(":00");
}
/**
 * format "2017-06-02 12:00:00" into "2017-06-02T12:00"
 * @param {*} date 
 */
function elastic2date(date) {
    const result = date.replace(" ", "T");
    return result.slice(0, result.length - 3);
}

/**
 * format "01:00" to "1h"
 * Warning : if the "00:00" is chosen, the value is set to "1h"
 * You can't choose one hour and a half, if it's the case the interval is set to 1h
 * @param {*} hour 
 */
function hour2elastic(hour) {
    if (hour === "00:00") {
        return "1h"
    }
    else if (hour.slice(0, 2) === "00") {
        return hour.slice(3, 5).concat("m");
    }
    else {
        return hour.slice(0, 2).concat("h");
    }
}

/**
 * format "1h" to "01:00" or "30m" to "00:30"
 * @param {*} hour 
 */
function elastic2hour(hour) {
    if (hour.slice(hour.length - 1, hour.length) === "m") {
        if (hour.length === 3) {
            return "00:".concat(hour.slice(0, 2));
        }
        else {
            return "00:0".concat(hour.slice(0, 1));
        }
    }
    if (hour.slice(hour.length - 1, hour.length) === "h") {
        if (hour.length === 3) {
            return hour.slice(0, 2).concat(":00")
        }
        else {
            return "0".concat(hour.slice(0, 1), ":00");
        }
    }
}

