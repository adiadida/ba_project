import Grid from "@mui/material/Grid";
import {Consensus, ConsensusProps} from "@/components/discussionMetrics/Consensus";
import {ConferenceStep, ConferenceStepProps} from "@/components/discussionMetrics/ConferenceStep";
import {Winner, WinnerProps} from "@/components/discussionMetrics/Winner";

export const MetricsGrid = ({rankAcceptabilityIndices, conferenceCounter, alternativeWinner, chanceWinner} :ConsensusProps&ConferenceStepProps&WinnerProps) => {
    return (
        <Grid container direction="row" spacing={2}>
            <Grid size={{xs:12, sm:12, md:4, lg:4}}>
                <Consensus rankAcceptabilityIndices={rankAcceptabilityIndices}></Consensus>
            </Grid>

            <Grid size={{xs:12, sm:12, md:4, lg:4}}>
                <ConferenceStep conferenceCounter={conferenceCounter}/>
            </Grid>

            <Grid size={{xs:12, sm:12, md:4, lg:4}}>
                <Winner alternativeWinner={alternativeWinner} chanceWinner={chanceWinner}/>
            </Grid>
        </Grid>
    )
}