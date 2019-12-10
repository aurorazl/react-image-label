import React from 'react';
import cookie from 'react-cookies'
import dataStore from '../global-store'
// import LazyLoad from 'react-lazyload';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LazyLoad from 'react-image-lazy-load';
import axios from "axios";
import base64 from 'base-64'
import { backEndUrl } from '../config'
import { withRouter, Link } from "react-router-dom";

class TaskList extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: { ImgIDs: [] }
        }
        this.getData()
    }
    componentDidMount() {

    }
    getData() {
        var _this = this
        axios.get(backEndUrl + 'api/image/' + this.props.match.params.dataSetId, { headers: { 'Authorization': "Bearer " + cookie.load("token") } }).then(
            function (response) {
                console.log(response)
                if (response.status == 200) {
                    _this.setState({ data: JSON.parse(base64.decode(response.data)).Data })

                }
            }
        )
    }
    render() {
        const imageList = this.state.data.ImgIDs
        const imageItemList = imageList.map((one) =>
            <div key={one}>
                {one + '.jpg'}
                <Link to={"/taskDetail/" + this.props.match.params.dataSetId + "/" + one}>
                    <LazyLoad height={500} imageProps={{
                        src: dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + one + '.jpg',
                        alt: one + '.jpg',
                        ref: "image",
                        className: "className"
                    }}
                    />
                </Link>
            </div>
        )
        // <li key={one.toString()}>{one}
        //     <img src={dataStore.azurePath + '034e7bdc-01e0-42fe-9d03-ff1c0895d182' + '/images/' + one + '.jpg'} /></li>

        return (
            <div className="taskList">
                <div>
                    datasetid is :{this.props.match.params.dataSetId}
                </div>
                <div>{imageItemList}</div>
            </div>
        )
    }
}

export default withRouter(TaskList)