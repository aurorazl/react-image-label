import React from 'react';
import dataStore from '../global-store'
import DocumentMeta from 'react-document-meta';
import LabelingApp from './LabelingApp';

export default class TaskDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            project: {
                "form": {
                    formParts: [
                        { id: "test1", type: 'polygon', name: "sheep" },
                        { id: "test2", type: 'polygon', name: "person" },
                        { id: "test3", type: 'polygon', name: "car" },
                        { id: "test4", type: 'polygon', name: "tie" },
                        { id: "test5", type: 'polygon', name: "skis" },
                        { id: "test6", type: 'polygon', name: "bicycle" }
                    ]
                }, id: 1, name: "Test", referenceLink: null, referenceText: null
            },
            image: {
                externalLink: null, id: 4, labeld: 1, lastEdited: 1575603884857, link: 'https://skypulis1chinanorth2.blob.core.chinacloudapi.cn/public/tasks/F00E4FB1-09EF-CD27-C46F-6CE7579A9ADB/images/546823.jpg',
                localPath: null, originalName: "546823.jpg", projectsId: 1,
                labelData: {}
            },
            isLoaded: false,
            error: null,
        };
    }
    async pushUpdate(labelData) {
        const { imageId } = this.props.match.params;
        await this.fetch('/api/images/' + imageId, {
            method: 'PATCH',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ labelData }),
        });
    }
    async fetch(...args) {
        const { projectId } = this.props.match.params;
        return await fetch(...args);
    }
    render() {
        const title = `Image  Label Tool`;
        const { history } = this.props;
        const { project, image, isLoaded, error } = this.state;
        const { referenceLink, referenceText } = project;
        const props = {
            onBack: () => {
                history.goBack();
            },
            onSkip: () => {
                history.push(`/label/${project.id}/`);
            },
            onSubmit: () => {
                this.markComplete();
                history.push(`/label/${project.id}/`);
            },
            onLabelChange: this.pushUpdate.bind(this),
        };
        return (
            // <div className="taskList">
            //     <div>task detail - {this.props.match.params.dataSetId} - {this.props.match.params.taskId}</div>
            //     <img src={dataStore.azurePath + this.props.match.params.dataSetId + '/images/' + this.props.match.params.taskId + '.jpg'} />
            // </div>
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
            </DocumentMeta>
        )
    }
}