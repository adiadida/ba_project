import Grid from "@mui/material/Grid";
import {ClarificationFooter} from "@/components/clarificationConference/ClarificationFooter";
import {Typography} from "@mui/material";
import {JudgementsDataGrid, JudgementsDataGridProps} from "@/components/clarificationConference/JudgementsDataGrid";
import {PreferencesDataGrid, PreferencesDataGridProps} from "@/components/clarificationConference/PreferencesDataGrid";

export const ClarificationInputs = ({
                                        conferenceCounter,
                                        setConferenceCounter,
                                        alternativeWinner,
                                        chanceWinner,
                                        handleResend,
                                        judgementMultiInputs,
                                        onJudgementChange,
                                        preferenceMultiInputs,
                                        onPreferenceChange
                                    }: ClarificationInputsProps & JudgementsDataGridProps & PreferencesDataGridProps) => {
    return (
        <Grid container size={12} padding={4} spacing={2}>

            <Grid container size={12}>
                <Typography>Schritt 2: Ergebnis der Konflikt-Klärung festhalten</Typography>
            </Grid>
            <Grid container size={12} spacing={2}>
                <Grid container size={4}>
                    <PreferencesDataGrid preferenceMultiInputs={preferenceMultiInputs}
                                         onPreferenceChange={onPreferenceChange}/>
                </Grid>
                <Grid container size={8}>
                    <JudgementsDataGrid judgementMultiInputs={judgementMultiInputs}
                                        onJudgementChange={onJudgementChange}/>
                </Grid>
            </Grid>
            <Grid container size={12}>
                <ClarificationFooter conferenceCounter={conferenceCounter} setConferenceCounter={setConferenceCounter}
                                     alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}
                                     handleResend={handleResend}/>
            </Grid>
        </Grid>
    )
}

export type ClarificationInputsProps = {
    conferenceCounter: number;
    setConferenceCounter?: (conferenceCounter: number) => void;
    alternativeWinner: number;
    chanceWinner: number;
    handleResend: () => void;
}