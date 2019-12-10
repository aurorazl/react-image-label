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
var URLSearchParams = require('url-search-params');

export default class TaskDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: {},
            image: {},
            isLoaded: false,
            error: null,
        };
        this.getData()
        this.addLabel = this.addLabel.bind(this);
    }
    getData() {
        var _this = this
        axios.get(backEndUrl + 'api/image/' + this.props.match.params.dataSetId + '/' + this.props.match.params.taskId,
            { headers: { 'Authorization': "Bearer " + cookie.load("token") } }).then(
                function (response) {
                    if (response.status == 200) {
                        var data = JSON.parse(base64.decode(response.data)).Data
                        _this.imageInfo = data.images
                        console.log("start transform")
                        var ann = data.annotations
                        var formParts = {}
                        ann.map((one, index) => {
                            var a = one.category_id
                            var points = []
                            if (typeof one.segmentation.length == 'number') {
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
                            }

                        })
                        var a = []
                        for (var p in formParts) {
                            a.push({ id: p, type: "polygon", name: dataStore.coco_classes[p] })
                        }
                        _this.setState({
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
        // const { imageId } = this.props.match.params;
        // await this.fetch('/api/images/' + imageId, {
        //     method: 'PATCH',
        //     headers: {
        //         Accept: 'application/json',
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ labelData }),
        // });
        this.setState({
            image: {
                externalLink: null, id: 4, labeld: 1, lastEdited: 1575603884857,
                link: dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + this.props.match.params.taskId + '.jpg',
                localPath: null, originalName: this.props.match.params.taskId + ".jpg", projectsId: 1,
                labelData: {
                    height: 480, width: 640,
                    labels: labelData
                }
            }
        }
        )
    }
    async fetch(...args) {
        const { projectId } = this.props.match.params;
        return await fetch(...args);
    }
    componentDidMount() {
        this.refetch();
      }
    
    componentDidUpdate(prevProps) {
    if (prevProps.match.params.imageId !== this.props.match.params.imageId) {
        this.refetch();
    }
    }
    
      async refetch() {
        this.setState({
          isLoaded: false,
          error: null,
          project: null,
          image: null,
        });
    
        const { match, history } = this.props;
        let { projectId, imageId } = match.params;
    
        try {
          const a = document.createElement('a');
          a.setAttribute('href', '/api/getLabelingInfo');
          const url = new URL(a.href);
    
          url.searchParams.append('projectId', projectId);
          if (imageId) {
            url.searchParams.append('imageId', imageId);
          }
    
          const { project, image } = await (await this.fetch(url)).json();
    
          if (!project) {
            history.replace(`/label/${projectId}/over`);
            return;
          }
    
          history.replace(`/label/${project.id}/${image.id}`);
    
          this.setState({
            isLoaded: true,
            project,
            image,
          });
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
                o.points.map(i => { seg.push(i.lng); seg.push(i.lat) })
                sendData["annotations"].push({ "segmentation": seg, "category_id": parseInt(one) })
            })
        }
        return sendData
    }

    render() {
        const title = `Image Label Tool`;
        const { history } = this.props;
        const { project, image, isLoaded, error } = this.state;
        const { referenceLink, referenceText } = project;
        const props = {
            onBack: () => {
                history.goBack();
            },
            onSkip: () => {
                const next = new URLSearchParams(this.props.location.search).get("next");
                history.replace("/taskDetail/" + this.props.match.params.dataSetId + "/" + next);

            },
            onSubmit: () => {
                this.markComplete();
                // history.push(`/label/${project.id}/`);
            },
            onLabelChange: this.pushUpdate.bind(this),
        };
        var status = JSON.stringify(this.state.image) != "{}" && JSON.stringify(this.state.project) != "{}"

        return (
            // <div className="taskList">
            //     <div>task detail - {this.props.match.params.dataSetId} - {this.props.match.params.taskId}</div>
            //     <img src={dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + this.props.match.params.taskId + '.jpg'} />
            // </div>
            <div>
                {status &&
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
                    </DocumentMeta>}
            </div>
        )
    }
}
