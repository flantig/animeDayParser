import React, {useState, useEffect} from 'react'
import {ThemeProvider} from '@material-ui/core/styles'
import getTheme from './react/style/App/timeSwitch.js'
import context from "./react/context";
import {DateTime} from "luxon";

async function timeofday() {
    const time = await DateTime.local().hour;

    switch (time) {
        case(time >= 3 && time < 12):

            return "day";
        case (time >= 12 && time < 18):

            return "dusk";

        case (time >= 18 && time < 3):

            return "night";
        default:
            return "day";
    }


}


function ThemeContext(props) {
    const [theme, setTheme] = React.useContext(context);
    const [loading, setLoading] = React.useState(true);
    const children = props;

    useEffect(() => {
        timeofday().then(data => {
            setTheme(getTheme(data));
        })
        setLoading(false)
    }, [])

    return (
        <context>
            {loading ? "" : <ThemeProvider theme={theme}>{children}</ThemeProvider>}
        </context>
    )

}

export default ThemeContext;