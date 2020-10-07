import React, {useEffect} from 'react';
import '../style/App/App.css';
import {DateTime} from "luxon";
import { useStyles } from '../style/App/makeStyles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';



function App(props) {
    let colors = ['#322f3d', '#f69649', '#466a9f']
    const [today, setToday] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const classes = useStyles(props);





    return (

        <div style={{backgroundColor: colors[1]}}   className="container">
            <Grid container justify="center" direction="column" alignItems="center" spacing={1} style={{ minHeight: '100vh' }}>
                <Grid item xs={8} >
                    <Paper className={classes.image}>xs=8</Paper>
                </Grid>
                <Grid item xs={8}>
                    <Paper className={classes.paper}>xs=6</Paper>
                    <Paper className={classes.paper} style={{marginTop: 10}}>xs=3</Paper>
                </Grid>

            </Grid>
        </div>

    );
}

export default App;
