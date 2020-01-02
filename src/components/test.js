import React from 'react';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router-dom';

export default class Test extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '', labelType: 'bbox', number: 0 };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);

  }
  componentDidMount(props) {
    // this.getThisData()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.match.params.taskId !== this.props.match.params.taskId) {
      this.getThisData()
    }
  }
  handleChange(event) {
    const target = event.target;
    this.setState({ [target.name]: target.value });
  }

  handleSubmit(event) {
    this.props.onAddLabel(parseInt(this.state.value), this.state.labelType)
    event.preventDefault();
  }
  handleClick() {
    this.props.history.push('/taskDetail/1/2')
  }
  // getThisData() {
  //   this.setState({ number: this.props.match.params.taskId })
  // }

  render() {
    return (
      <div>
        {this.state.number}
        <a href="https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=6d93837b-d8ce-48b9-868a-39a9d843dc57&scope=https%3A%2F%2Fgraph.microsoft.com%2Fuser.read&response_type=code&redirect_uri=https%3A%2F%2Flocalhost:44326%2Fapi%2Flogin%2Fmicrosoft&state=development">microsoft</a>
        <a href="https://open.weixin.qq.com/connect/qrconnect?appid=wx403e175ad2bf1d2d&redirect_uri=https%3A%2F%2Flocalhost:44326%2Fapi/login/wechat&response_type=code&scope=snsapi_userinfo,snsapi_login&state=668af357-8601-434b-a36a-472878d0b3b4">wechat</a>
        <Button variant="contained" onClick={this.handleClick}>Default</Button>
        <a href="https://open.weixin.qq.com/connect/qrconnect?appid=wx403e175ad2bf1d2d&redirect_uri=https%3A%2F%2Flocalhost:44326%2Fapi/login/bind/wechat&response_type=code&scope=snsapi_userinfo,snsapi_login&state=668af357-8601-434b-a36a-472878d0b3b4">wechat</a>
      </div>
    );
  }
}