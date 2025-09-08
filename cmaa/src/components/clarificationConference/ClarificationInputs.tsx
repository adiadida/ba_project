import Grid from "@mui/material/Grid";
import {ClarificationFooter} from "@/components/clarificationConference/ClarificationFooter";
import {Typography} from "@mui/material";
import {JudgementsDataGrid, JudgementsDataGridProps} from "@/components/clarificationConference/JudgementsDataGrid";
import {PreferencesDataGridProps} from "@/components/clarificationConference/PreferencesDataGrid";

export const ClarificationInputs = ({conferenceCounter, setConferenceCounter, alternativeWinner, chanceWinner, judgementMultiInputs, preferenceMultiInputs}: ClarificationInputsProps&JudgementsDataGridProps&PreferencesDataGridProps) => {
    return (
        <Grid container size={12} padding={4} spacing={2}>

            <Grid container size={12}>
                <Typography>Schritt 2: Ergebnis der Konflikt-Klärung festhalten</Typography>
            </Grid>
            <Grid container size={12} spacing={2}>
                <Grid>
                    <JudgementsDataGrid judgementMultiInputs={judgementMultiInputs}/>
                </Grid>
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