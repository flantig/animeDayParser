import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 5,
    },
    paper: {

        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    paperToday: {
        padding: theme.spacing(2),
        width: 400,
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    image: {
        marginTop: 10,
        padding: theme.spacing(30),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },

}));

export {useStyles};