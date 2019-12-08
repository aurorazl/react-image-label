import React from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

export default class AddLabel extends React.Component {
    constructor(props) {
      super(props);
      this.state = {value: '',labelType:'bbox'};
  
      this.handleChange = this.handleChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
  
    handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});
    }
  
    handleSubmit(event) {
        this.props.onAddLabel(parseInt(this.state.value),this.state.labelType)
        event.preventDefault();
    }
    
    render() {
      return (
          <form onSubmit={this.handleSubmit} style={{bottom:0,position:"absolute",left:'300px'}}>
            <div style={{marginBottom: '10px'}}>
              <TextField required id="outlined-basic" variant="outlined" label="Label number:"
              type="text" name="value" value={this.state.value} onChange={this.handleChange}/>
            </div>
            <div style={{marginBottom: '10px'}}>
              <TextField
                id="outlined-select-currency"
                select
                label="labelType"
                name="labelType"
                value={this.state.labelType}
                onChange={this.handleChange}
                helperText="Please select one labelType"
                variant="outlined"
              >
              <MenuItem key="bbox" value="bbox">bbox</MenuItem>
              <MenuItem key="polygon" value="polygon">polygon</MenuItem>
              </TextField>
            </div>
            <Button variant="contained" color="primary" type="submit">
              Add
            </Button>
          </form>
      );
    }
  }

  const useStyles = makeStyles(theme => ({
    typography: {
      padding: theme.spacing(2),
    },
  }));
  
function SimplePopover(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
  
    const handleClick = event => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
  
    return (
      <div style={{bottom:0,position:"absolute",left:'300px'}}>
        <Button aria-describedby={id} variant="contained" color="primary" onClick={handleClick}>
          Add label
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Typography className={classes.typography}>
          
          </Typography>
        </Popover>
      </div>
    );
  }