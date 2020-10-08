import {createMuiTheme} from '@material-ui/core/styles'


const day = createMuiTheme({

        palette: {
            primary: {main: '#B3CCF2'},
            secondary: {main: '#537DBD'},
        },


    }
);

const dusk = createMuiTheme({


        palette: {
            primary: {main: '#F7D6BF'},
            secondary: {main: '#BDA391'},
        },


    }
);

const night = createMuiTheme({


        palette: {
            primary: {main: '#322f3d'},
            secondary: {main: '#C5B9F0'},
        },

    }
);

export {day, dusk, night};