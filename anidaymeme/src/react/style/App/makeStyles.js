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
    image: {
        padding: theme.spacing(30),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    button: {

    }
}));

export {useStyles};