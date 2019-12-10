import React from 'react';
import cookie from 'react-cookies'
import Snackbar from '@material-ui/core/Snackbar';
import { ListItem, ListItemText } from '@material-ui/core';
import List from '@material-ui/core/List';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import axios from "axios";
import base64 from 'base-64'
import { backEndUrl } from '../config'
import { withRouter, Link } from "react-router-dom";
var URLSearchParams = require('url-search-params');

export default class DataSetList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            vertical: 'top',
            horizontal: 'center',
            data: {
                // "034e7bdc-01e0-42fe-9d03-ff1c0895d182": {
                //     "info": {
                //         "name": "coco valicate dataset",
                //         "type": "Image",
                //         "users": [
                //             "1DBBCA22-1CC6-4B1C-9CBA-6C1B47DB5A0A"
                //         ]
                //     }
                // }
            }
        };

    }

    componentDidMount() {
        this.saveToken()
        this.getData()
    }

    componentWillUnmount() {

    }
    saveToken() {
        const token = new URLSearchParams(this.props.location.search).get("token");
        console.log(token, cookie.load("token"))
        if (token != null) {
            cookie.save("token", token)
            this.handleClick({ vertical: 'top', horizontal: 'left' })
            setInterval(
                () => this.handleClose(),
                3000
            );
        }
    }
    handleClick(newstate) {
        this.setState({ open: true, vertical: 'top', horizontal: 'left' })
    }
    handleClose() {
        this.setState({ open: false })
    }
    getData() {
        var _this = this
        axios.get(backEndUrl + 'api/image', { headers: { 'Authorization': "Bearer " + cookie.load("token") } }).then(
            function (response) {
                if (response.status == 200) {
                    console.log(base64.decode(response.data))
                    _this.setState({ data: JSON.parse(base64.decode(response.data)).Data })
                }
            }
        )
    }

    render() {
        return (
            <DataSet data={this.state.data} vertical={this.state.vertical} horizontal={this.state.horizontal}
                open={this.state.open}
            />
        )
    }
}

function ListItemLink(props) {
    return <ListItem button component="a" {...props} />;
}

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        maxWidth: 360,
        backgroundColor: theme.palette.background.paper,
        margin: "0 auto",
    },
}));


function DataSet(props) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <h2>选择数据集</h2>
            <List component="nav" aria-label="main mailbox folders">
                {Object.entries(props.data).map(([key, value]) => {
                    return <DataSetPart key={key} dataSetId={key} dataSetInfo={value}></DataSetPart>
                })}
            </List>
            <Snackbar
                // anchorOrigin={props.vertical, props.horizontal}
                key={props.vertical, props.horizontal}
                open={props.open}
                onClose={props.handleClose}
                ContentProps={{
                    'aria-describedby': 'message-id',
                }}
                message={<span id="message-id">got token!</span>}
            />
        </div>
    )
}

function DataSetPart(props) {

    return (
        // <ListItemLink to={"/taskList/" + props.dataSetId}>
        //     <ListItemText primary={props.dataSetInfo.info.name} />
        // </ListItemLink>
        <Link to={"/taskList/" + props.dataSetId}>{props.dataSetInfo.info.name}</Link>
    )
}
