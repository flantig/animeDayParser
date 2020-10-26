import day from "./day";
import dusk from "./dusk";
import night from "./night";

const themes = {
    day,
    dusk,
    night
}

export default function getTheme(theme){
    return themes[theme]
}