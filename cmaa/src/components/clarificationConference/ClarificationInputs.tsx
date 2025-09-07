import Grid from "@mui/material/Grid";
import {ClarificationFooter} from "@/components/clarificationConference/ClarificationFooter";
import {Typography} from "@mui/material";

export const ClarificationInputs = ({conferenceCounter, setConferenceCounter, alternativeWinner, chanceWinner}: ClarificationInputsProps) => {
    return (
        <Grid container size={12} padding={4} spacing={2}>

            <Grid container size={12}>
                <Typography>Schritt 2: Ergebnis der Konflikt-Klärung festhalten</Typography>
            </Grid>
            <Grid container size={12}>
                <ClarificationFooter conferenceCounter={conferenceCounter} setConferenceCounter={setConferenceCounter} alternativeWinner={alternativeWinner} chanceWinner={chanceWinner} />
            </Grid>
        </Grid>
    )
}

export type ClarificationInputsProps = {
    conferenceCounter: number;
    setConferenceCounter?: (conferenceCounter: number) => void;
    alternativeWinner: number;
    chanceWinner: number;
}