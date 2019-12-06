import React from 'react';
import cookie from 'react-cookies'
import dataStore from '../global-store'
// import LazyLoad from 'react-lazyload';
import { LazyLoadImage, trackWindowScroll } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LazyLoad from 'react-image-lazy-load';


export default class TaskList extends React.Component {
    constructor(props) {
        super(props)
        this.data = {
            "ImgIDs": [
                546823,
                546823,
                546823,
                546823,
                546823,
                546823,
            ]
        }

    }
    componentDidMount() {

    }

    render() {
        const imageList = this.data.ImgIDs
        const imageItemList = imageList.map((one) =>
            <div>
                {one + '.jpg'}
                <a href={"/taskDetail/" + this.props.match.params.dataSetId + "/" + one}>
                    <LazyLoad height={500} imageProps={{
                        src: dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + one + '.jpg',
                        alt: one + '.jpg',
                        ref: "image",
                        className: "className"
                    }}
                    />
                </a>
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