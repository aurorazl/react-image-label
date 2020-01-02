import React from 'react';
import dataStore from '../global-store'
import DocumentMeta from 'react-document-meta';
import LabelingApp from './LabelingApp';
import axios from "axios";
import base64 from 'base-64'
import cookie from 'react-cookies'
import { backEndUrl } from '../config'
import AddLabel from './AddLabel'
import { withRouter, Link } from "react-router-dom";
import { Loader } from 'semantic-ui-react';
var URLSearchParams = require('url-search-params');

export default class TaskDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            error: null,
            project: null,
            image: null,
        };
        this.addLabel = this.addLabel.bind(this);

    }
    getTaskList() {
        var _this = this
        axios.get(backEndUrl + 'api/image/' + this.props.match.params.dataSetId,
            { headers: { 'Authorization': "Bearer " + cookie.load("token") } }).then(
                function (response) {
                    if (response.status == 200) {
                        var data = JSON.parse(base64.decode(response.data)).Data
                        _this.idList = data.ImgIDs
                    }
                })
    }
    getNext(prev) {
        if (!this.idList) {
            this.getTaskList()
        }
        var index = this.idList.findIndex((n) => n == prev)
        if (index != -1) {
            return this.idList[index + 1]
        }
        return null
    }
    getData() {
        var _this = this
        axios.get(backEndUrl + 'api/projects/E07A5E18-6CF9-4863-999B-166AAE5C794D/datasets/' + this.props.match.params.dataSetId + '/tasks/annotations/' + this.props.match.params.taskId,
            { headers: { 'Authorization': "Bearer " + cookie.load("token") } }).then(
                function (response) {
                    if (response.status == 200) {
                        // var data = JSON.parse(base64.decode(response.data)).Data
                        var data = []
                        var a = []
                        var formParts = {}
                        if (false) {
                            _this.imageInfo = data.images
                            console.log("start transform")
                            var ann = data.annotations
                            ann.map((one, index) => {
                                var a = one.category_id
                                var points = []
                                if (typeof one.segmentation.length == 'number') {
                                    if (one.segmentation.length != 0) {
                                        one.segmentation.forEach(element => {
                                            for (var i = 0, len = element.length; i < len; i = i + 2) {
                                                points.push({ "lng": element[i], "lat": element[i + 1] })
                                            }
                                            if (!formParts.hasOwnProperty(a)) {
                                                formParts[a] = [{ id: (index + i).toString(), type: "polygon", points: points }]
                                            } else {
                                                formParts[a].push({ id: (index + i).toString(), type: "polygon", points: points })
                                            }
                                        });
                                    } else {
                                        if (one.bbox.length == 4) {
                                            points.push({ "lng": one.bbox[0], "lat": one.bbox[1] })
                                            points.push({ "lng": one.bbox[0] + one.bbox[2], "lat": one.bbox[1] + one.bbox[3] })
                                            if (!formParts.hasOwnProperty(a)) {
                                                formParts[a] = [{ id: (index).toString(), type: "bbox", points: points }]
                                            } else {
                                                formParts[a].push({ id: (index).toString(), type: "bbox", points: points })
                                            }
                                        }
                                    }

                                }
                            })
                            for (var p in formParts) {
                                a.push({ id: p, type: formParts[p][0].type, name: dataStore.coco_classes[p] })
                            }
                        }
                        else {
                            _this.imageInfo = { "file_name": _this.props.match.params.taskId + '.jpg' }
                        }
                    }
                    else {
                        console.log("here")
                        _this.imageInfo = { "file_name": _this.props.match.params.taskId + '.jpg' }
                    }
                    _this.setState({
                        isLoaded: true,
                        project: {
                            "form": { formParts: a }, id: 1, name: "Test", referenceLink: null, referenceText: null
                        },
                        image: {
                            externalLink: null, id: 4, labeld: 1, lastEdited: 1575603884857,
                            link: dataStore.azurePath + _this.props.match.params.dataSetId + '/images/' + _this.props.match.params.taskId + '.jpg',
                            localPath: null, originalName: _this.props.match.params.taskId + ".jpg", projectsId: 1,
                            labelData: {
                                height: 480, width: 640,
                                labels: formParts
                            }
                        }
                    });
                }
            )
    }
    addLabel(labelNumber, labelType) {
        var newProject = this.state.project
        newProject.form.formParts.push(
            { id: labelNumber, type: labelType, name: dataStore.coco_classes[labelNumber] })
        this.setState({ project: newProject })
    }
    async pushUpdate(labelData) {
        if (this.imageInfo) {
            this.imageInfo["height"] = labelData.height
            this.imageInfo["width"] = labelData.width
        }
        this.setState({
            image: {
                externalLink: null, id: 4, labeld: 1, lastEdited: 1575603884857,
                link: dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + this.props.match.params.taskId + '.jpg',
                localPath: null, originalName: this.props.match.params.taskId + ".jpg", projectsId: 1,
                labelData: labelData
            }
        }
        )
    }
    async fetch(...args) {
        const { projectId } = this.props.match.params;
        return await fetch(...args);
    }
    componentDidMount() {
        this.getData();
        // this.getTaskList()
    }
    componentDidUpdate(prevProps) {
        if (prevProps.match.params.taskId !== this.props.match.params.taskId) {
            this.refetch();
        }
    }

    async refetch() {
        this.setState({
            isLoaded: false,
            error: null,
            project: null,
            image: null
        });

        const { match, history } = this.props;
        let { dataSetId, taskId } = match.params;

        try {
            if (!taskId) {
                history.replace(`/taskList/${dataSetId}`);
                return;
            }
            history.replace(`/taskDetail/${dataSetId}/${taskId}`);
            this.getData()
        } catch (error) {
            this.setState({
                isLoaded: true,
                error,
            });
        }
    }
    async markComplete() {
        await this.fetch(backEndUrl + 'api/image/' + this.props.match.params.dataSetId + '/' + this.props.match.params.taskId, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + cookie.load("token")
            },
            body: "'" + base64.encode(JSON.stringify(this.tansformToCocoFormat())) + "'",
        }).then((response) => {
            if (response.status !== 200) {
                console.log('Problem in fetching');
                return;
            }
            response.text().then(data => console.log(base64.decode(data)))
        }
        );
    }
    tansformToCocoFormat() {
        var sendData = { images: this.imageInfo, annotations: [] }
        var data = this.state.image.labelData.labels
        for (var one in data) {
            data[one].map((o) => {
                var seg = []
                if (o.type == "polygon") {
                    o.points.map(i => { seg.push(i.lng); seg.push(i.lat) })
                    sendData["annotations"].push({ "segmentation": [seg], "category_id": parseInt(one), "bbox": [] })
                }
                else {
                    seg.push(o.points[0].lng)
                    seg.push(o.points[0].lat)
                    seg.push(o.points[1].lng - o.points[0].lng)
                    seg.push(o.points[1].lat - o.points[0].lat)
                    sendData["annotations"].push({ "segmentation": [], "category_id": parseInt(one), "bbox": seg })
                }
            })
        }
        return sendData
    }

    render() {
        const title = `Image Label Tool`;
        const { history } = this.props;
        const { project, image, isLoaded, error } = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <Loader active inline="centered" />;
        }
        const { referenceLink, referenceText } = project;
        const props = {
            onBack: () => {
                history.goBack();
            },
            onSkip: () => {
                var next = this.getNext(this.props.match.params.taskId)
                history.push("/taskDetail/" + this.props.match.params.dataSetId + "/" + next);
            },
            onSubmit: () => {
                this.markComplete();
                var next = this.getNext(this.props.match.params.taskId)
                history.push("/taskDetail/" + this.props.match.params.dataSetId + "/" + next);
            },
            onLabelChange: this.pushUpdate.bind(this),
        };

        return (
            <div>
                <DocumentMeta title={title}>
                    <LabelingApp
                        labels={project.form.formParts}
                        reference={{ referenceLink, referenceText }}
                        labelData={image.labelData.labels || {}}
                        imageUrl={image.link}
                        fetch={this.fetch.bind(this)}
                        demo={project.id === 'demo'}
                        {...props}
                    />
                    <AddLabel onAddLabel={this.addLabel} />
                </DocumentMeta>
            </div>
        )
    }
}
