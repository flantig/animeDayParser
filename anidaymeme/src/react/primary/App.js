import React, {useContext, useEffect} from 'react';
import '../style/App/App.css';
import {DateTime} from "luxon";
import {useStyles} from '../style/App/makeStyles';
import {Grid, Paper, Button} from '@material-ui/core/';


import {ThemeProvider} from '@material-ui/core/styles'
import ThemeContext from "../../ThemeContext";


async function timeofday() {
    const time = await DateTime.local().hour;

    switch (time) {
        case(time >= 3 && time < 12):
            console.log("day")
            return "day";
        case (time >= 12 && time < 18):
            console.log("dusk")
            return "dusk";
        case (time >= 18 && time < 3):
            console.log("night")
            return "night";
        default:
            return "day";
    }


}

function App(props) {
    let colors = ['#322f3d', '#f7d6bf', '#466a9f']
    const [today, setToday] = React.useState([]);
    const {currentTheme, setTheme} = useContext(ThemeContext);
    const [time, setTime] = React.useState();
    const [loading, setLoading] = React.useState(true);
    const classes = useStyles(props);



    useEffect(() => {
        timeofday(DateTime.local().hour).then(data =>{
            setTime(data);
            console.log(time);
        })
        setLoading(false);
    }, [time])

    return (

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

    );
}

export default App;
