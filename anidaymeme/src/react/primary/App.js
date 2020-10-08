import React, {useContext, useEffect} from 'react';
import '../style/App/App.css';
import {DateTime} from "luxon";
import {useStyles} from '../style/App/makeStyles';
import {Grid, Paper, Button} from '@material-ui/core/';
import {ThemeProvider} from '@material-ui/core/styles';
import day from '../style/App/day';



function App(props) {
    let colors = ['#322f3d', '#f7d6bf', '#466a9f']
    const [today, setToday] = React.useState([]);
    const [time, setTime] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const classes = useStyles(props);




    return (
<ThemeProvider theme={day}>
        <div style={{backgroundColor: colors[1]}} className="container">
            <Grid container justify="center" direction="column" alignItems="center" style={{minHeight: '100vh'}}>
                <Grid item xs={8}>
                    <Paper className={classes.paperToday}>{DateTime.local().toFormat('LLLL d')}</Paper>

                </Grid>
                <Grid item xs={8}>
                    <Paper className={classes.image}>Anime Day Image Here</Paper>

                </Grid>
                <Grid item xs={8}>
                    <Button variant="contained" color="primary" className="submit"
                            style={{marginTop: 10}}>Submit</Button>
                </Grid>
                <Grid item xs={8}>
                    <Button variant="contained" color="primary" className="random"
                            style={{marginTop: 10}}>Randomize</Button>
                </Grid>

            </Grid>
        </div>
</ThemeProvider>
    );
}

export default App;
