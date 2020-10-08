import React, {useEffect} from 'react';
import '../style/App/App.css';
import {DateTime} from "luxon";
import {useStyles} from '../style/App/makeStyles';
import {Grid, Paper, Button} from '@material-ui/core/';
import {day, dusk, night} from '../style/App/makeTheme';
import {ThemeProvider} from '@material-ui/core/styles'


async function timeofday(time, t1, t2, t3) {

    switch (time) {
        case(time >= 3 && time < 12):
            console.log("day")
            return await t1;
        case (time >= 12 && time < 18):
            console.log("dusk")
            return await t2;
        case (time >= 18 && time < 3):
            console.log("night")
            return await t3;
    }

    return await t1;
}

function App(props) {
    let colors = ['#322f3d', '#f7d6bf', '#466a9f']
    const [today, setToday] = React.useState([]);
    const [time, setTime] = React.useState(timeofday(DateTime.local().hour, day, dusk, night));
    const [loading, setLoading] = React.useState(true);
    const classes = useStyles(props);





    return (


    <ThemeProvider theme={dusk}>
        <div style={{backgroundColor: colors[1]}} className="container">
            <Grid container justify="center" direction="column" alignItems="center" style={{minHeight: '100vh'}}>
                <Grid item xs={8}>
                    <Paper className={classes.paperToday}>{DateTime.local().toFormat('LLLL d')}</Paper>

                </Grid>
                <Grid item xs={8}>
                    <Paper className={classes.image}>Anime Day Image Here</Paper>

                </Grid>
                <Grid item xs={8}>
                    <Button variant="contained" color="secondary" className="submit"
                            style={{marginTop: 10}}>Submit</Button>
                </Grid>
                <Grid item xs={8}>
                    <Button variant="contained" color="secondary" className="random"
                            style={{marginTop: 10}}>Randomize</Button>
                </Grid>

            </Grid>
        </div>
    </ThemeProvider>



    );
}

export default App;
